-- Índice HNSW para búsqueda semántica por coseno sobre products.embedding
create index if not exists products_embedding_hnsw_idx
  on public.products
  using hnsw (embedding extensions.vector_cosine_ops);

-- Función de búsqueda vectorial usada por la tool search_products_semantic
-- del chat. Solo devuelve productos activos; filtros opcionales para poder
-- combinarse con search_products_by_attributes en la misma pregunta.
create or replace function public.match_products(
  query_embedding extensions.vector(1024),
  match_count int default 8,
  filter_max_price numeric default null,
  filter_min_price numeric default null,
  filter_category text default null
)
returns table (
  id uuid,
  name text,
  slug text,
  price numeric,
  compare_at_price numeric,
  description text,
  material text,
  images text[],
  stock int,
  similarity float
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    p.id,
    p.name,
    p.slug,
    p.price,
    p.compare_at_price,
    p.description,
    p.material,
    p.images,
    p.stock,
    1 - (p.embedding <=> query_embedding) as similarity
  from products p
  left join categories c on c.id = p.category_id
  where p.is_active = true
    and p.embedding is not null
    and (filter_max_price is null or p.price <= filter_max_price)
    and (filter_min_price is null or p.price >= filter_min_price)
    and (filter_category is null or c.slug = filter_category)
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_products(extensions.vector, int, numeric, numeric, text) to authenticated, anon;
