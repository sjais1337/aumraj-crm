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
        let { startRow, endRow, filterModel, sortModel } =  body;

	const count = (await prisma.sla.count({
            where: {
                AND: [
                    {
                        slaEndDate: {
                            gte: new Date()
                        },
                        archived: false
                    },
                    filterModel
                ]
            }
        }))
        
        return NextResponse.json({ 
            count: count
        });
    }catch(err) { 
        return new NextResponse('Internal Error', { status: 500 })
    }
}
