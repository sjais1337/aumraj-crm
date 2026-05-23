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

        let data = {};

        const billingTarget = (await prisma.settings.findFirst({
            select: {
                target: true
            }
        })).target;

        const billingAchieved = (await prisma.billingData.findFirst({
            orderBy: {
                billingId: 'desc'
            }
        })).amount;

        const billingPercentage =
            billingTarget === 0 ? 0 : billingAchieved / billingTarget;

        const salary = (await prisma.staffs.findFirst({
            where: {
                id: session.user.id
            },
            select: {
                salary: true,
                joinDate: true
            }
        }));

        const { start, end } = financialYear();

        let m = salary.joinDate;

        const monthDiff = (dateFrom, dateTo) => {
            return dateTo.getMonth() - dateFrom.getMonth() + 
              (12 * (dateTo.getFullYear() - dateFrom.getFullYear())) + 1
        }

        let workMonths = m < start ? monthDiff(start, end) : monthDiff(m, end);

        return NextResponse.json({
            billingAchieved: billingAchieved,
            billingTarget: billingTarget,
            salary: salary.salary,
            workMonths: workMonths,
            billingPercentage: (billingPercentage*100).toFixed(1),
        });

    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
