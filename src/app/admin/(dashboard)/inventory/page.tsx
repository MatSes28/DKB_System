import { getInventory } from './actions';
import InventoryClient from './InventoryClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const inventory = await getInventory();
  return <InventoryClient initialData={inventory} />;
}
