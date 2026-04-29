-- Console operators: roles, team list, and menu write access

create table if not exists public.console_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  role text not null default 'viewer' check (role in ('owner', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists console_profiles_role_idx on public.console_profiles (role);

-- New auth users: first account is owner; later accounts use console_role from user metadata (invites)
create or replace function public.handle_console_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_count int;
  intended text;
begin
  select count(*)::int into member_count from public.console_profiles;

  intended := lower(coalesce(new.raw_user_meta_data->>'console_role', ''));
  if intended not in ('owner', 'manager', 'viewer') then
    intended := 'viewer';
  end if;

  insert into public.console_profiles (user_id, email, role)
  values (
    new.id,
    coalesce(new.email, ''),
    case when member_count = 0 then 'owner' else intended end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_console_profile on auth.users;
create trigger on_auth_user_created_console_profile
  after insert on auth.users
  for each row
  execute procedure public.handle_console_profile_on_signup();

create or replace function public.sync_console_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.console_profiles
  set email = coalesce(new.email, email), updated_at = now()
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_console_email on auth.users;
create trigger on_auth_user_updated_console_email
  after update of email on auth.users
  for each row
  execute procedure public.sync_console_profile_email();

-- Backfill existing auth users (one-time); franchise owner can adjust roles afterward
insert into public.console_profiles (user_id, email, role)
select u.id, coalesce(u.email, ''), 'owner'::text
from auth.users u
where not exists (select 1 from public.console_profiles p where p.user_id = u.id);

alter table public.console_profiles enable row level security;

drop policy if exists "console_profiles_select" on public.console_profiles;
create policy "console_profiles_select"
  on public.console_profiles for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.console_profiles o
      where o.user_id = auth.uid() and o.role = 'owner'
    )
  );

drop policy if exists "console_profiles_owner_update" on public.console_profiles;
create policy "console_profiles_owner_update"
  on public.console_profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.console_profiles o
      where o.user_id = auth.uid() and o.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.console_profiles o
      where o.user_id = auth.uid() and o.role = 'owner'
    )
  );

-- Menu writes: owners and managers only
drop policy if exists "menu_items_authenticated_insert" on public.menu_items;
drop policy if exists "menu_items_authenticated_update" on public.menu_items;
drop policy if exists "menu_items_authenticated_delete" on public.menu_items;

create policy "menu_items_editor_insert"
  on public.menu_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  );

create policy "menu_items_editor_update"
  on public.menu_items for update
  to authenticated
  using (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  );

create policy "menu_items_editor_delete"
  on public.menu_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  );

-- Site copy stays in the database for the public page, but only owners may change it from the API
drop policy if exists "site_settings_authenticated_update" on public.site_settings;

create policy "site_settings_owner_update"
  on public.site_settings for update
  to authenticated
  using (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role = 'owner'
    )
  );
