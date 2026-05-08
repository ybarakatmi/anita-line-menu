-- Operator-submitted IT / support tickets from the admin Settings page.
-- Owner reads tickets via Supabase dashboard (or future owner-only console view).

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_created_at_idx
  on public.support_tickets (created_at desc);

create index if not exists support_tickets_user_id_idx
  on public.support_tickets (user_id);

alter table public.support_tickets enable row level security;

-- Authenticated users may file a ticket on their own behalf only.
drop policy if exists "support_tickets_owner_insert" on public.support_tickets;
create policy "support_tickets_owner_insert"
  on public.support_tickets for insert
  to authenticated
  with check (user_id = auth.uid());

-- Authenticated users may read their own tickets (so we can show "your recent
-- tickets" later if we want). The dev/owner reads everything via service role
-- in the Supabase dashboard.
drop policy if exists "support_tickets_owner_select" on public.support_tickets;
create policy "support_tickets_owner_select"
  on public.support_tickets for select
  to authenticated
  using (user_id = auth.uid());
