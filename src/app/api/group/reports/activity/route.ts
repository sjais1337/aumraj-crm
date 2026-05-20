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

        const groupData = await prisma.group.findFirst({
            where: {
                headId: session.user.id
            }
        });

        if(!groupData.reports){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }
        
        const body = await request.json()
        let { startRow, endRow, filterModel, sortModel } =  body;

        console.log(filterModel);

        const data = (await prisma.activity.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select:{
                date: true,
                location: true,
                activity: true,
                activityId: true,
                staffsId: true,
                employee: true,
                companyId: true,
                personId: true,
                Customer: true,
                person: true
            },
            where: {
                AND: [
                    {
                        employee: {
                            id: {
                                in: groupData.members
                            }
                        }
                    },
                    filterModel
                ]
            },
            orderBy: sortModel
        })).map(i => {
            
            i['staffsId'] = i.employee.name;
            
            if(i.companyId){
                i['companyName'] = i.Customer.companyName;
            }

            if(i.personId){
                i['personName'] = i.person.personName;
                i['emailId'] = i.person.emailId;
                i['phoneNo'] = i.person.phoneNo;
            }

            delete i.companyId;
            delete i.personId;
            delete i.Customer;
            delete i.person;
            delete i.employee
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
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
