import { authOptions } from '@/libs/authOptions';

import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { NextResponse } from 'next/server';

export async function POST(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);
        
        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin) {
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const body = await request.json();

        let { startRow, endRow } =  body;


        const data = await prisma.billingData.findMany({
            skip: startRow,
            take: endRow -  startRow,
            orderBy: {
                billingId: 'desc'
            }
        })

        const count = await prisma.billingData.count({});

        return NextResponse.json({
            data: {
                data: data,
                count: count
            }
        });
    } catch(err){
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}