import { getSales } from './actions';
import { prisma } from '@/lib/prisma';
import SalesClient from './SalesClient';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const result = await getSales(undefined, undefined, 1, 20, 'CUSTOMERS');
  const inventory = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  const members = await prisma.member.findMany();
  return <SalesClient initialSales={result.sales} initialTotalPages={result.totalPages} inventory={inventory} members={members} />;
}
