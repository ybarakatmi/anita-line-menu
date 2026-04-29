-- Anita line menu — schema, RLS, storage policies

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  ticker_segments text[] not null default array[
    'New & Seasonal Flavors',
    '35+ Artisan Gelato Flavors',
    'Italian Coffee',
    'Frozen Yogurt',
    '160+ Locations Worldwide'
  ],
  seasonal_tagline text default 'Spring 2026 Arrivals',
  hero_eyebrow text default 'Tarzana · Los Angeles',
  updated_at timestamptz default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (
    section in (
      'seasonal',
      'bestsellers',
      'gelato',
      'sorbet',
      'coffee',
      'drinks'
    )
  ),
  name text not null,
  description text,
  price_display text,
  emoji text,
  image_url text,
  tags text[] not null default '{}',
  badge text,
  is_new boolean not null default false,
  is_fave boolean not null default false,
  is_vegan boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true,
  promo_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_section_sort_idx
  on public.menu_items (section, sort_order);

alter table public.site_settings enable row level security;
alter table public.menu_items enable row level security;

-- Public read: active menu items only (anon)
create policy "menu_items_anon_select"
  on public.menu_items for select
  to anon
  using (is_active = true);

-- Staff: read all rows including inactive (admin UI)
create policy "menu_items_authenticated_select"
  on public.menu_items for select
  to authenticated
  using (true);

-- Staff: insert / update / delete
create policy "menu_items_authenticated_insert"
  on public.menu_items for insert
  to authenticated
  with check (true);

create policy "menu_items_authenticated_update"
  on public.menu_items for update
  to authenticated
  using (true)
  with check (true);

create policy "menu_items_authenticated_delete"
  on public.menu_items for delete
  to authenticated
  using (true);

create policy "site_settings_public_select"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings_authenticated_update"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

-- Storage bucket (create in dashboard or via SQL)
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "menu_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'menu-images');

create policy "menu_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-images');

create policy "menu_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-images')
  with check (bucket_id = 'menu-images');

create policy "menu_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-images');

-- Enable Realtime for menu_items (ignore if already member of publication)
do $realtime$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'menu_items' and schemaname = 'public'
  ) then
    alter publication supabase_realtime add table public.menu_items;
  end if;
end
$realtime$;
