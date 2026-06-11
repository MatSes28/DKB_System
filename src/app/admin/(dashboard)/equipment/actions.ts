'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addEquipment(data: { name: string; status?: string; notes?: string }) {
  await prisma.equipment.create({
    data: {
      name: data.name,
      status: data.status || 'OPTIMAL',
      notes: data.notes
    }
  });
  revalidatePath('/admin/equipment');
  revalidatePath('/admin');
}

export async function updateEquipmentStatus(id: string, status: string, notes?: string) {
  const data: any = { status };
  if (notes !== undefined) data.notes = notes;
  if (status === 'OPTIMAL') data.lastMaintained = new Date();

  await prisma.equipment.update({
    where: { id },
    data
  });
  revalidatePath('/admin/equipment');
  revalidatePath('/admin');
}

export async function deleteEquipment(id: string) {
  await prisma.equipment.delete({ where: { id } });
  revalidatePath('/admin/equipment');
  revalidatePath('/admin');
}
