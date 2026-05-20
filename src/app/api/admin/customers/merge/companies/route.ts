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
            return new NextResponse('User is not an admin.', { status: 401 })
        }
        
        const ids = await request.json();

        const { personId, companyId } = ids.splice(0, 1)[0];
        
        const otherPersonIds = ids.map(i => i.personId);
        const otherCompanyIds = ids.map(i => i.companyId).filter(i => i !== companyId);
        
        const otherCompanyIdsFormatted = otherCompanyIds.map(i => `'${i}'`).join(',');
        
        await prisma.person.updateMany({
            where: {
                personId: {
                    in: otherPersonIds,
                },
            },
            data: {
                companyId: companyId,
            },
        });
        
        await prisma.$transaction(async (tx) => {
            await tx.$queryRawUnsafe(`
                UPDATE activity
                SET companyId = ?
                WHERE companyId IN (${otherCompanyIdsFormatted});
            `, companyId);
        
            await tx.$queryRawUnsafe(`
                UPDATE funnel
                SET companyId = ?
                WHERE companyId IN (${otherCompanyIdsFormatted});
            `, companyId);
        
            await tx.$queryRawUnsafe(`
                UPDATE support
                SET companyId = ?
                WHERE companyId IN (${otherCompanyIdsFormatted});
            `, companyId);
        
            await tx.$queryRawUnsafe(`
                UPDATE sla
                SET companyId = ?
                WHERE companyId IN (${otherCompanyIdsFormatted});
            `, companyId);
        
            await tx.$queryRawUnsafe(`
                UPDATE person
                SET companyId = ?
                WHERE companyId IN (${otherCompanyIdsFormatted});
            `, companyId);
        
            await tx.customer.deleteMany({
                where: {
                    customerId: {
                        in: otherCompanyIds,
                    },
                },
            });
        });

        return NextResponse.json({
            personId: personId
        });
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
