import { authOptions } from '@/libs/authOptions';

import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { NextResponse } from 'next/server';

export async function GET(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);

        const url = new URL(request.url);
        const userId = url.searchParams.get('user');
        
        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin) {
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const data = (await prisma.$queryRaw`
            SELECT a.staffsId AS id, s.name, s.department, s.post FROM activity a JOIN staffs s ON s.id = a.staffsId WHERE a.checked = false AND s.leaveDate IS NULL GROUP BY a.staffsId;
        `)

        return NextResponse.json(data);
    } catch(err){
        return new NextResponse('Internal Error', { status: 500 })
    }
}