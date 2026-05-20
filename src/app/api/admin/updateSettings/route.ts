import prisma from '@/libs/prismadb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';


export async function POST(
    request: Request
) {
    try{
        const session = await getServerSession(authOptions);

        if(!session){
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin){
            return new NextResponse('User is not admin.', { status: 401 } )
        }

        const body = await request.json();
        
        const { field, value } = body;

        let passData = {}
        passData[field] = value;

        const res = await prisma.settings.updateMany({
            data: passData
        })

        return NextResponse.json(res)

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}