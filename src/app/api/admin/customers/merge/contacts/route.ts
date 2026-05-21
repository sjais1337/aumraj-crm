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

        if (otherPersonIds.length === 0) {
            return NextResponse.json({ personId });
        }

        await prisma.$transaction(async (tx) => {
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

            const otherPersonIdsString = otherPersonIds.map((id) => `'${id}'`).join(',');

            const updateQueries = [
                `UPDATE activity SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
                `UPDATE funnel SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
                `UPDATE support SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
                `UPDATE sla SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
            ];

            for (const query of updateQueries) {
                await tx.$queryRawUnsafe(query);
            }

            const personStaffs = await tx.personStaff.findMany({
                where: {
                    personId: {
                        in: [personId, ...otherPersonIds],
                    },
                },
            });

            const uniquePersonStaffs = Array.from(
                new Map(
                    personStaffs.map((item) => [`${item.staffId}`, item])
                ).values()
            ).map((item) => ({ personId, staffId: item.staffId }));

            const allPersonIds = [personId, ...otherPersonIds]
                .map((id) => `'${id}'`)
                .join(',');

            await tx.$queryRawUnsafe(
                `DELETE FROM personstaff WHERE personId IN (${allPersonIds});`
            );

            if (uniquePersonStaffs.length > 0) {
                await tx.personStaff.createMany({
                    data: uniquePersonStaffs,
                    skipDuplicates: true,
                });
            }

            await tx.$queryRawUnsafe(
                `DELETE FROM person WHERE personId IN (${otherPersonIdsString});`
            );

            if (otherCompanyIds.length > 0) {
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
