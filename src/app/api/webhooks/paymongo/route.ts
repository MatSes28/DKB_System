import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { memberId, amount } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    // In a real PayMongo/GCash webhook, you would receive a payment intent ID,
    // verify the signature, and then process the fulfillment.

    // 1. Log the sale
    await prisma.sale.create({
      data: {
        itemName: '1 Month Membership (GCash Kiosk)',
        amount: amount || 1000,
        type: 'CUSTOMERS'
      }
    });

    // 2. Extend the member's membership
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (member) {
      const now = new Date();
      let newEnd = new Date(member.membershipEnd) > now ? new Date(member.membershipEnd) : now;
      newEnd.setMonth(newEnd.getMonth() + 1);

      await prisma.member.update({
        where: { id: memberId },
        data: { membershipEnd: newEnd, status: 'ACTIVE' }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
