import { prisma } from '@/lib/prisma';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const now = new Date();
  // Get data for the current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Wait, let's just get the last 12 months of aggregated data for the charts, and detailed data for the current month.
  
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { date: 'desc' }
    }),
    prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
  ]);

  return <ReportsClient initialSales={sales} initialExpenses={expenses} />;
}
