'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPlan(data: { name: string; price: number; durationDays: number }) {
  try {
    await prisma.membershipPlan.create({
      data: {
        name: data.name,
        price: data.price,
        durationDays: data.durationDays
      }
    });
    revalidatePath('/admin/plans');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to create plan' };
  }
}

export async function deletePlan(id: string) {
  try {
    // Check if any members are using this plan before deleting
    const membersWithPlan = await prisma.member.count({ where: { planId: id } });
    if (membersWithPlan > 0) {
      return { error: `Cannot delete plan: ${membersWithPlan} members are currently enrolled.` };
    }

    await prisma.membershipPlan.delete({ where: { id } });
    revalidatePath('/admin/plans');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to delete plan' };
  }
}
