import { authOptions } from '@/libs/authOptions';

import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { NextResponse } from 'next/server';

export async function GET(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);

        const url = new URL(request.url);
        const userId = url.searchParams.get('user');
        
        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin) {
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const data = (await prisma.activity.findMany({
            select: {
                activityId: true,
                activity: true,
                date: true,
                companyId: true,
                personId: true,
                Customer: true,
                person: true
            },
            where: {
                staffsId: userId,
                checked: false
            },
            orderBy: {
                date: 'desc'
            }
        })).map(i => {
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
            return i;
        })

        return NextResponse.json(data);
    } catch(err){
        return new NextResponse('Internal Error', { status: 500 })
    }
}
