import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { authOptions } from '@/libs/authOptions';

import { NextResponse } from 'next/server';
import {
  financialYearBounds,
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

        const groupData = await prisma.group.findFirst({
            where: {
                headId: session.user.id
            }
        });

        if(!groupData.funnel){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }
        

        const { fyStart, fyEnd } = financialYearBounds();

        let summary = [];

        if (groupData?.members && Array.isArray(groupData.members) && groupData.members.length > 0) {
            const membersList = groupData.members.map((id) => `'${id}'`).join(', ');

            summary = await prisma.$queryRawUnsafe(`SELECT 
                s.name,
                COUNT(CASE WHEN f.status = 'Won' THEN 1 END) AS wonCases,
                COUNT(f.funnelId) AS totalFunnelCases,
                ROUND(IF(COUNT(f.funnelId) > 0, 
                (COUNT(CASE WHEN f.status = 'Won' THEN 1 END) / COUNT(f.funnelId)) * 100, 
                0)) AS hitPercentage,
                (SELECT COUNT(*) FROM funnel f2
                    WHERE f2.staffsId = s.id AND f2.status IN ('Cold', 'Mild', 'Hot')) AS cases,
                (SELECT COUNT(DISTINCT f2.companyId) FROM funnel f2
                    WHERE f2.staffsId = s.id AND f2.status IN ('Cold', 'Mild', 'Hot')) AS distinctCompanies
            FROM 
                staffs s
            LEFT JOIN 
                funnel f ON s.id = f.staffsId AND f.date BETWEEN '${fyStart}' AND '${fyEnd}' 
            WHERE 
                s.leaveDate IS NULL
            AND
                s.id IN (${membersList})
            GROUP BY 
                s.id, s.name
            HAVING 
                COUNT(f.funnelId) > 0
                OR (SELECT COUNT(*) FROM funnel f2
                    WHERE f2.staffsId = s.id AND f2.status IN ('Cold', 'Mild', 'Hot')) > 0;`)
        }

        const { dateStart, dateEnd } = funnelSummaryLast12MonthsRange();

        let monthly = [];

        if (groupData?.members && Array.isArray(groupData.members) && groupData.members.length > 0) {
            const membersList = groupData.members.map((id) => `'${id}'`).join(', ');

            monthly = await prisma.$queryRawUnsafe(`
                SELECT 
                    DATE_FORMAT(MIN(f.date), '%b-%y') AS monthYear,
                    COUNT(f.funnelId) AS totalFunnelCases,
                    COUNT(CASE WHEN f.status = 'Won' THEN 1 END) AS wonCases,
                    ROUND(IF(COUNT(f.funnelId) > 0, 
                    (COUNT(CASE WHEN f.status = 'Won' THEN 1 END) / COUNT(f.funnelId)) * 100, 
                    0)) AS hitPercentage
                FROM 
                    funnel f
                WHERE 
                    f.date >= '${dateStart}' AND f.date < DATE_ADD('${dateEnd}', INTERVAL 1 DAY)
                    AND f.staffsId IN (${membersList})
                GROUP BY 
                    DATE_FORMAT(f.date, '%Y-%m')
                ORDER BY 
                    MIN(f.date) DESC;
            `);
        }

        return NextResponse.json({
            summary: serializeQueryRows(summary),
            monthly: serializeQueryRows(monthly),
            totalCases: 0,
            totalCustomers: 0,
        });
    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
