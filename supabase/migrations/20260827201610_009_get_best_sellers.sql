
-- Agrega ventas por producto a través de todas las órdenes (no solo las del
-- usuario que llama) — necesita SECURITY DEFINER porque RLS de orders/order_items
-- restringe a "mis propias órdenes". Solo expone filas de products (ya públicas
-- vía su propia política), nunca datos de orders/order_items directamente.
create or replace function public.get_best_sellers(result_limit int default 4)
returns setof products
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from products p
  join (
    select oi.product_id, sum(oi.quantity) as total_qty
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.status <> 'cancelled' and oi.product_id is not null
    group by oi.product_id
    order by total_qty desc
    limit result_limit
  ) top on top.product_id = p.id
  where p.is_active
  order by top.total_qty desc;
$$;

revoke execute on function public.get_best_sellers(int) from public;
grant execute on function public.get_best_sellers(int) to anon, authenticated;
