import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

// Opt out of caching for admin dashboard pages
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Fetch all data in parallel to eliminate waterfall delays and make it snappy!
  const [
    membersCount,
    activeMembersCount,
    todaysAttendance,
    todaysSales,
    expiringMembers,
    equipment
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({
      where: { membershipEnd: { gte: new Date() } }
    }),
    prisma.attendance.count({
      where: { timestamp: { gte: today } }
    }),
    prisma.sale.aggregate({
      _sum: { amount: true },
      where: { date: { gte: today } }
    }),
    prisma.member.findMany({
      where: {
        membershipEnd: { gte: new Date(), lte: nextWeek }
      },
      select: { id: true, name: true, membershipEnd: true },
      take: 5
    }),
    prisma.equipment.findMany()
  ]);

  const salesTotal = todaysSales._sum.amount || 0;

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
