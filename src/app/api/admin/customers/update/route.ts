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
            return new NextResponse('User is not an admin.', { status: 401 })
        }
        
        const body = await request.json()

        const { id, field, value, company } = body;

        let updated = {}

        updated[field] = value

        let data = {}

        if(company){
            data = await prisma.customer.update({
                where: {
                    customerId: id
                }, 
                data: updated
            })
        }else{
            data = await prisma.person.update({
                where: {
                    personId: id
                },
                data: updated
            }) 
        }

        return NextResponse.json(data);
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}