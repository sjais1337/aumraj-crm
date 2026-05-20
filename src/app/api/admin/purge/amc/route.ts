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

        if(!session.user.admin) { 
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const body = await request.json()

        const archived = await prisma.sla.deleteMany({
            where: {
                slaId: {
                    in: body
                }
            }
        })

        return NextResponse.json(archived)
    } catch (err) { 
        
    }
}