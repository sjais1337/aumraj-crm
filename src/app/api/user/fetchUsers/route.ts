import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { authOptions } from '@/libs/authOptions';

import { NextResponse } from 'next/server';

export async function GET(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const users = await prisma.staffs.findMany({
            select: {
                id: true,
                name: true,
            },
            where: {
                leaveDate: null
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(users);
    } catch(err){
        return new NextResponse('Internal Error', { status: 500 })
    }
}