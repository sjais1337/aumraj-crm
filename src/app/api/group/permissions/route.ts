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

        const group = await prisma.group.findMany({
            where: {
                headId: session.user.id
            }
        });

        if(group.length == 0){
            return new NextResponse('User not present in any groups.', { status: 201 })
        } 

        return NextResponse.json(group[0]);
    } catch(err){
        return new NextResponse('Internal Error', { status: 500 })
    }
}