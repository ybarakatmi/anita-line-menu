-- Point gelato / sorbet / bestsellers / seasonal rows at same-origin flavor art
-- (served from Next.js `public/images/flavors/<slug>.png`; see `lib/flavor-image.ts`).

UPDATE public.menu_items SET image_url = '/images/flavors/pistachio.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Pistachio';

UPDATE public.menu_items SET image_url = '/images/flavors/chocolate.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Chocolate';

UPDATE public.menu_items SET image_url = '/images/flavors/black-forest.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Black Forest';

UPDATE public.menu_items SET image_url = '/images/flavors/strawberry.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Strawberry';

UPDATE public.menu_items SET image_url = '/images/flavors/cookieman.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Cookieman';

UPDATE public.menu_items SET image_url = '/images/flavors/mango.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Mango';

UPDATE public.menu_items SET image_url = '/images/flavors/pavlova-and-mixed-berries.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Pavlova & Mixed Berries';

UPDATE public.menu_items SET image_url = '/images/flavors/macadamia-cream.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Macadamia Cream';

UPDATE public.menu_items SET image_url = '/images/flavors/chocolate-and-hazelnut.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Chocolate & Hazelnut';

UPDATE public.menu_items SET image_url = '/images/flavors/chocolate-caramel-and-almonds.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Chocolate Caramel and Almonds';

UPDATE public.menu_items SET image_url = '/images/flavors/milk-chocolate-pretzel.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Milk Chocolate Pretzel';

UPDATE public.menu_items SET image_url = '/images/flavors/white-chocolate-and-cookies.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'White Chocolate & Cookies';

UPDATE public.menu_items SET image_url = '/images/flavors/nougat-wafer.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Nougat Wafer';

UPDATE public.menu_items SET image_url = '/images/flavors/white-chocolate-and-nougat-wafers.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'White Chocolate & Nougat Wafers';

UPDATE public.menu_items SET image_url = '/images/flavors/vanilla.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Vanilla';

UPDATE public.menu_items SET image_url = '/images/flavors/white-chocolate-and-pistachio-cream.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'White Chocolate & Pistachio Cream';

UPDATE public.menu_items SET image_url = '/images/flavors/salted-cashew.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Salted Cashew';

UPDATE public.menu_items SET image_url = '/images/flavors/mint-chocolate.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Mint Chocolate';

UPDATE public.menu_items SET image_url = '/images/flavors/strawberry-mascarpone-and-ricotta.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Strawberry Mascarpone & Ricotta';

UPDATE public.menu_items SET image_url = '/images/flavors/cheesecake-caramel-cookies.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Cheesecake Caramel Cookies';

UPDATE public.menu_items SET image_url = '/images/flavors/chocolate-nut-cream.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Chocolate Nut Cream';

UPDATE public.menu_items SET image_url = '/images/flavors/creme-brulee-pistachio-crumble.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Crème Brulee Pistachio Crumble';

UPDATE public.menu_items SET image_url = '/images/flavors/hazelnut-mousse-and-chocolate-crunch.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Hazelnut Mousse & Chocolate Crunch';

UPDATE public.menu_items SET image_url = '/images/flavors/white-chocolate-espresso.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'White Chocolate Espresso';

UPDATE public.menu_items SET image_url = '/images/flavors/salted-caramel.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Salted Caramel';

UPDATE public.menu_items SET image_url = '/images/flavors/biscuit-cake.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Biscuit Cake';

UPDATE public.menu_items SET image_url = '/images/flavors/vegan-cookie-and-cream.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Vegan Cookie & Cream';

UPDATE public.menu_items SET image_url = '/images/flavors/no-sugar-added-coffee.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'No Sugar Added Coffee';

UPDATE public.menu_items SET image_url = '/images/flavors/coconut-sorbet.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Coconut Sorbet';

UPDATE public.menu_items SET image_url = '/images/flavors/limoncello.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Limoncello';

UPDATE public.menu_items SET image_url = '/images/flavors/watermelon-and-fresh-mint.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Watermelon & Fresh Mint';

UPDATE public.menu_items SET image_url = '/images/flavors/dark-chocolate.png'
WHERE section IN ('gelato', 'sorbet', 'bestsellers', 'seasonal') AND name = 'Dark Chocolate';
