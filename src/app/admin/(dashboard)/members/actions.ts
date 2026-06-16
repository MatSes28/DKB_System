'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMembers() {
  return await prisma.member.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addMember(data: { name: string; contact: string; address?: string; age?: number; birthday?: Date; emergencyContactName?: string; emergencyContactNumber?: string; emergencyContactRelation?: string; rfidTag: string; durationDays: number; amountPaid: number }) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + data.durationDays);

  await prisma.member.create({
    data: {
      name: data.name,
      contact: data.contact,
      address: data.address,
      age: data.age,
      birthday: data.birthday,
      emergencyContactName: data.emergencyContactName,
      emergencyContactNumber: data.emergencyContactNumber,
      emergencyContactRelation: data.emergencyContactRelation,
      rfidTag: data.rfidTag,
      membershipStart: start,
      membershipEnd: end,
      status: 'ACTIVE',
    }
  });

  await prisma.sale.create({
    data: {
      itemName: `Membership: ${data.name} (${data.durationDays} Days)`,
      amount: data.amountPaid,
      type: 'CUSTOMERS',
    }
  });

  revalidatePath('/admin/members');
  revalidatePath('/admin/sales');
  revalidatePath('/admin');
}

export async function updateMember(id: string, data: { name: string; contact: string; address?: string; age?: number; birthday?: Date; emergencyContactName?: string; emergencyContactNumber?: string; emergencyContactRelation?: string; rfidTag: string; status: string }) {
  await prisma.member.update({
    where: { id },
    data: {
      name: data.name,
      contact: data.contact,
      address: data.address,
      age: data.age,
      birthday: data.birthday,
      emergencyContactName: data.emergencyContactName,
      emergencyContactNumber: data.emergencyContactNumber,
      emergencyContactRelation: data.emergencyContactRelation,
      rfidTag: data.rfidTag,
      status: data.status,
    }
  });
  
  revalidatePath('/admin/members');
}

export async function deleteMember(id: string) {
  await prisma.attendance.deleteMany({ where: { memberId: id } });
  await prisma.member.delete({ where: { id } });
  
  revalidatePath('/admin/members');
}

export async function extendMembership(id: string, additionalDays: number, amountPaid: number) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return;

  const currentEnd = new Date(Math.max(member.membershipEnd.getTime(), new Date().getTime()));
  currentEnd.setDate(currentEnd.getDate() + additionalDays);

  await prisma.member.update({
    where: { id },
    data: { membershipEnd: currentEnd, status: 'ACTIVE' }
  });

  await prisma.sale.create({
    data: {
      itemName: `Renewal: ${member.name} (${additionalDays} Days)`,
      amount: amountPaid,
      type: 'CUSTOMERS',
    }
  });

  revalidatePath('/admin/members');
  revalidatePath('/admin/sales');
  revalidatePath('/admin');
}
