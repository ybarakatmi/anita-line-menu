-- Public footer contact form → staff review in admin

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  phone text,
  country text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- Anonymous visitors can submit (matches MenuBoard insert from public site)
drop policy if exists "contact_submissions_anon_insert" on public.contact_submissions;
create policy "contact_submissions_anon_insert"
  on public.contact_submissions for insert
  to anon
  with check (true);

-- Signed-in staff only (admin portal)
drop policy if exists "contact_submissions_authenticated_select" on public.contact_submissions;
create policy "contact_submissions_authenticated_select"
  on public.contact_submissions for select
  to authenticated
  using (true);
