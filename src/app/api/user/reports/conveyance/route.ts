import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";

export async function POST(
    request: Request
){
    try { 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const body = await request.json()
        let { startRow, endRow, filterModel, sortModel } =  body;

        filterModel.staffsId = session?.user.id;
        filterModel.location = 'Meeting'

        const data = (await prisma.activity.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select:{
                activityId: true,
                date: true,
                activity: true,
                Customer: true,
                companyId: true,
                fromLocation: true,
                toLocation: true,
                distance: true,
                parkingCost: true,
            },
            where: filterModel,
            orderBy: sortModel
        })).map(i => {
            if(i.companyId){
                i['companyName'] = i.Customer.companyName;
            }

            delete i.companyId;
            delete i.Customer;
            return i;
        });;

        const count = (await prisma.activity.count({
            where: filterModel
        }))
        
        return NextResponse.json({ 
            data: { 
                data: data,
                count: count
            }
        });
    }catch(err) { 
        return new NextResponse('Internal Error', { status: 500 })
    }
}