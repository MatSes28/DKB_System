import { prisma } from '@/lib/prisma';
import PlansClient from './PlansClient';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { price: 'asc' },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  return <PlansClient initialPlans={plans} />;
}
