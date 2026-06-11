import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

// Opt out of caching for admin dashboard pages
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const membersCount = await prisma.member.count();
  const activeMembersCount = await prisma.member.count({
    where: {
      membershipEnd: { gte: new Date() }
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysAttendance = await prisma.attendance.count({
    where: {
      timestamp: { gte: today }
    }
  });

  const todaysSales = await prisma.sale.aggregate({
    _sum: { amount: true },
    where: { date: { gte: today } }
  });

  const salesTotal = todaysSales._sum.amount || 0;

  // Fetch expiring members (within next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const expiringMembers = await prisma.member.findMany({
    where: {
      membershipEnd: {
        gte: new Date(),
        lte: nextWeek
      }
    },
    select: {
      id: true,
      name: true,
      membershipEnd: true
    },
    take: 5
  });

  const equipment = await prisma.equipment.findMany();

  return (
    <DashboardClient 
      membersCount={membersCount}
      activeMembersCount={activeMembersCount}
      todaysAttendance={todaysAttendance}
      salesTotal={salesTotal}
      expiringMembers={expiringMembers}
      equipment={equipment}
    />
  );
}
