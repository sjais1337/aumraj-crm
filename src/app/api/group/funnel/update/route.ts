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

        if(!groupData.funnel){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }
        
        const body = await request.json()

        const { funnelId, field, value } = body;

        let updated = {}

        updated[field] = value

        const data = await prisma.funnel.update({
            where: {
                funnelId: funnelId
            }, 
            data: updated
        })

        return NextResponse.json(data);
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
