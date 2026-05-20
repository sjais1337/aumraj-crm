import { authOptions } from '@/libs/authOptions';

import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { NextResponse } from 'next/server';

export async function GET(
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

        const url = new URL(request.url);
        const amt = url.searchParams.get('amt');

        const data = await prisma.billingData.create({
            data: {
                amount: parseInt(amt)
            }
        })

        return NextResponse.json(data);
    } catch(err){
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}