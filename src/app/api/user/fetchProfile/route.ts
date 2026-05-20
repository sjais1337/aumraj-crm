import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await getServerSession(authOptions);

    if(!session) { 
        return new NextResponse('User not authenticated.', { status: 401 })
    }

    const data = await prisma.staffs.findUnique({
        where: {
            id: session?.user.id 
        },
        select:{
            name: true,
            joinDate: true,
            birthDate: true,
            anniversaryDate: true,
            salary: true,
            panNo: true,
            aadharNo: true,
            emailId: true,
            phoneNo: true,
            department: true,
            post: true,
            conveyanceCost: true,
        }
    })
 
    if(session){
        return NextResponse.json(data);
    }else{
        return new NextResponse('Internal Error', { status: 500 })
    }
}