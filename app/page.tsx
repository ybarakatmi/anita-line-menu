import { MenuBoard } from "@/components/menu/MenuBoard";
import { getMenuData } from "@/lib/get-menu-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getMenuData();
  return (
    <MenuBoard
      initialItems={data.items}
      initialSettings={data.settings}
      mode={data.mode}
    />
  );
}
