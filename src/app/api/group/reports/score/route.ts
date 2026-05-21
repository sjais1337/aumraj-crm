import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";
import { getDailyMaxScoreRows } from '@/libs/scores';

function buildDateRange(from: string, to: string) {
  if (from != '') {
    const tod = new Date(to);
    const lte = new Date(new Date(tod.setMonth(tod.getMonth() + 1)).setDate(-1));
    const gte = new Date(new Date(from).setDate(1));
    return { gte, lte };
  }

  const tod = new Date();
  const lte = new Date(new Date(tod.setMonth(tod.getMonth() + 1)).setDate(-1));
  const gte = new Date(new Date(tod.setMonth(tod.getMonth() - 13)).setDate(1));
  return { gte, lte };
}

export async function POST(
    request: Request
){
    try { 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const groupData = await prisma.group.findFirst({
            where: {
                headId: session.user.id
            }
        });

        if(!groupData.reports){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }

        const body = await request.json();
        const { gte, lte } = buildDateRange(body.from, body.to);
        const members = groupData.members as string[];

        const data = await getDailyMaxScoreRows({
            start: gte,
            end: lte,
            staffsIds: body.employee ? [body.employee] : members,
            activeStaffOnly: !body.employee,
        });

        let salaryModel = {};

        if(!body.employee){
            salaryModel['leaveDate'] = null;
        }
        if(body.employee){
            salaryModel['id'] = body.employee;
        }

        const salaries = (await prisma.staffs.findMany({
            where: {
                AND: [
                    salaryModel,
                    {
                        id: {
                            in: members
                        }
                    }
                ]
            },
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
