-- Upgrade legacy menu_sections schema (nav_order / is_enabled / section_labels)
-- to the dynamic sections schema used by the admin portal.

alter table public.menu_sections add column if not exists description text not null default '';
alter table public.menu_sections add column if not exists sort_order int not null default 0;
alter table public.menu_sections add column if not exists is_active boolean not null default true;
alter table public.menu_sections add column if not exists is_system boolean not null default false;
alter table public.menu_sections add column if not exists heading_the text;
alter table public.menu_sections add column if not exists heading_big_line1 text;
alter table public.menu_sections add column if not exists heading_big_line2 text;
alter table public.menu_sections add column if not exists heading_tag text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'menu_sections' and column_name = 'nav_order'
  ) then
    update public.menu_sections set
      sort_order = (nav_order + 1) * 10,
      is_active = is_enabled,
      is_system = id in ('seasonal','bestsellers','coffee','pastries','drinks','yogurt','gelato','sorbet'),
      heading_the = section_labels->>'the',
      heading_big_line1 = section_labels->>'big_line1',
      heading_big_line2 = section_labels->>'big_line2',
      heading_tag = section_labels->>'tag';
  end if;
end $$;

alter table public.menu_sections drop constraint if exists menu_sections_layout_check;

update public.menu_sections
set layout = 'system'
where id in ('seasonal','bestsellers','coffee','pastries','drinks','yogurt','gelato','sorbet');

update public.menu_sections
set layout = 'grid'
where layout = 'drinks_grid';

update public.menu_sections
set layout = 'carousel'
where layout in ('carousel_cards', 'seasonal_grid', 'swiper_popout', 'coffee_list');

update public.menu_sections set description = 'Rotating and limited-time offerings shown in the seasonal strip.' where id = 'seasonal';
update public.menu_sections set description = 'Hero carousel — your highest-velocity flavors and combos.' where id = 'bestsellers';
update public.menu_sections set description = 'Espresso bar items; emoji displays on the public menu cards.' where id = 'coffee';
update public.menu_sections set description = 'Pastries and rotating specials — carousel after Coffee.' where id = 'pastries';
update public.menu_sections set description = 'Beverages and add-ons in the drinks section.' where id = 'drinks';
update public.menu_sections set description = 'Frozen yogurt flavors on the public menu.' where id = 'yogurt';
update public.menu_sections set description = 'Cream gelato grid and carousel; filters use tags on each item.' where id = 'gelato';
update public.menu_sections set description = 'Plant-based and sorbet lineup; vegan flag drives badges.' where id = 'sorbet';

-- Drop legacy RLS policies that reference is_enabled before dropping that column.
drop policy if exists "menu_sections_public_select" on public.menu_sections;
drop policy if exists "menu_sections_authenticated_select" on public.menu_sections;
drop policy if exists "menu_sections_editor_insert" on public.menu_sections;
drop policy if exists "menu_sections_editor_update" on public.menu_sections;
drop policy if exists "menu_sections_editor_delete" on public.menu_sections;
drop policy if exists "menu_sections_authenticated_delete" on public.menu_sections;
drop policy if exists "menu_sections_authenticated_insert" on public.menu_sections;
drop policy if exists "menu_sections_authenticated_select_all" on public.menu_sections;
drop policy if exists "menu_sections_authenticated_update" on public.menu_sections;

alter table public.menu_sections drop column if exists nav_order;
alter table public.menu_sections drop column if exists is_enabled;
alter table public.menu_sections drop column if exists section_labels;

alter table public.menu_sections
  add constraint menu_sections_layout_check
  check (layout in ('system', 'carousel', 'grid'));

create index if not exists menu_sections_sort_idx on public.menu_sections (sort_order);

-- Ensure built-in rows exist with new columns (idempotent)
insert into public.menu_sections (
  id, label, description, sort_order, is_active, is_system, layout,
  heading_the, heading_big_line1, heading_big_line2, heading_tag
) values
  ('seasonal', 'Seasonal', 'Rotating and limited-time offerings shown in the seasonal strip.', 10, true, true, 'system', 'Right Now', 'New &', 'Seasonal', 'Spring 2026 Arrivals'),
  ('bestsellers', 'Best sellers', 'Hero carousel — your highest-velocity flavors and combos.', 20, true, true, 'system', 'Customer Favorites', 'Best', 'Sellers', 'Most loved scoops'),
  ('coffee', 'Coffee', 'Espresso bar items; emoji displays on the public menu cards.', 30, true, true, 'system', 'Imported from Italy', 'Italian', 'Coffee', 'Beans Flown in from Italy'),
  ('pastries', 'New products', 'Pastries and rotating specials — carousel after Coffee.', 40, true, true, 'system', 'Just in', 'New', 'Products', 'Pastries · Baked goods · Rotating picks'),
  ('drinks', 'Drinks', 'Beverages and add-ons in the drinks section.', 50, true, true, 'system', 'Also Available', 'Drinks', '& More', 'Sparkling · Sodas · Water'),
  ('yogurt', 'Yogurt', 'Frozen yogurt flavors on the public menu.', 60, true, true, 'system', 'Swirled Fresh', 'Frozen', 'Yogurt', 'Tart & soft serve'),
  ('gelato', 'Gelato', 'Cream gelato grid and carousel; filters use tags on each item.', 70, true, true, 'system', 'Handcrafted Daily', 'Cream', 'Gelato', '32 Flavors · No Artificial Colors'),
  ('sorbet', 'Sorbet', 'Plant-based and sorbet lineup; vegan flag drives badges.', 80, true, true, 'system', 'Dairy-Free', 'Sorbets', '& Vegan', '100% Plant-Based')
on conflict (id) do nothing;

alter table public.menu_items drop constraint if exists menu_items_section_check;
alter table public.menu_items drop constraint if exists menu_items_section_fkey;
alter table public.menu_items
  add constraint menu_items_section_fkey
  foreign key (section) references public.menu_sections (id)
  on update cascade
  on delete restrict;

alter table public.menu_sections enable row level security;

create policy "menu_sections_public_select"
  on public.menu_sections for select
  to anon, authenticated
  using (is_active = true);

create policy "menu_sections_authenticated_select"
  on public.menu_sections for select
  to authenticated
  using (true);

create policy "menu_sections_editor_insert"
  on public.menu_sections for insert
  to authenticated
  with check (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid() and p.role in ('owner', 'manager')
    )
  );

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
