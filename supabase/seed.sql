-- Optional seed after migration. Run in Supabase SQL editor or `psql`.
-- Truncates menu items and inserts a starter set (matches local fallback sample).

delete from public.menu_items;

insert into public.menu_items
  (section, name, description, price_display, emoji, image_url, tags, badge, is_new, is_fave, is_vegan, sort_order, is_active)
values
  ('seasonal', 'Pavlova & Mixed Berries', 'Cream-base with mixed berries & meringues.', null, null, '/images/flavors/pavlova-and-mixed-berries.png', '{}', 'Seasonal', false, false, false, 0, true),
  ('seasonal', 'Macadamia Cream', 'Macadamia flavored gelato with macadamia cream & caramelized macadamia nuts.', null, null, '/images/flavors/macadamia-cream.png', '{}', 'Seasonal', false, false, false, 1, true),
  ('seasonal', 'Pistachio', 'A blend of real pistachios.', null, null, '/images/flavors/pistachio.png', '{}', 'Seasonal', false, true, false, 2, true),
  ('bestsellers', 'Pistachio', 'A blend of real pistachios.', 'from $7', null, '/images/flavors/pistachio.png', array['nut']::text[], null, false, true, false, 0, true),
  ('bestsellers', 'Salted Caramel', 'Caramel flavored gelato with salt and toffee cream.', 'from $7', null, '/images/flavors/salted-caramel.png', array['choc']::text[], null, false, true, false, 1, true),
  ('coffee', 'Espresso', 'Pure Italian single or double shot.', '$3.50', '☕', null, '{}', null, false, false, false, 0, true),
  ('coffee', 'Affogato', 'Vanilla gelato drowned in a hot espresso shot.', '$7.00', '🫧', null, '{}', null, false, false, false, 5, true),
  ('pastries', 'Butter Croissant', 'Flaky layers, baked fresh each morning.', '$4.50', '🥐', null, '{}', null, true, false, false, 0, true),
  ('pastries', 'Pain au Chocolat', 'Classic chocolate-filled viennoiserie.', '$5.00', '🍫', null, '{}', null, false, false, false, 1, true),
  ('pastries', 'Berry Danish', 'Seasonal fruit and cream cheese.', '$5.50', '🫐', null, '{}', null, false, false, false, 2, true),
  ('pastries', 'Cinnamon Morning Bun', 'Soft bun with cinnamon swirl and light glaze.', '$5.25', '🧁', null, '{}', null, true, false, false, 3, true),
  ('pastries', 'Ham & Cheese Croissant', 'Savory croissant with ham and Swiss.', '$6.50', '🥖', null, '{}', null, false, false, false, 4, true),
  ('drinks', 'Italian Sparkling Water', 'San Pellegrino — the perfect palate cleanser.', '$3.00', '🫧', null, '{}', null, false, false, false, 0, true),
  ('yogurt', 'Plain Tart', 'Classic tart frozen yogurt — bright, tangy, and refreshing.', 'from $5', null, null, '{}', null, false, false, false, 0, true),
  ('yogurt', 'Vanilla Soft Serve', 'Creamy Madagascar vanilla soft serve.', 'from $5', null, null, '{}', null, false, false, false, 1, true),
  ('gelato', 'Chocolate', 'Luxurious milk chocolate.', 'from $7', null, '/images/flavors/chocolate.png', array['choc']::text[], null, false, false, false, 0, true),
  ('gelato', 'Pavlova & Mixed Berries', 'Cream-base with mixed berries & meringues.', 'from $7', null, '/images/flavors/pavlova-and-mixed-berries.png', array['new','fruit']::text[], null, true, false, false, 1, true),
  ('sorbet', 'Coconut Sorbet', 'Sorbet based on coconut milk and coconut pieces.', 'from $7', null, '/images/flavors/coconut-sorbet.png', array['fruit']::text[], null, false, false, true, 0, true);
