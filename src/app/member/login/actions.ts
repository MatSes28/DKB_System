'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');

export async function loginMember(identifier: string, rfidTag: string) {
  // Find member by contact OR email
  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { contact: identifier },
        { email: identifier }
      ],
      rfidTag: rfidTag // Using RFID as the secure password equivalent
    }
  });

  if (!member) {
    return { error: 'Invalid credentials. Please check your Contact/Email and RFID.' };
  }

  // Generate JWT token
  const alg = 'HS256';
  const token = await new jose.SignJWT({ id: member.id, role: 'MEMBER' })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  // Set secure cookie
  const cookieStore = await cookies();
  cookieStore.set('member_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return { success: true };
}

export async function logoutMember() {
  const cookieStore = await cookies();
  cookieStore.delete('member_session');
  return { success: true };
}
