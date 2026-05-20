import { authOptions } from '@/libs/authOptions';

import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request
) {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const company = url.searchParams.get('company');


    const session = await getServerSession(authOptions);
    if(!session) { 
        return new NextResponse('User not authenticated.', { status: 401 })
    }
  
    if (!query) {
        return NextResponse.json([]);
    }


    const results = await prisma.person.findMany({
        where: {
            companyId: company,
            personName: {
                contains: query
            },
            staffs: {
                some: {
                    staffId: session.user.id
                }
            }
        },
        select: {
            emailId: true,
            personName: true,
            phoneNo: true,
            personId: true
        }
    });


    return NextResponse.json(results);
}