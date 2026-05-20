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

        const groupData = await prisma.group.findFirst({
            where: {
                headId: session.user.id
            }
        });

        if(!groupData.funnel){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }
        

        const fyStart = financialYear().start.toISOString().split('T')[0];
        const fyEnd = financialYear().end.toISOString().split('T')[0];

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
                COUNT(CASE WHEN f.status = 'Cold' OR f.status = 'Mild' OR f.status = 'Hot' THEN 1 END) AS cases,
                COUNT(DISTINCT CASE WHEN f.status IN ('Cold', 'Mild', 'Hot') THEN f.companyId END) AS distinctCompanies
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
                COUNT(f.funnelId) > 0;`)
        }

        

        let dateEnd = new Date(new Date().setDate(31)).toISOString().split('T')[0];
        let dateStart = new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - 12 )).toISOString().split('T')[0];

        console.log(dateEnd, dateStart);

        let monthly = [];

        if (groupData?.members && Array.isArray(groupData.members) && groupData.members.length > 0) {
            const membersList = groupData.members.map((id) => `'${id}'`).join(', ');

            monthly = await prisma.$queryRawUnsafe(`
                SELECT 
                    DATE_FORMAT(f.date, '%b-%y') AS monthYear,
                    COUNT(CASE WHEN f.status = 'Won' THEN 1 END) AS wonCases,
                    COUNT(f.funnelId) AS totalFunnelCases,
                    ROUND(IF(COUNT(f.funnelId) > 0, 
                    (COUNT(CASE WHEN f.status = 'Won' THEN 1 END) / COUNT(f.funnelId)) * 100, 
                    0)) AS hitPercentage
                FROM 
                    funnel f
                WHERE 
                    f.date BETWEEN '${dateStart}' AND '${dateEnd}'
                    AND f.staffsId IN (${membersList})
                GROUP BY 
                    DATE_FORMAT(f.date, '%b-%y')
                HAVING 
                    COUNT(f.funnelId) > 1
                ORDER BY 
                    MIN(f.date) DESC;
            `);
        }

        
        
        return NextResponse.json({
            summary: JSON.parse(JSON.stringify(summary, (key,value) => (typeof value == 'bigint' ?  Number(value) : value) )),
            monthly: JSON.parse(JSON.stringify(monthly, (key,value) => (typeof value == 'bigint' ?  Number(value) : value) )),
            totalCases: 0,
            totalCustomers: 0,
        });
    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
