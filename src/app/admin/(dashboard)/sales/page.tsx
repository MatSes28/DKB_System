import { getSales } from './actions';
import { prisma } from '@/lib/prisma';
import SalesClient from './SalesClient';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const sales = await getSales();
  const inventory = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  const members = await prisma.member.findMany();
  return <SalesClient initialSales={sales} inventory={inventory} members={members} />;
}
