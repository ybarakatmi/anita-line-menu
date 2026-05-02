-- Sample New products (section pastries): ensure up to five starter items without duplicating names

insert into public.menu_items
  (section, name, description, price_display, emoji, image_url, tags, badge, is_new, is_fave, is_vegan, sort_order, is_active)
select v.section, v.name, v.description, v.price_display, v.emoji, v.image_url, v.tags, v.badge, v.is_new, v.is_fave, v.is_vegan, v.sort_order, v.is_active
from (
  values
    ('pastries', 'Butter Croissant', 'Flaky layers, baked fresh each morning.', '$4.50', '🥐', null, '{}'::text[], null::text, true, false, false, 0, true),
    ('pastries', 'Pain au Chocolat', 'Classic chocolate-filled viennoiserie.', '$5.00', '🍫', null, '{}'::text[], null::text, false, false, false, 1, true),
    ('pastries', 'Berry Danish', 'Seasonal fruit and cream cheese.', '$5.50', '🫐', null, '{}'::text[], null::text, false, false, false, 2, true),
    ('pastries', 'Cinnamon Morning Bun', 'Soft bun with cinnamon swirl and light glaze.', '$5.25', '🧁', null, '{}'::text[], null::text, true, false, false, 3, true),
    ('pastries', 'Ham & Cheese Croissant', 'Savory croissant with ham and Swiss.', '$6.50', '🥖', null, '{}'::text[], null::text, false, false, false, 4, true)
) as v(section, name, description, price_display, emoji, image_url, tags, badge, is_new, is_fave, is_vegan, sort_order, is_active)
where not exists (
  select 1 from public.menu_items m where m.section = 'pastries' and m.name = v.name
);

update public.menu_items
set description = 'Flaky layers, baked fresh each morning.'
where section = 'pastries' and name = 'Butter Croissant' and description = 'Flaky layers, baked fresh.';
