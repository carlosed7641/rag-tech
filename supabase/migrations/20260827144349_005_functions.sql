
-- Crea una orden de forma atómica: valida stock con lock de fila, aplica cupón,
-- inserta orden + items, y descuenta inventario. Evita sobreventa en checkouts concurrentes.
create or replace function public.create_order(
  p_items jsonb, -- [{ "product_id": "...", "quantity": 2 }, ...]
  p_shipping_address jsonb,
  p_coupon_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_total numeric(10,2);
  v_item record;
  v_product record;
  v_coupon record;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para completar la compra';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  v_order_id := gen_random_uuid();

  -- Tabla temporal con los items ya validados y a precio de servidor
  create temporary table _order_items (
    product_id uuid,
    product_name text,
    quantity int,
    unit_price numeric(10,2)
  ) on commit drop;

  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    if v_item.quantity <= 0 then
      raise exception 'Cantidad inválida para el producto %', v_item.product_id;
    end if;

    -- Lock de fila: bloquea concurrencia hasta el commit, evitando sobreventa
    select * into v_product from public.products
      where id = v_item.product_id and is_active
      for update;

    if not found then
      raise exception 'Producto % no disponible', v_item.product_id;
    end if;

    if v_product.stock < v_item.quantity then
      raise exception 'Stock insuficiente para "%": quedan %, se pidieron %',
        v_product.name, v_product.stock, v_item.quantity;
    end if;

    insert into _order_items (product_id, product_name, quantity, unit_price)
    values (v_product.id, v_product.name, v_item.quantity, v_product.price);

    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);

    update public.products set stock = stock - v_item.quantity where id = v_product.id;
  end loop;

  if p_coupon_code is not null then
    select * into v_coupon from public.coupons
      where code = p_coupon_code and is_active
      for update;

    if not found then
      raise exception 'Cupón inválido';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Cupón expirado';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Cupón agotado';
    end if;
    if v_subtotal < v_coupon.min_subtotal then
      raise exception 'El subtotal no alcanza el mínimo del cupón (%)', v_coupon.min_subtotal;
    end if;

    if v_coupon.type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.value / 100, 2);
    else
      v_discount := least(v_coupon.value, v_subtotal);
    end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  v_total := v_subtotal - v_discount;

  insert into public.orders (id, user_id, status, subtotal, discount, total, shipping_address, coupon_code)
  values (v_order_id, v_user_id, 'pending', v_subtotal, v_discount, v_total, p_shipping_address, p_coupon_code);

  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
  select v_order_id, product_id, product_name, quantity, unit_price from _order_items;

  return v_order_id;
end;
$$;

-- Búsqueda semántica para la tool de chat search_products_semantic
create or replace function public.match_products(
  query_embedding vector(1024),
  match_count int default 8,
  filter_max_price numeric default null
)
returns table (
  id uuid,
  name text,
  price numeric,
  description text,
  similarity float
)
language sql
stable
as $$
  select p.id, p.name, p.price, p.description,
         1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  where p.is_active
    and p.embedding is not null
    and (filter_max_price is null or p.price <= filter_max_price)
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
