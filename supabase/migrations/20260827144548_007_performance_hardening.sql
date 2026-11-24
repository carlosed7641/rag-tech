
-- Índices de cobertura para foreign keys
create index addresses_user_id_idx on public.addresses (user_id);
create index cart_items_product_id_idx on public.cart_items (product_id);
create index categories_parent_id_idx on public.categories (parent_id);
create index chat_messages_session_id_idx on public.chat_messages (session_id);
create index chat_sessions_user_id_idx on public.chat_sessions (user_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
create index orders_user_id_idx on public.orders (user_id);

-- Envolver auth.uid()/is_admin() en (select ...) evita re-evaluarlo en cada fila
drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using ((select auth.uid()) = id or (select public.is_admin()));

drop policy "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using ((select auth.uid()) = id or (select public.is_admin()));

drop policy "addresses_own" on public.addresses;
create policy "addresses_own" on public.addresses
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "carts_own" on public.carts;
create policy "carts_own" on public.carts
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "cart_items_own" on public.cart_items;
create policy "cart_items_own" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid()))
  );

drop policy "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update using ((select public.is_admin()));

drop policy "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

drop policy "chat_sessions_own" on public.chat_sessions;
create policy "chat_sessions_own" on public.chat_sessions
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "chat_messages_own" on public.chat_messages;
create policy "chat_messages_own" on public.chat_messages
  for all using (
    exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
  );

-- Separar las políticas "for all" de admin en comandos concretos: evita que
-- SELECT tenga que evaluar dos políticas permisivas a la vez (la de lectura
-- pública y la de admin).
drop policy "categories_write_admin" on public.categories;
create policy "categories_insert_admin" on public.categories
  for insert with check ((select public.is_admin()));
create policy "categories_update_admin" on public.categories
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories_delete_admin" on public.categories
  for delete using ((select public.is_admin()));

drop policy "products_write_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert with check ((select public.is_admin()));
create policy "products_update_admin" on public.products
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products_delete_admin" on public.products
  for delete using ((select public.is_admin()));

drop policy "coupons_write_admin" on public.coupons;
create policy "coupons_insert_admin" on public.coupons
  for insert with check ((select public.is_admin()));
create policy "coupons_update_admin" on public.coupons
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "coupons_delete_admin" on public.coupons
  for delete using ((select public.is_admin()));
