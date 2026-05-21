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

        const { supportId, field, value } = body;

        let updated = {}

        updated[field] = value
	
	const where: { supportId: string; staffsId?: string } = { supportId };
	if (!session.user.support) {
		where.staffsId = session.user.id;
	}

        const { count } = await prisma.support.updateMany({
            where,
            data: updated
        })

        if (count === 0) {
            return new NextResponse('Not found or forbidden.', { status: 403 })
        }

        const data = await prisma.support.findUnique({
            where: { supportId }
        })

        return NextResponse.json(data);
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
