import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";
import { formatDate } from "@/libs/consts";

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
        let { startRow, endRow, filterModel, sortModel } =  body;

        if(filterModel.status){
            const splitted = filterModel.status.contains.split(',') 
            if(splitted.length > 1){
                delete filterModel.status;
                filterModel.OR = splitted.map(i => { return { status: { contains: i.trim() } } })
            }
        }
        
        if(filterModel['status']){
            filterModel['status'] = {
                in: filterModel['status'].contains.split(',').map(i => i.trim().replace(
                    /\w\S*/g,
                    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                ))
            }
        }

        if(Object.keys(filterModel).length == 0){
            filterModel['status'] = {
                in: ['Hot', 'Mild', 'Cold']   
            }
        }

        console.log(sortModel);

        const data = (await prisma.funnel.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select: {
                funnelId: true,
                date: true,
                closureDate: true,
                type: true,
                oem: true,
                status: true,
                topLine: true,
                bottomLine: true,
                opportunity: true,
                description: true,
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

        const count = (await prisma.funnel.count({
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
