import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { authOptions } from '@/libs/authOptions';

import { NextResponse } from 'next/server';
import { financialYear } from '@/libs/consts';

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth()
    );
}


export async function GET(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const staffs = await prisma.staffs.findMany({
            select: {
                id: true,
                name: true,
                birthDate: true,
                anniversaryDate: true,
                joinDate: true,
            },
        });

        const notifications = await prisma.activity.findMany({
            where: {
                notificationChecked: false,
            },
            select: {
                notification: true,
                checkedBy: true,
            },
        });
    
        const today = new Date();
        const result: Array<{ type: string; details: any }> = [];
    
        staffs.forEach((staff) => {
            const { id, name, birthDate, anniversaryDate, joinDate } = staff;
    
            const congratulations = {
                type: 'congratulations',
                details: {
                    id,
                    name,
                    imageUrl: `${id}.png`,
                    birthday: birthDate && isSameDay(today, birthDate) ? `🎉 Happy Birthday, ${name}!` : null,
                    anniversary: anniversaryDate && isSameDay(today, anniversaryDate) ? `🎉 Happy Anniversary, ${name}!` : null,
                    workAnniversary: joinDate && isSameDay(today, joinDate) ? `🎉 Congratulations on your work anniversary, ${name}!` : null,
                },
            };
    
            if (congratulations.details.birthday || congratulations.details.anniversary || congratulations.details.workAnniversary) {
                result.push(congratulations);
            }
        });
    
        notifications.forEach((activity) => {
            const notificationObject = {
                type: 'notification',
                details: {
                    notification: activity.notification,
                    imageUrl: `${activity.checkedBy}.png`,
                },
            };
            result.push(notificationObject);
        });

        return NextResponse.json(result);
    } catch(err){
        return new NextResponse('Internal Error', { status: 500 })
    }
}