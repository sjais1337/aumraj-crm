import prisma from '@/libs/prismadb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';




export async function GET(
    request: Request
) {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    const session = await getServerSession(authOptions);
    if(!session) { 
        return new NextResponse('User not authenticated.', { status: 401 })
    }
  
    if (!query) {
        return NextResponse.json([]);
    }

    const results = await prisma.customer.findMany({
        take: 5,
        where: {
            companyName: {
                contains: query,
            }
        },
        select: {
            companyName: true,
            customerId: true
        }
    })

    return NextResponse.json(results);
}