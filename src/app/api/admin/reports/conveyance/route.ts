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

        if(!session.user.admin) { 
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const body = await request.json()
        let { startRow, endRow, filterModel, sortModel } =  body;

        filterModel.location = 'Meeting'

        const data = (await prisma.activity.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select:{
                activityId: true,
                date: true,
                activity: true,
                fromLocation: true,
                toLocation: true,
                distance: true,
                parkingCost: true,
                staffsId: true,
                employee: true,
                Customer: true,
                person: true
            },
            where: filterModel,
            orderBy: sortModel
        })).map(i => {
            delete i.staffsId;

            i['staffsId'] = i.employee.name;
            i['companyName'] = i.Customer.companyName;
            i['personName'] = i.person.personName;
            i['emailId'] = i.person.emailId;
            i['phoneNo'] = i.person.phoneNo;

            delete i.person;
            delete i.Customer;
            delete i.employee;
            return i;
        });

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
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}