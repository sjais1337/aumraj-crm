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

        const body = await request.json();

        let filterModel = {};
        if(body.from != ''){
            const tod = new Date(body.to);
            const lte = new Date(new Date(tod.setMonth(tod.getMonth() + 1)).setDate(-1))
            const gte = new Date(new Date(body.from).setDate(1))
            
            filterModel['date'] = {
                gte: gte,
                lte: lte
            }
        }else{
            const tod = new Date();
            const lte = new Date(new Date(tod.setMonth(tod.getMonth() + 1)).setDate(-1))
            const gte = new Date(new Date(tod.setMonth(tod.getMonth() - 13)).setDate(1))

            filterModel['date'] = {
                gte: gte,
                lte: lte
            }
        }
        if(!body.employee){
            filterModel['employee'] = { leaveDate: null }
        }
        if(body.employee){
            filterModel['staffsId'] = body.employee
        }

        const data = (await prisma.activity.findMany({
            select:{
                employee: true,
                score: true,
                date: true
            },
            where: filterModel
        })).map(i => {
            i['name'] = i.employee.name;
            i['id'] = i.employee.id;
            delete i.employee;
            return i;
        });

        let salaryModel = {};

        if(!body.employee){
            salaryModel['leaveDate'] = null;
        }
        if(body.employee){
            salaryModel['id'] = body.employee;
        }

        const salaries = (await prisma.staffs.findMany({
            where: salaryModel,
            select: {
                salary: true,
		joinDate: true,
                id: true
            }
        }))

        return NextResponse.json({
            scores: data,
            salaries: salaries
        });

 
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
