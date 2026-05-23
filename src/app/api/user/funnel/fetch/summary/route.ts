import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { authOptions } from '@/libs/authOptions';

import { NextResponse } from 'next/server';
import {
  funnelSummaryLast12MonthsRange,
  serializeQueryRows,
} from '@/libs/funnelSummary';

export async function GET(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const { dateStart, dateEnd } = funnelSummaryLast12MonthsRange();

        const monthly = await prisma.$queryRaw`SELECT 
            DATE_FORMAT(MIN(f.date), '%b-%y') AS monthYear,
            COUNT(f.funnelId) AS totalFunnelCases,
            COUNT(CASE WHEN f.status = 'Won' THEN 1 END) AS wonCases,
            ROUND(IF(COUNT(f.funnelId) > 0, 
            (COUNT(CASE WHEN f.status = 'Won' THEN 1 END) / COUNT(f.funnelId)) * 100, 
            0)) AS hitPercentage
        FROM 
            funnel f
        WHERE 
            f.date >= ${dateStart} AND f.date < DATE_ADD(${dateEnd}, INTERVAL 1 DAY)
            AND f.staffsId = ${session.user.id}
        GROUP BY 
            DATE_FORMAT(f.date, '%Y-%m')
        ORDER BY 
            MIN(f.date) DESC;`;

        return NextResponse.json({
            monthly: serializeQueryRows(monthly),
        });
    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
