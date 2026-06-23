import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rfidTag } = body;

    if (!rfidTag) {
      return NextResponse.json({ error: 'RFID Tag is required' }, { status: 400 });
    }

    // Find the member
    const member = await prisma.member.findUnique({
      where: { rfidTag },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const now = new Date();

    // Check if membership is active BEFORE allowing check-in
    const isMembershipActive = now >= member.membershipStart && now <= member.membershipEnd;

    if (!isMembershipActive) {
      return NextResponse.json({
        error: 'Membership Expired',
        member: {
          id: member.id,
          name: member.name,
          membershipEnd: member.membershipEnd,
          status: member.status,
          isActive: false,
        }
      }, { status: 403 });
    }

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const openAttendance = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        tapOut: null,
        timestamp: { gte: startOfToday }
      },
      orderBy: { timestamp: 'desc' }
    });

    let action = 'tap-in';
    if (openAttendance) {
      // Tap out
      await prisma.attendance.update({
        where: { id: openAttendance.id },
        data: { tapOut: now }
      });
      action = 'tap-out';
    } else {
      // Tap in
      await prisma.attendance.create({
        data: {
          memberId: member.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      action: action,
      member: {
        id: member.id,
        name: member.name,
        membershipEnd: member.membershipEnd,
        status: member.status,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

