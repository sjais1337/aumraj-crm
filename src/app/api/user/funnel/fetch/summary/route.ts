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

        let dateEnd = new Date(new Date().setDate(31)).toISOString().split('T')[0];
        let dateStart = new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - 12 )).toISOString().split('T')[0];

        const monthly = await prisma.$queryRaw`SELECT 
            DATE_FORMAT(f.date, '%b-%y') AS monthYear,
            COUNT(CASE WHEN f.status = 'Won' THEN 1 END) AS wonCases,
            COUNT(f.funnelId) AS totalFunnelCases,
            ROUND(IF(COUNT(f.funnelId) > 0, 
            (COUNT(CASE WHEN f.status = 'Won' THEN 1 END) / COUNT(f.funnelId)) * 100, 
            0)) AS hitPercentage
        FROM 
            funnel f
        WHERE 
            f.date BETWEEN ${dateStart} AND ${dateEnd}
            AND f.staffsId = ${session.user.id}
        GROUP BY 
            DATE_FORMAT(f.date, '%b-%y')
        HAVING 
            COUNT(f.funnelId) > 1
        ORDER BY 
            MIN(f.date) DESC;`;
        return NextResponse.json({
            monthly: JSON.parse(JSON.stringify(monthly, (key,value) => (typeof value == 'bigint' ?  Number(value) : value) )),
        });
    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
