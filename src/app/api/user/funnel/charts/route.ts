import { authOptions } from '@/libs/authOptions';

import { financialYear } from '@/libs/consts';
import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prepareFunnelFilterModel } from '@/libs/funnelFilters';

export async function POST(
    request: Request
) {
    try{ 

        const session = await getServerSession(authOptions);
        
        if(!session){
            return new NextResponse('User not authenticated.', { status: 401 })
        }
        
        const body = await request.json();

        const filters = prepareFunnelFilterModel(body.filters ?? {});

        const { start, end } = financialYear();

        filters['staffsId'] = session.user.id;
        filters['date'] = {
            gte: start, 
            lte: end
        }

        const data = (await prisma.funnel.findMany({
            where: filters,
            select: {
                status: true,
                bottomLine: true,
                topLine: true
            }
        }));

        return NextResponse.json(data);
    }catch(err){ 
        

        return new NextResponse('Internal error', { status: 500 })
    }
}