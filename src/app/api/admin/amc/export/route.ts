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
            return new NextResponse('User is not an admin.', { status: 401 })
        }
        
        const body = await request.json()
        let { filterModel } =  body;

        const data = (await prisma.sla.findMany({
            select: {
                staffsId: true,
                sla: true,
                oem: true,
                supportType: true,
                slaStartDate: true,
                slaEndDate: true,
                contractId: true,
                serialNo: true,
                productDescription: true,
                archived: true,
                employee: true,
                person: true,
                Customer: true,
            },
            where: filterModel,
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
        
        return NextResponse.json(data);
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}