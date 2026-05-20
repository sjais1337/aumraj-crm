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
        let { startRow, endRow, filterModel, sortModel } =  body;


        const data = (await prisma.tasks.findMany({
            skip: startRow,
            take: endRow -  startRow,
            select:{
                id: true,
                date: true,
                message: true,
                remark: true,
                markTime: true,
                employee: true,
            },
            where: filterModel,
            orderBy: sortModel
        })).map(i => {
            
            i['staffsId'] = i.employee.name;
            
            delete i.employee
            return i;
        });

        const count = (await prisma.activity.count({
            where: filterModel
        }))
        
        return NextResponse.json({ 
            data: { 
                data: data,
                count: count
            }
        });
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}