'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAttendances() {
  return await prisma.attendance.findMany({
    orderBy: { timestamp: 'desc' },
    include: { member: true }
  });
}

export async function deleteAttendance(id: string) {
  await prisma.attendance.delete({ where: { id } });
  revalidatePath('/admin/attendance');
  revalidatePath('/admin');
}
