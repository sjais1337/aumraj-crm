import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";

export async function GET(
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

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        const deleted = await prisma.group.delete({
            where: {
                id: id 
            }
        })

        return NextResponse.json(deleted);
    }catch(err) { 
        return new NextResponse('Internal Error', { status: 500 })
    }
}