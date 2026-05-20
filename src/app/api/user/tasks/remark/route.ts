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

        let { remark, id } = body;


        const task = await prisma.tasks.update({
            where: {
                id: id
            },
            data: {
                remark: remark,
                taskChecked: true,
                markTime: new Date()
            }
        })

        return NextResponse.json(task);

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}