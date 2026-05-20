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

        await prisma.$transaction(async (prisma) => {
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

        const otherPersonIdsString = otherPersonIds.map(i => `'${i}'`).join(',');

        const updateQueries = [
            `UPDATE activity SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
            `UPDATE funnel SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
            `UPDATE support SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
            `UPDATE sla SET personId = "${personId}", companyId = "${companyId}" WHERE personId IN (${otherPersonIdsString});`,
        ];

        for (const query of updateQueries) {
            await prisma.$queryRawUnsafe(query);
        }

        const personStaffs = await prisma.personStaff.findMany({
            where: {
                personId: {
                    in: [personId, ...otherPersonIds],
                },
            },
        });

        const uniquePersonStaffs = Array.from(
            new Map(
                personStaffs.map(item => [`${item.personId}_${item.staffId}`, item])
                ).values()
            ).map(i => ({ personId: personId, staffId: i.staffId }));

        await prisma.$queryRawUnsafe(
            `DELETE FROM personstaff WHERE personId IN (${[personId, ...otherPersonIds].map(i => `'${i}'`).join(',')});`
        );

        if (uniquePersonStaffs.length > 0) {
            await prisma.personStaff.createMany({
                data: uniquePersonStaffs,
                skipDuplicates: true,
            });
        }

        await prisma.$queryRawUnsafe(
            `DELETE FROM person WHERE personId IN (${otherPersonIdsString});`
        );

        if (otherCompanyIds.length > 0) {
            await prisma.customer.deleteMany({
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
