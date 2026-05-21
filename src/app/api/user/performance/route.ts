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
        
        const { start, end } = financialYear();

        const allData : any = await prisma.$queryRaw`
            SELECT
                DATE_FORMAT(sub.date, '%Y-%m') AS month,
                sub.staffsId,
                SUM(sub.score) AS sumScore
            FROM (
                SELECT
                    DATE(a.date) AS date,
                    a.staffsId,
                    MAX(a.score) AS score
                FROM
                    activity a
                WHERE
                    a.date >= ${start} AND a.date <= ${end}
                GROUP BY
                    DATE(a.date), a.staffsId
            ) AS sub
            GROUP BY
                month, sub.staffsId
            ORDER BY
                month ASC;
        `;

        const userRaw:any = await prisma.$queryRaw`
            SELECT
                DATE_FORMAT(sub.date, '%Y-%m') AS month,
                SUM(sub.score) AS scoreRaw
            FROM (
                SELECT
                    DATE(a.date) AS date,
                    a.staffsId,
                    MAX(a.score) AS score
                FROM
                    activity a
                WHERE
                    a.date >= ${start} AND a.date <= ${end} AND a.staffsId = ${session.user.id}
                GROUP BY
                    DATE(a.date), a.staffsId
            ) AS sub
            GROUP BY
                month
            ORDER BY
                month ASC;
        `;

        const highest: any = await prisma.$queryRaw`
            SELECT name, SUM(score) AS score, sub.id as userId
            FROM (
                SELECT s.id, s.name, a.date, MAX(a.score) AS score
                FROM activity a
                JOIN staffs s ON a.staffsId = s.id
                WHERE EXTRACT(YEAR FROM a.date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM a.date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND s.leaveDate IS NULL
                GROUP BY s.id, s.name, a.date
            ) AS sub
            GROUP BY sub.id
            ORDER BY score DESC
            LIMIT 1;
        `; 

        const lowest: any = await prisma.$queryRaw`
            SELECT name, SUM(score) AS score, sub.id as userId
            FROM (
                SELECT s.id, s.name, a.date, MAX(a.score) AS score
                FROM activity a
                JOIN staffs s ON a.staffsId = s.id
                WHERE EXTRACT(YEAR FROM a.date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM a.date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND s.leaveDate IS NULL
		GROUP BY s.id, s.name, a.date
            ) AS sub
            GROUP BY sub.id
            ORDER BY score ASC
            LIMIT 1;
        `; 

        const last: any = await prisma.$queryRaw`
            SELECT name, SUM(score) AS score, sub.id as userId
            FROM (
                SELECT s.id, name, a.date, MAX(a.score) AS score
                FROM activity a
                JOIN staffs s ON a.staffsId = s.id
                WHERE YEAR(a.date) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
                AND MONTH(a.date) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
                AND s.leaveDate IS NULL                
		GROUP BY s.id, name, a.date
            ) AS sub
            GROUP BY sub.id
            ORDER BY score DESC
            LIMIT 1;
        `;

        const averageScoresByMonth = allData.reduce((acc: any, curr: any) => {
            const month = curr.month;
            acc[month] = acc[month] || { totalScore: 0, count: 0 };
            acc[month].totalScore += parseInt(curr.sumScore);
            acc[month].count++;
            return acc;
        }, {});

        const teamData = Object.entries(averageScoresByMonth).map(([month, data]) => ({
            month,
            //@ts-ignore
            score: parseInt(data.totalScore / data.count) || 0,
        }));

        const userData = teamData.map(item => ({
            month: item.month,
            score: parseInt(userRaw.find(userItem => userItem.month === item.month)?.scoreRaw) || 0
        }));

        const topCompanies = await prisma.$queryRaw`
        SELECT 
            c.companyName AS companyName,
            s.name AS staffName, -- Selecting staffName from the staffs table
            SUM(f.topLine) AS topLine
        FROM 
            customer c
        LEFT JOIN 
            funnel f ON c.customerId = f.companyId
        LEFT JOIN 
            staffs s ON s.id = f.staffsId
        WHERE 
            f.status = 'Won'
        AND
            f.closureDate
                BETWEEN ${financialYear().start.toISOString().slice(0, 19).split('T')[0]} AND ${financialYear().end.toISOString().slice(0, 19).split('T')[0]}
        GROUP BY 
            c.companyName, s.name
        ORDER BY 
            topLine DESC
        LIMIT 5;`;

        const topPOs: any = (await prisma.funnel.findMany({
            select: {
                Customer: true,
                topLine: true,
                employee: true
            },
            orderBy: [
                {
                    topLine: 'desc'
                }
            ],
            where: {
                status: 'Won',
                closureDate: {
                    lte: financialYear().end,
                    gte: financialYear().start
                }
            },
            take: 5
        })).map(i => {
            return {
                companyName: i.Customer.companyName,
                topLine: i.topLine,
                staffName: i.employee.name
            }
        })


        return NextResponse.json({
            user: userData,
            team: teamData,
            highest: highest[0] == undefined ? {name:'No one', score: 0, userId: ''} : highest[0],
            lowest: lowest[0] == undefined ? {name:'No one', score: 0, userId: ''} : lowest[0],
            last: last[0] == undefined ? {name:'No one', score: 0, userId: ''} : last[0],
            topCompanies: topCompanies,
            topPOs: topPOs
        })

    } catch(err){
        console.log(err);
      return new NextResponse('Internal Error', { status: 500 })
    }
}
