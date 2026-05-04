-- Sample frozen yogurt (section yogurt): add Plain Tart + Vanilla Soft Serve when missing (matches seed.sql).

insert into public.menu_items
  (section, name, description, price_display, emoji, image_url, tags, badge, is_new, is_fave, is_vegan, sort_order, is_active)
select v.section, v.name, v.description, v.price_display, v.emoji, v.image_url, v.tags, v.badge, v.is_new, v.is_fave, v.is_vegan, v.sort_order, v.is_active
from (
  values
    ('yogurt', 'Plain Tart', 'Classic tart frozen yogurt — bright, tangy, and refreshing.', 'from $5', null, null, '{}'::text[], null::text, false, false, false, 0, true),
    ('yogurt', 'Vanilla Soft Serve', 'Creamy Madagascar vanilla soft serve.', 'from $5', null, null, '{}'::text[], null::text, false, false, false, 1, true)
) as v(section, name, description, price_display, emoji, image_url, tags, badge, is_new, is_fave, is_vegan, sort_order, is_active)
where not exists (
  select 1 from public.menu_items m where m.section = 'yogurt' and m.name = v.name
);
