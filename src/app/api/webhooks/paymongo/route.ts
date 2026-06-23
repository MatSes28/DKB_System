import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { memberId, amount, planId } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    let durationDays = 30;
    let planName = 'Monthly (GCash)';
    let finalAmount = amount || 1000;

    if (planId) {
      const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
      if (plan) {
        durationDays = plan.durationDays;
        planName = plan.name;
        finalAmount = plan.price;
      }
    }

    // 1. Log the sale
    await prisma.sale.create({
      data: {
        itemName: `Auto-Renewal: ${planName} (GCash)`,
        amount: finalAmount,
        type: 'CUSTOMERS'
      }
    });

    // 2. Extend the member's membership
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (member) {
      const now = new Date();
      let newEnd = new Date(member.membershipEnd) > now ? new Date(member.membershipEnd) : now;
      newEnd.setDate(newEnd.getDate() + durationDays);

      await prisma.member.update({
        where: { id: memberId },
        data: { membershipEnd: newEnd, status: 'ACTIVE', planId: planId || member.planId }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
