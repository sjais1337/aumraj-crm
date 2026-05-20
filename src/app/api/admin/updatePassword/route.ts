import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';


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
        const password = url.searchParams.get('pass');
        const userId = url.searchParams.get('id');
    
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const updated = await prisma.staffs.update({
            where: {
                id: userId
            },
            data: {
                hash: hashedPassword,
                updatedAt: new Date()
            }
        })

        return NextResponse.json(updated);
    }catch(err) { 
        return new NextResponse('Internal Error', { status: 500 })
    }
}