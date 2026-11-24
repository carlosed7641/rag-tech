
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Nota MVP: el historial de chat solo se persiste para usuarios autenticados
-- (user_id = auth.uid() nunca es verdadero para anónimos). El chat sigue
-- funcionando sin login, solo que esa conversación no se guarda en DB.
create policy "chat_sessions_own" on public.chat_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "chat_messages_own" on public.chat_messages
  for all using (
    exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid())
  );
