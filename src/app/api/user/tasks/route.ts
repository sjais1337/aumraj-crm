import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";


export async function GET(
    request: Request
){
    try{
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const tasks = (await prisma.tasks.findMany({
            where: {
                AND: [
                    {
                        employee:{
                            id: session.user.id
                        }
                    },
                    {
                        taskChecked: false
                    } 
                ]
                
            }
        }));

        return NextResponse.json(tasks);

    }catch(err){
      return new NextResponse('Internal Error', { status: 500 })
    }
    


    // return NextResponse.json(data);

}