import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/authOptions';


export async function POST(
    request: Request
) {
    try{
        const body = await request.json();

        const session = await getServerSession(authOptions);
        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin){
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const { name, head, headId, members, scores, funnel, support, reports, hierarchy, sla } = body;

        const group = await prisma.group.create({
            data: {
                name: name,
                head: head,
                headId: headId,
                members: members, 
                scores: scores,
                funnel: funnel,
                support: support,
                reports: reports, 
                hierarchy: hierarchy,
                sla: sla
            }
        })

        return NextResponse.json(group)

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}