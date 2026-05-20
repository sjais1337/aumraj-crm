import { authOptions } from '@/libs/authOptions';

import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';  
import { NextResponse } from 'next/server';

export async function GET(
    request: Request
) {
    try{ 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        const groupData = await prisma.group.findFirst({
            where: {
                headId: session.user.id
            }
        });

        if(!groupData.scores){
            return new NextResponse('User does not have the required permissions!', { status: 401 })
        }

        let data = [];

        if (groupData?.members && Array.isArray(groupData.members) && groupData.members.length > 0) {
            const membersList = groupData.members.map((id) => `'${id}'`).join(', ');
            data = await prisma.$queryRawUnsafe(`
                SELECT 
                    a.staffsId AS id, 
                    s.name, 
                    s.department, 
                    s.post 
                FROM 
                    activity a 
                JOIN 
                    staffs s 
                ON 
                    s.id = a.staffsId 
                WHERE 
                    a.checked = false 
                    AND s.leaveDate IS NULL 
                    AND a.staffsId IN (${membersList}) 
                GROUP BY 
                    a.staffsId;
            `);
        } 

        return NextResponse.json(data);
    } catch(err){
        console.log(err);
        return new NextResponse('Internal Error', { status: 500 })
    }
}
