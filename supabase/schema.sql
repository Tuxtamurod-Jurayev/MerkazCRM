create table if not exists public.crm_snapshots (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.crm_snapshots enable row level security;

drop policy if exists "Allow snapshot read/write for anon" on public.crm_snapshots;
create policy "Allow snapshot read/write for anon"
on public.crm_snapshots
for all
to anon, authenticated
using (true)
with check (true);
