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

        const {filterModel} = body;

        filterModel.location = 'Meeting'
        filterModel.staffsId = session.user.id;
        
        const now = new Date();

        if(!filterModel.date){
            filterModel.date = {
                gte: new Date(now.getFullYear(), now.getMonth(), 1),
                lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            }
        }


        const data = (await prisma.activity.aggregate({
            _sum: {
                distance: true,
                parkingCost: true
            },
            where: filterModel
        }))

        const cost = (await prisma.staffs.findUnique({
            select:{
                conveyanceCost: true
            },
            where:{ 
                id: session.user.id
            }
        })).conveyanceCost;

        console.log(cost);

        const distance = data._sum.distance;
        const parking = data._sum.parkingCost;
        return NextResponse.json({ 
            distance: distance,
            parking: parking,
            cost: distance*cost + parking
        });
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}