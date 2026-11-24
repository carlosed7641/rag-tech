-- Los administradores no pueden comprar.
--
-- La UI ya oculta/deshabilita las compras para admins, pero esa es solo la
-- capa visual: create_order se puede llamar directo por la API REST con la
-- sesión del admin. Este trigger hace cumplir la regla en la base de datos,
-- para cualquier camino que inserte en `orders` (create_order incluida).
--
-- Solo afecta órdenes NUEVAS; las existentes no se tocan.

create or replace function public.prevent_admin_orders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.profiles
    where id = new.user_id
      and role = 'admin'
  ) then
    raise exception 'Las cuentas de administrador no pueden realizar compras.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_prevent_admin on public.orders;

create trigger orders_prevent_admin
  before insert on public.orders
  for each row
  execute function public.prevent_admin_orders();
