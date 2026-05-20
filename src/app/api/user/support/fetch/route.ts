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

	const isSupport = session?.user.support;
        
	if(!isSupport){
		filterModel.staffsId = session?.user.id;
	}	

        if(!filterModel.status){
            filterModel['OR'] = [
                {
                    status: {
                        contains: 'Planning'
                    }
                },
                {
                    status: {
                        contains: 'Progress'
                    }
                }
            ]
        }

        const data = (await prisma.support.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select: {
                supportId: true,
                addDate: true,
                closeDate: true,
                oem: true,
                type: true,
                description: true,
                status: true,
                employee: true,
                staffsId: true,
                Customer: true,
                person: true,
            },
            where: filterModel,
            orderBy: sortModel
        })).map(i => {
            i['staffsId'] = i.employee.name;   
            i['companyName'] = i.Customer.companyName;
            i['personName'] = i.person.personName;
            i['emailId'] = i.person.emailId;
            i['phoneNo'] = i.person.phoneNo;

            delete i.Customer;
            delete i.person;
            delete i.employee;
            return i;
        });

        const count = (await prisma.support.count({
            where: filterModel
        }))
        
        return NextResponse.json({ 
            data: { 
                data: data,
                count: count
            }
        });
    }catch(err) {
        console.log(err) 
        return new NextResponse('Internal Error', { status: 500 })
    }
}
