'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getInventory() {
  return await prisma.inventoryItem.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function addInventoryItem(data: { name: string; quantity: number; price: number }) {
  await prisma.inventoryItem.create({
    data: {
      name: data.name,
      quantity: data.quantity,
      price: data.price,
    }
  });

  revalidatePath('/admin/inventory');
}

export async function updateInventoryQuantity(id: string, newQuantity: number) {
  await prisma.inventoryItem.update({
    where: { id },
    data: { quantity: newQuantity }
  });

  revalidatePath('/admin/inventory');
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath('/admin/inventory');
}
