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

        const data = await prisma.group.findMany({});
        let userReference = {}
        const employees = await prisma.staffs.findMany({
            select: {
                name: true,
                id: true
            }
        });

        employees.forEach(i => {
            userReference[i.id] = i.name;
        })
        
        const final = data.map(i => {
            const members = i.members;
            //@ts-ignore
            const modifiedMembers = members.map(i => userReference[i])


            i.members = modifiedMembers

            return i;
        })

        return NextResponse.json(final);
    }catch(err) { 
        return new NextResponse('Internal Error', { status: 500 })
    }
}