import { prisma } from '@/lib/prisma';
import EquipmentClient from './EquipmentClient';

export const dynamic = 'force-dynamic';

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { name: 'asc' }
  });

  return <EquipmentClient initialData={equipment} />;
}
