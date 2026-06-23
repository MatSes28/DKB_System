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

export async function exportAllMembers() {
  return await prisma.member.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getMemberDetails(id: string) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return { attendance: [], sales: [] };

  const [attendance, sales] = await Promise.all([
    prisma.attendance.findMany({
      where: { memberId: id },
      orderBy: { timestamp: 'desc' },
      take: 50
    }),
    prisma.sale.findMany({
      where: { itemName: { contains: member.name } },
      orderBy: { date: 'desc' },
      take: 50
    })
  ]);
  
  return { attendance, sales };
}

export async function addMember(data: { name: string; email?: string; contact: string; address?: string; age?: number; birthday?: Date; emergencyContactName?: string; emergencyContactNumber?: string; emergencyContactRelation?: string; rfidTag: string; planId: string }) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId } });
  if (!plan) throw new Error('Invalid plan selected');

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + plan.durationDays);

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
      planId: plan.id
    }
  });

  await prisma.sale.create({
    data: {
      itemName: `Membership: ${data.name} (${plan.name})`,
      amount: plan.price,
      type: 'CUSTOMERS',
    }
  });

  revalidatePath('/admin/members');
  revalidatePath('/admin/sales');
  revalidatePath('/admin');
  revalidatePath('/admin/plans');
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

export async function extendMembership(id: string, planId: string) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return;

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Invalid plan selected');

  const currentEnd = new Date(Math.max(member.membershipEnd.getTime(), new Date().getTime()));
  currentEnd.setDate(currentEnd.getDate() + plan.durationDays);

  await prisma.member.update({
    where: { id },
    data: { membershipEnd: currentEnd, status: 'ACTIVE', planId: plan.id }
  });

  await prisma.sale.create({
    data: {
      itemName: `Renewal: ${member.name} (${plan.name})`,
      amount: plan.price,
      type: 'CUSTOMERS',
    }
  });

  revalidatePath('/admin/members');
  revalidatePath('/admin/sales');
  revalidatePath('/admin');
  revalidatePath('/admin/plans');
}
