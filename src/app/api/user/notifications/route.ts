import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";

export async function GET(
    request: Request
){
    try{
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const staffs = (await prisma.staffs.findMany({
            select: {
                id: true,
                name: true
            }
        })).reduce((a,v) => ({ ...a, [v.id]: v.name }));

        const funnelCases = (await prisma.funnel.findMany({
            where: {
                closureDate: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 2)),
                    lte: new Date()
                },
                status: 'Won'
            },
            select: {
                employee: true,
                Customer: true
            }
        })).map(i => {
            return {
                type: 'funnel_added',
                name: i.employee.name,
                companyName: i.Customer.companyName,
                userId: i.employee.id
            }
        });

        const supportAddedCases = (await prisma.support.findMany({
            where: {
                addDate: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 1)),
                    lte: new Date()
                }
            },
            select: {
                employee: true,
                Customer: true
            }
        })).map(i => {
            return {
                type: 'support_added',
                name: i.employee.name,
                companyName: i.Customer.companyName,
                userId: i.employee.id
            }
        });

        const supportClosedCases = (await prisma.support.findMany({
            where: {
                closeDate: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 1)),
                    lte: new Date()
                }
            },
            select: {
                employee: true,
                Customer: true
            }
        })).map(i => {
            return {
                type: 'support_closed',
                name: i.employee.name,
                companyName: i.Customer.companyName,
            }
        });

        const messages = (await prisma.activity.findMany({
            where: {
                staffsId: session.user.id,
                notificationChecked: false,
                NOT: {
                    notification: null
                }
            }
        })).map(i => {
            return {
                type: 'message',
                checkedBy: staffs[i.checkedBy],
                userId: i.checkedBy,
                message: i.notification,
                activityId: i.activityId
            }
        });

        interface OcassionsItems{
            id: string,
            occasion: string
        }

        const occasions = (await prisma.$queryRaw<OcassionsItems[]>`
            SELECT 
                id, 
                'birthday' AS occasion
            FROM 
                staffs
            WHERE 
                DATE_FORMAT(birthDate, '%m-%d') = DATE_FORMAT(CURRENT_DATE, '%m-%d')
            AND 
                leaveDate is null
        
            UNION ALL
        
            SELECT 
                id, 
                'anniversary' AS occasion
            FROM 
                staffs
            WHERE 
                DATE_FORMAT(anniversaryDate, '%m-%d') = DATE_FORMAT(CURRENT_DATE, '%m-%d')
            AND 
                leaveDate is null
        
            UNION ALL
        
            SELECT 
                id, 
                'join' AS occasion
            FROM 
                staffs
            WHERE 
                DATE_FORMAT(joinDate, '%m-%d') = DATE_FORMAT(CURRENT_DATE, '%m-%d')
            AND 
                leaveDate is null;
        
        `).map(i => {
            return {
                type: i.occasion,
                name: staffs[i.id],
                userId: i.id
            }
        });

        const notifications = [ ...occasions, ...messages, ...funnelCases, ...supportAddedCases, ...supportClosedCases];

        return NextResponse.json({ 
            notifications: notifications
        });

    }catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
    


    // return NextResponse.json(data);

}
