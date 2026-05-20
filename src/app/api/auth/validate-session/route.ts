// /pages/api/auth/validate-session.ts
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
    

  if (!session) {
    console.log('no session')
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.staffs.findUnique({
    where: { id: session.user.id },
    select: { updatedAt: true }
  });

  if (user) {
    
    const dbUpdatedAt = new Date(user.updatedAt).getTime();
    const sessionUpdatedAt = new Date(session.user.updatedAt).getTime();

    if (dbUpdatedAt !== sessionUpdatedAt) {
      return NextResponse.json({ message: 'Session invalidated. Please log in again.' }, { status: 401 });
    }
  }

  return NextResponse.json({ message: 'Valid session' });
}
