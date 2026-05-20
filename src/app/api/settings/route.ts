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

        const settings = await prisma.settings.findFirst({})
        
        return NextResponse.json(settings);
    } catch(err){
        return new NextResponse('Internal Error', { status: 500 })
    }
}