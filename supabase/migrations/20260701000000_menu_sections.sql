-- Dynamic menu sections: store managers can add custom sections from the admin portal.

create table if not exists public.menu_sections (
  id text primary key,
  label text not null,
  description text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,
  layout text not null default 'carousel' check (layout in ('system', 'carousel', 'grid')),
  heading_the text,
  heading_big_line1 text,
  heading_big_line2 text,
  heading_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_sections_sort_idx on public.menu_sections (sort_order);

-- Seed the eight built-in sections (must exist before FK on menu_items.section).
insert into public.menu_sections (
  id, label, description, sort_order, is_active, is_system, layout,
  heading_the, heading_big_line1, heading_big_line2, heading_tag
) values
  (
    'seasonal', 'Seasonal',
    'Rotating and limited-time offerings shown in the seasonal strip.',
    10, true, true, 'system',
    'Right Now', 'New &', 'Seasonal', 'Spring 2026 Arrivals'
  ),
  (
    'bestsellers', 'Best sellers',
    'Hero carousel — your highest-velocity flavors and combos.',
    20, true, true, 'system',
    'Customer Favorites', 'Best', 'Sellers', 'Most loved scoops'
  ),
  (
    'coffee', 'Coffee',
    'Espresso bar items; emoji displays on the public menu cards.',
    30, true, true, 'system',
    'Imported from Italy', 'Italian', 'Coffee', 'Beans Flown in from Italy'
  ),
  (
    'pastries', 'New products',
    'Pastries and rotating specials — carousel after Coffee; public title is “New products”.',
    40, true, true, 'system',
    'Just in', 'New', 'Products', 'Pastries · Baked goods · Rotating picks'
  ),
  (
    'drinks', 'Drinks',
    'Beverages and add-ons in the drinks section.',
    50, true, true, 'system',
    'Also Available', 'Drinks', '& More', 'Sparkling · Sodas · Water'
  ),
  (
    'yogurt', 'Yogurt',
    'Frozen yogurt flavors — photo, copy, price, and size lines on the public menu.',
    60, true, true, 'system',
    'Swirled Fresh', 'Frozen', 'Yogurt', 'Tart & soft serve'
  ),
  (
    'gelato', 'Gelato',
    'Cream gelato grid and carousel; filters use tags on each item.',
    70, true, true, 'system',
    'Handcrafted Daily', 'Cream', 'Gelato', '32 Flavors · No Artificial Colors'
  ),
  (
    'sorbet', 'Sorbet',
    'Plant-based and sorbet lineup; vegan flag drives badges.',
    80, true, true, 'system',
    'Dairy-Free', 'Sorbets', '& Vegan', '100% Plant-Based'
  )
on conflict (id) do nothing;

-- Replace hard-coded section enum with FK to menu_sections.
alter table public.menu_items drop constraint if exists menu_items_section_check;

alter table public.menu_items
  drop constraint if exists menu_items_section_fkey;

alter table public.menu_items
  add constraint menu_items_section_fkey
  foreign key (section) references public.menu_sections (id)
  on update cascade
  on delete restrict;

alter table public.menu_sections enable row level security;

-- Public read: active sections only (anon + authenticated for public menu).
drop policy if exists "menu_sections_public_select" on public.menu_sections;
create policy "menu_sections_public_select"
  on public.menu_sections for select
  to anon, authenticated
  using (is_active = true);

-- Staff: read all rows including inactive (admin UI).
drop policy if exists "menu_sections_authenticated_select" on public.menu_sections;
create policy "menu_sections_authenticated_select"
  on public.menu_sections for select
  to authenticated
  using (true);

-- Owners and managers may create / update / delete custom sections.
drop policy if exists "menu_sections_editor_insert" on public.menu_sections;
create policy "menu_sections_editor_insert"
  on public.menu_sections for insert
  to authenticated
  with check (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  );

drop policy if exists "menu_sections_editor_update" on public.menu_sections;
create policy "menu_sections_editor_update"
  on public.menu_sections for update
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

drop policy if exists "menu_sections_editor_delete" on public.menu_sections;
create policy "menu_sections_editor_delete"
  on public.menu_sections for delete
  to authenticated
  using (
    is_system = false
    and exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  );
