
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  material text,
  tags text[] not null default '{}',
  images text[] not null default '{}',
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  embedding vector(1024),
  embedding_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.products
  for each row execute procedure moddatetime(updated_at);

-- Índices para el buscador rápido, filtros de la tool de chat, y búsqueda semántica
create index products_price_idx on public.products (price);
create index products_category_id_idx on public.products (category_id);
create index products_is_active_idx on public.products (is_active);
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index products_tags_gin_idx on public.products using gin (tags);
create index products_embedding_hnsw_idx on public.products using hnsw (embedding vector_cosine_ops);

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "categories_select_all" on public.categories
  for select using (true);
create policy "categories_write_admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "products_select_active_or_admin" on public.products
  for select using (is_active or public.is_admin());
create policy "products_write_admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
