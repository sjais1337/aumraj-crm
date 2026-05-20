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

        if(Object.keys(filterModel).length == 0 && !session.user.slaReport){
            filterModel.staffsId = session?.user.id;
        }

        const data = (await prisma.sla.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select: {
                slaId: true,
                slaEndDate: true,
                slaStartDate: true,
                oem: true,
                sla: true,
//		serialNo: true,
                contractId: true,
                supportType: true,
                pdfLocation: true,
                productDescription: true,
                employee: true,
                staffsId: true,
                Customer: true,
		serialNo: true
            },
            where: filterModel,
            orderBy: sortModel
        })).map(i => {
            i['companyName'] = i.Customer.companyName;
            i['staffsId'] = i.employee.name;

            delete i.employee;
            delete i.Customer;
            return i;
        });

        const count = (await prisma.sla.count({
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
