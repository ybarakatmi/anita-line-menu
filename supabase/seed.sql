-- Optional seed after migration. Run in Supabase SQL editor or `psql`.
-- Truncates menu items and inserts a starter set (matches local fallback sample).

delete from public.menu_items;

insert into public.menu_items
  (section, name, description, price_display, emoji, image_url, tags, badge, is_new, is_fave, is_vegan, sort_order, is_active)
values
  ('seasonal', 'Pavlova & Mixed Berries', 'Spring 2026 arrival — meringue with fresh berries.', null, null, null, '{}', 'New', true, false, false, 0, true),
  ('seasonal', 'Macadamia', 'New arrival — buttery macadamia with caramel.', null, null, null, '{}', 'New', true, false, false, 1, true),
  ('seasonal', 'Pistachio', 'Our most loved flavor. 100% pure Sicilian paste.', null, null, null, '{}', 'Fan Fave', false, true, false, 2, true),
  ('bestsellers', 'Pistachio', '100% pure Sicilian pistachio paste.', 'from $7', null, null, array['nut']::text[], null, false, true, false, 0, true),
  ('bestsellers', 'Salted Caramel', 'Buttery caramel with a touch of sea salt.', 'from $7', null, null, array['choc']::text[], null, false, true, false, 1, true),
  ('coffee', 'Espresso', 'Pure Italian single or double shot.', '$3.50', '☕', null, '{}', null, false, false, false, 0, true),
  ('coffee', 'Affogato', 'Vanilla gelato drowned in a hot espresso shot.', '$7.00', '🫧', null, '{}', null, false, false, false, 5, true),
  ('pastries', 'Butter Croissant', 'Flaky layers, baked fresh.', '$4.50', '🥐', null, '{}', null, true, false, false, 0, true),
  ('pastries', 'Pain au Chocolat', 'Classic chocolate-filled viennoiserie.', '$5.00', '🍫', null, '{}', null, false, false, false, 1, true),
  ('drinks', 'Italian Sparkling Water', 'San Pellegrino — the perfect palate cleanser.', '$3.00', '🫧', null, '{}', null, false, false, false, 0, true),
  ('gelato', 'Belgian Chocolate', 'Deep, rich Belgian dark chocolate.', 'from $7', null, null, array['choc']::text[], null, false, false, false, 0, true),
  ('gelato', 'Pavlova & Mixed Berries', 'Meringue cream with a fresh mixed berry compote.', 'from $7', null, null, array['new','fruit']::text[], null, true, false, false, 1, true),
  ('sorbet', 'VEGAN — Strawberry', 'Fresh strawberry sorbet. Dairy-free.', 'from $7', null, null, array['fruit']::text[], null, false, false, true, 0, true);
