import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";

async function getCustomerData(filterModel: any) {
  
    let newFilter:any = [
        filterModel.personName ? { personName: filterModel.personName } : {},
        filterModel.phoneNo ? { phoneNo: filterModel.phoneNo  } : {},
        filterModel.emailId ? { emailId: filterModel.emailId } : {},
        filterModel.companyName ? { company: { companyName: filterModel.companyName } } : {},
    ];

    for (let x of Object.entries(filterModel) ){
        if(!['personName', 'phoneNo', 'emailId', 'companyName', 'employee'].includes(x[0])){
            let temp = {};
            temp['company'] = {};
            temp['company'][x[0]] = x[1]; 
            console.log(temp)
            newFilter.push(temp)
        }
    }

    if(filterModel['employee']){
        const id = (await prisma.staffs.findFirst({
        where: filterModel.employee
        })).id;
        newFilter.push({
        staffs: {
            some: {
            staffId: id
            }
        }
        });
    }
    
    const totalContacts = await prisma.person.count({
        where: {
            AND: newFilter,
        },
    });

    const totalCount = await prisma.customer.count();
  
    return { count: totalCount, contact: totalContacts };
}

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

        let { filterModel } =  body;

        const data = await getCustomerData(filterModel);
        
        return NextResponse.json(data);
    }catch(err) {
        console.log(err) 
        return new NextResponse('Internal Error', { status: 500 })
    }
}
