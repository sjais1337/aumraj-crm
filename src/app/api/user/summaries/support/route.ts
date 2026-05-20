import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { authOptions } from '@/libs/authOptions';

import { NextResponse } from 'next/server';
import { financialYear } from '@/libs/consts';

export async function GET(
    request: Request
) {
    try{ 

        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin){
            return new NextResponse('User is not admin!', { status: 401 })
        }

        let queryType:any = await prisma.$queryRaw`SELECT 
        s.name, 
        COUNT(CASE WHEN support.type = 'Support' THEN 1 END) AS SUPPORT,
        COUNT(CASE WHEN support.type = 'Delivery' THEN 1 END) AS DELIVERY,
        COUNT(CASE WHEN support.type = 'Payment' THEN 1 END) AS PAYMENT
        FROM staffs s
        JOIN support ON s.id = support.staffsId
        WHERE support.status IN ('Planning', 'Progress','Issues')
        GROUP BY support.staffsId, s.name;`;

        const type = queryType.map(item => ({
            name: item.name,
            SUPPORT: Number(item.SUPPORT),
            DELIVERY: Number(item.DELIVERY),
            PAYMENT: Number(item.PAYMENT)
        }))

        const queryStatus:any = await prisma.$queryRaw`SELECT 
        s.name, 
        COUNT(CASE WHEN support.status = 'Planning' THEN 1 END) AS SUPPORT,
        COUNT(CASE WHEN support.status = 'Progress' THEN 1 END) AS DELIVERY,
        COUNT(CASE WHEN support.status = 'Issues' THEN 1 END) AS PAYMENT
        FROM staffs s
        JOIN support ON s.id = support.staffsId
        WHERE support.status IN ('Planning', 'Progress', 'Issues')
        GROUP BY support.staffsId, s.name;`;

        const status = queryStatus.map(item => ({
            name: item.name,
            SUPPORT: Number(item.SUPPORT),
            DELIVERY: Number(item.DELIVERY),
            PAYMENT: Number(item.PAYMENT)
        }))

        return NextResponse.json({
            status: status,
            type: type
        });
    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
