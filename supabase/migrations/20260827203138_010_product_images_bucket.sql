
-- Bucket público para imágenes de producto: lectura pública, escritura solo admin.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_read_all"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "product_images_write_admin"
on storage.objects for insert
to public
with check (bucket_id = 'product-images' and (select is_admin()));

create policy "product_images_update_admin"
on storage.objects for update
to public
using (bucket_id = 'product-images' and (select is_admin()))
with check (bucket_id = 'product-images' and (select is_admin()));

create policy "product_images_delete_admin"
on storage.objects for delete
to public
using (bucket_id = 'product-images' and (select is_admin()));
