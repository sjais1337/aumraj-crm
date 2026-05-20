import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/authOptions';


export async function POST(
    request: Request
) {
    try{
        const body = await request.json();

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
        let { score, message, activityIds } = body;


        const user = await prisma.activity.updateMany({
            where: {
                activityId: {
                    in: activityIds
                }
            },
            data: {
                score: score,
                notification: message,
                checked: true,
                notificationChecked: false,
                checkedBy : session.user.id
            }
        })

        return NextResponse.json(user)

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}
