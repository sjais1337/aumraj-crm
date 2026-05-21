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
        
        const rows = [...(await request.json())];

        if (rows.length < 2) {
            return new NextResponse('Select at least two rows to merge.', { status: 400 })
        }

        const [survivor, ...others] = rows;
        const { personId, companyId } = survivor;
        const otherPersonIds = others.map((i) => i.personId);
        const otherCompanyIds = others
            .map((i) => i.companyId)
            .filter((id) => id && id !== companyId);

        await prisma.$transaction(async (tx) => {
            if (otherPersonIds.length > 0) {
                await tx.person.updateMany({
                    where: {
                        personId: {
                            in: otherPersonIds,
                        },
                    },
                    data: {
                        companyId: companyId,
                    },
                });
            }

            if (otherCompanyIds.length > 0) {
                const otherCompanyIdsFormatted = otherCompanyIds
                    .map((id) => `'${id}'`)
                    .join(',');

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
            }
        });

        return NextResponse.json({
            personId: personId
        });
    }catch(err) { 
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
