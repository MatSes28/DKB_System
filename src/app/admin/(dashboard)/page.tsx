import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

// Opt out of caching for admin dashboard pages
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // For growth calculation: start of current month and previous month
  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const startOfLastMonth = new Date(startOfThisMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  // Fetch all data in parallel to eliminate waterfall delays and make it snappy!
  const [
    membersCount,
    activeMembersCount,
    todaysAttendance,
    todaysSales,
    expiringMembers,
    equipment,
    membersBefore6Months,
    recentMembers,
    recentSales,
    recentAttendance,
    lowStockItems,
    newMembersThisMonth,
    newMembersLastMonth,
    last30DaysSalesTotal
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
    prisma.equipment.findMany(),
    prisma.member.count({
      where: { createdAt: { lt: sixMonthsAgo } }
    }),
    prisma.member.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    }),
    prisma.sale.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { date: true, amount: true }
    }),
    prisma.attendance.findMany({
      where: { timestamp: { gte: thirtyDaysAgo } },
      select: { timestamp: true }
    }),
    prisma.inventoryItem.findMany({
      where: { quantity: { lt: 5 } },
      orderBy: { quantity: 'asc' },
      take: 5
    }),
    // New members this month
    prisma.member.count({
      where: { createdAt: { gte: startOfThisMonth } }
    }),
    // New members last month
    prisma.member.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    }),
    // Total sales in last 30 days for daily average
    prisma.sale.aggregate({
      _sum: { amount: true },
      where: { date: { gte: thirtyDaysAgo } }
    })
  ]);

  const salesTotal = todaysSales._sum.amount || 0;

  // --- Calculate Real Metrics ---

  // Member growth percentage (this month vs last month)
  const memberGrowthPercent = newMembersLastMonth > 0 
    ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100 
    : newMembersThisMonth > 0 ? 100 : 0;

  // Peak hour calculation from last 30 days attendance
  const hourBuckets = Array(24).fill(0);
  recentAttendance.forEach(a => {
    hourBuckets[a.timestamp.getHours()]++;
  });
  
  const peakHourIndex = hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakAmPm = peakHourIndex >= 12 ? 'PM' : 'AM';
  const peakDisplayHour = peakHourIndex > 12 ? peakHourIndex - 12 : peakHourIndex === 0 ? 12 : peakHourIndex;
  const peakHourLabel = recentAttendance.length > 0 ? `${peakDisplayHour}:00 ${peakAmPm}` : 'No data yet';

  // Daily average revenue (last 30 days)
  const dailyAverage = (last30DaysSalesTotal._sum.amount || 0) / 30;

  // --- Process Chart Data ---

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // 1. Monthly Growth (Cumulative)
  const monthlyGrowth = [];
  let currentTotal = membersBefore6Months;
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthNames[d.getMonth()];
    
    // Count new members in this month
    const newMembersInMonth = recentMembers.filter(m => {
      return m.createdAt.getFullYear() === d.getFullYear() && m.createdAt.getMonth() === d.getMonth();
    }).length;
    
    currentTotal += newMembersInMonth;
    monthlyGrowth.push({ name: monthName, members: currentTotal });
  }

  // 2. Revenue Data (Last 6 Months)
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthNames[d.getMonth()];
    
    const salesThisMonth = recentSales.filter(s => {
      return s.date.getFullYear() === d.getFullYear() && s.date.getMonth() === d.getMonth();
    }).reduce((sum, sale) => sum + sale.amount, 0);
    
    revenueData.push({ name: monthName, rev: salesThisMonth });
  }

  // 3. Peak Hours (Last 30 days)
  const keyHours = [6, 9, 12, 15, 18, 21];
  const peakHours = keyHours.map(hour => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
      time: `${displayHour}${ampm}`,
      usage: hourBuckets[hour]
    };
  });

  return (
    <DashboardClient 
      membersCount={membersCount}
      activeMembersCount={activeMembersCount}
      todaysAttendance={todaysAttendance}
      salesTotal={salesTotal}
      expiringMembers={expiringMembers}
      equipment={equipment}
      monthlyGrowth={monthlyGrowth}
      revenueData={revenueData}
      peakHours={peakHours}
      lowStockItems={lowStockItems}
      memberGrowthPercent={memberGrowthPercent}
      peakHourLabel={peakHourLabel}
      dailyAverage={dailyAverage}
    />
  );
}
