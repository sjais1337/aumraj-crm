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

        const groupData = await prisma.group.findFirst({
            where: {
                headId: session.user.id
            }
        });

        if(!groupData.reports){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }

        const body = await request.json()

        const {filterModel} = body;

        filterModel.location = 'Meeting'

        const data = (await prisma.activity.groupBy({
            by: ['staffsId'], // Group by staffsId
            _sum: {
                distance: true,
                parkingCost: true,
            },
            where: {
                AND: [
                    {
                        employee: {
                            id: {
                                in: groupData.members
                            }
                        }
                    },
                    filterModel
                ]
            },
        }));

        const staffIds = data.map(group => group.staffsId); 

        const cost = (await prisma.staffs.findMany({
            select: {
                id: true,
                conveyanceCost: true,
            },
            where: {
                id: {
                    in: staffIds
                }    
            },
        }));

        let distance = 0;
        let parking = 0;
        let totalCost = 0;

        console.log(data, cost)

        data.forEach(i => {
            let costEmp = cost.find(j => j.id == i.staffsId).conveyanceCost;

            distance += i._sum.distance;
            parking += i._sum.parkingCost;
            totalCost += costEmp*i._sum.distance + i._sum.parkingCost;
        })

        // // const distance = data._sum.distance;
        // // const parking = data._sum.parkingCost;
        return NextResponse.json({ 
            distance: distance,
            parking: parking,
            cost: totalCost
        });
    }catch(err) { 
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
