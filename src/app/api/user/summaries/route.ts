import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { authOptions } from '@/libs/authOptions';

import { NextResponse } from 'next/server';
import { financialYear } from '@/libs/consts';

export async function GET(
    request: Request
) {
    try{ 
        interface FunnelSummaryItem {
          name: string;
          funnelCount: bigint;
        }

        interface AmcSummaryItem {
          name: string;
          ATPL: bigint;
          B2B_ATPL: bigint;
          B2B: bigint;
        }

        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const rawFunnelSummary = await prisma.$queryRaw<FunnelSummaryItem[]>`
            SELECT s.name, COUNT(f.staffsId) AS funnelCount
            FROM funnel f
            JOIN staffs s ON s.id = f.staffsId
            WHERE DATE_FORMAT(f.date, '%m%Y') = DATE_FORMAT(CURRENT_DATE, '%m%Y')
            GROUP BY f.staffsId, s.name;
        `;

        const funnelSummary = rawFunnelSummary.map(item => ({
            name: item.name,
            count: Number(item.funnelCount ?? item['COUNT(f.staffsId)']),
        }));

        const rawAmcSummary = await prisma.$queryRaw<AmcSummaryItem[]>`
          SELECT 
              s.name, 
              COUNT(CASE WHEN sla.supportType = 'ATPL' THEN 1 END) AS ATPL,
              COUNT(CASE WHEN sla.supportType = 'B2B + ATPL' THEN 1 END) AS B2B_ATPL,
              COUNT(CASE WHEN sla.supportType = 'B2B' THEN 1 END) AS B2B
          FROM sla
          JOIN staffs s ON s.id = sla.staffsId
          WHERE 
            sla.slaEndDate > CURRENT_DATE

          GROUP BY sla.staffsId, s.name;
        `;
        
        const amcSummary = rawAmcSummary.map(item => ({
          name: item.name,
          ATPL: Number(item.ATPL),
          B2B_ATPL: Number(item.B2B_ATPL),
          B2B: Number(item.B2B)
        }))
          

        const amcExpiry = (await prisma.sla.findMany({
          where:{
            archived: false,
            OR: [
              {
                slaEndDate: {
                  gte: new Date(),
                  lte: new Date(new Date().setDate(new Date().getDate()  + 30 ))
                }
              },
              {
                slaEndDate: {
                  lt: new Date()
                }
              }
            ]
          },
          select: {
            Customer: true,
            employee: true, 
            oem: true,
            slaEndDate: true
          },
          orderBy: {
            slaEndDate: 'asc'
          }
        })).map(i => {
          const days = (i.slaEndDate.getTime() -new Date().getTime())/86400000;
          return {
            customerName: i.Customer.companyName,
            name: i.employee.name,
            oem: i.oem,
            days: days <= 0 ? 0 : Math.floor(days),
            date: i.slaEndDate
          }
        });

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
            funnel: funnelSummary,
            amc: amcSummary,
            amcWarnings: amcExpiry,
            support: status
        });
    } catch(err){
        console.error('GET /api/user/summaries failed:', err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
