import prisma from '@/libs/prismadb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';


export async function GET(
    request: Request
) {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    const select = parseInt(url.searchParams.get('select'));

    const session = await getServerSession(authOptions);
    if(!session) { 
        return new NextResponse('User not authenticated.', { status: 401 })
    }
  
    if (!query) {
        return NextResponse.json([]);
    }


    const resultsActivity = (await prisma.activity.findMany({
        where: {
            Customer: {
                companyName: {
                    contains: query
                }
            },
            location: {
                in: ['Meeting', 'Telecalling']
            },
        },
        select: {
            employee: true,
            location: true,
            person: true,
            Customer: true,
            date: true
        },
        orderBy: {
            date: 'desc'
        },
        take: select == 5 ? 5 : 999
    })).map(i => {
        return {
            name: i.employee.name,
            type: i.location,
            personName: i.person.personName,
            companyName: i.Customer.companyName,
            date: i.date
        }
    });

    const resultsFunnel = (await prisma.funnel.findMany({
        where: {
            Customer: {
                companyName: {
                    contains: query
                }
            },
            status: {
                notIn: ['Hot', 'Mild','Cold']
            }
        },
        select: {
            employee: true,
            Customer: true,
            status: true,
            date: true,
            person: true
        },
        orderBy: {
            date: 'desc'
        },
        take: select == 5 ? 5 : 999
    })).map(i => {
        return {
            name: i.employee.name,
            type: 'funnel',
            status: i.status,
            personName: i.person.personName,
            companyName: i.Customer.companyName,
            date: i.date
        }
    })

    const results = [...resultsFunnel, ...resultsActivity].sort(function(a,b){
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json(results);
}