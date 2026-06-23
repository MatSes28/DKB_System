'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMembers(page = 1, limit = 20, searchTerm = '') {
  const skip = (page - 1) * limit;
  const whereClause = searchTerm ? {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' as const } },
      { rfidTag: { contains: searchTerm, mode: 'insensitive' as const } }
    ]
  } : {};

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.member.count({ where: whereClause })
  ]);

  return { members, total, totalPages: Math.ceil(total / limit) };
}

export async function addMember(data: { name: string; email?: string; contact: string; address?: string; age?: number; birthday?: Date; emergencyContactName?: string; emergencyContactNumber?: string; emergencyContactRelation?: string; rfidTag: string; durationDays: number; amountPaid: number }) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + data.durationDays);

  await prisma.member.create({
    data: {
      name: data.name,
      email: data.email,
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

export async function updateMember(id: string, data: { name: string; email?: string; contact: string; address?: string; age?: number; birthday?: Date; emergencyContactName?: string; emergencyContactNumber?: string; emergencyContactRelation?: string; rfidTag: string; status: string }) {
  await prisma.member.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
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
