import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';
import MemberDashboardClient from './MemberDashboardClient';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');

export const dynamic = 'force-dynamic';

export default async function MemberDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('member_session')?.value;

  if (!token) {
    redirect('/member/login');
  }

  let memberId;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    memberId = payload.id as string;
  } catch (err) {
    redirect('/member/login');
  }

  // Fetch Member Profile and Attendance concurrently
  const [member, attendance] = await Promise.all([
    prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        rfidTag: true,
        membershipEnd: true,
        status: true,
        contact: true,
        plan: true
      }
    }),
    prisma.attendance.findMany({
      where: { memberId: memberId },
      orderBy: { timestamp: 'desc' },
      take: 10
    })
  ]);

  if (!member) {
    redirect('/member/login');
  }

  return (
    <MemberDashboardClient 
      member={member}
      attendance={attendance}
    />
  );
}
