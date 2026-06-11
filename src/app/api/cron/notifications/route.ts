import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // In a real app, you'd secure this with a secret token
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);

    // Find members whose membership expires exactly 3 days from now
    const expiringMembers = await prisma.member.findMany({
      where: {
        membershipEnd: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // Before the next day
        }
      }
    });

    const notificationsSent = [];

    for (const member of expiringMembers) {
      // MOCK TWILIO/RESEND INTEGRATION
      // const smsRes = await twilio.messages.create({ ... })
      
      const message = `Hello ${member.name}, your DKB Fitness Gym membership expires in 3 days. Please renew at the front desk to avoid interruption!`;
      
      console.log(`[MOCK SMS] To: ${member.contact || 'Unknown Number'} | Message: ${message}`);
      
      notificationsSent.push({ member: member.name, status: 'Sent' });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${notificationsSent.length} automated expiration warnings.`,
      details: notificationsSent
    });

  } catch (error) {
    console.error('Notification Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
