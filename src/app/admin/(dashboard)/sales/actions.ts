'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSales(startDate?: Date, endDate?: Date) {
  return await prisma.sale.findMany({
    where: {
      ...(startDate || endDate ? {
        date: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {})
        }
      } : {})
    },
    orderBy: { date: 'desc' }
  });
}

export async function addSale(data: { itemName: string; amount: number; type: string; inventoryId?: string; memberId?: string }) {
  await prisma.sale.create({
    data: {
      itemName: data.itemName,
      amount: data.amount,
      type: data.type,
    }
  });

  if (data.type === 'PRODUCTS' && data.inventoryId) {
    await prisma.inventoryItem.update({
      where: { id: data.inventoryId },
      data: { quantity: { decrement: 1 } }
    });
  }

  // Extend membership if it's a membership purchase
  if (data.memberId && (data.itemName.includes('Monthly') || data.itemName.includes('Weekly') || data.itemName.includes('Membership'))) {
    const member = await prisma.member.findUnique({ where: { id: data.memberId } });
    if (member) {
      // Determine if we are extending an active membership or restarting an expired one
      const now = new Date();
      let newEnd = new Date(member.membershipEnd) > now ? new Date(member.membershipEnd) : now;
      
      if (data.itemName.includes('1 Month') || data.itemName.includes('Monthly')) {
        newEnd.setMonth(newEnd.getMonth() + 1);
      } else if (data.itemName.includes('1 Week') || data.itemName.includes('Weekly')) {
        newEnd.setDate(newEnd.getDate() + 7);
      }
      
      await prisma.member.update({
        where: { id: data.memberId },
        data: { membershipEnd: newEnd, status: 'ACTIVE' }
      });
    }
  }

  revalidatePath('/admin/sales');
  revalidatePath('/admin/inventory');
  revalidatePath('/admin'); // For overview
}

export async function deleteSale(id: string) {
  await prisma.sale.delete({ where: { id } });
  revalidatePath('/admin/sales');
  revalidatePath('/admin');
}
