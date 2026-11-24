
alter extension vector set schema extensions;
alter extension pg_trgm set schema extensions;
alter extension moddatetime set schema extensions;

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
set search_path = public, extensions
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

revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.create_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.create_order(jsonb, jsonb, text) to authenticated;
