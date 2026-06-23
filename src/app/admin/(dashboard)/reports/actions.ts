'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addExpense(data: { category: string; amount: number; description?: string; date: Date }) {
  try {
    await prisma.expense.create({
      data: {
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date
      }
    });
    revalidatePath('/admin/reports');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to add expense' };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath('/admin/reports');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to delete expense' };
  }
}
