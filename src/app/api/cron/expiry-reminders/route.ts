import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import sgMail from '@sendgrid/mail';

export async function GET(req: Request) {
  // Security check: Vercel Cron securely passes an auth header
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("Unauthorized Cron execution attempt.");
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!process.env.SENDGRID_API_KEY) {
    return new NextResponse('SendGrid API Key missing', { status: 500 });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    // Find members whose membership expires exactly 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const fourDaysFromNow = new Date(threeDaysFromNow);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);

    const expiringMembers = await prisma.member.findMany({
      where: {
        email: { not: null },
        membershipEnd: {
          gte: threeDaysFromNow,
          lt: fourDaysFromNow
        }
      }
    });

    console.log(`Found ${expiringMembers.length} members expiring in 3 days with email addresses.`);

    for (const member of expiringMembers) {
      if (!member.email) continue;
      
      const msg = {
        to: member.email,
        from: process.env.ADMIN_EMAIL || 'admin@dkbgym.com', // Must be verified in SendGrid
        subject: 'Action Required: Your DKB Fitness Gym Membership is Expiring Soon!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #f5a623;">Hi ${member.name},</h2>
            <p>We hope you've been having great workouts with us at <strong>DKB Fitness Gym</strong>!</p>
            <p>This is a friendly reminder that your gym membership is scheduled to expire on <strong>${new Date(member.membershipEnd).toLocaleDateString()}</strong>.</p>
            <p>To ensure uninterrupted access to the gym, please see the front desk to renew your membership before it expires.</p>
            <br>
            <p>Keep up the great work!</p>
            <p>Best regards,<br><strong>The DKB Fitness Gym Team</strong></p>
          </div>
        `,
      };

      try {
        await sgMail.send(msg);
        console.log(`Sent reminder to ${member.email}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${member.email}`, error);
      }
    }

    return NextResponse.json({ success: true, count: expiringMembers.length });
  } catch (error) {
    console.error('Expiry Reminder Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
