import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';
import { pickReengageCustomers } from '@/libs/inactiveCustomers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('User not authenticated.', { status: 401 });
    }

    const customers = await pickReengageCustomers(2);

    return NextResponse.json({ customers });
  } catch (err) {
    console.error('inactive-customers:', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
