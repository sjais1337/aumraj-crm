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

        let { type, opportunity, oem, description, topLine, bottomLine, status, closureDate, staffsId, isNewCompany, isNewPerson } = body;

        let companyId, personId;

        if(isNewCompany){
            const newId = (await prisma.customer.create({
                data: {
                    companyName: body.companyName,
                }
            })).customerId;

            companyId = newId
        }else{
            companyId = body.companyId
        }

        if(isNewPerson){
            const newPersonId = (await prisma.person.create({
                data: {
                    personName: body.personName,
                    emailId: body.emailId,
                    phoneNo: body.phoneNo,
                    companyId: companyId,
                    entryCount: 1
                }
            })).personId;

            const newStaffPerson = (await prisma.personStaff.create({
                data: {
                    staffId: session.user.id,
                    personId: newPersonId
                }
            }))

            personId = newPersonId
        }else{
            personId = body.personId
        }

        const user = await prisma.funnel.create({
            data: {
                personId: personId,
                companyId: companyId,
                type: type,
                opportunity: opportunity,
                oem: oem,
                description: description,
                topLine: parseInt(topLine),
                bottomLine: parseInt(bottomLine),
                status: status,
                closureDate: new Date(closureDate),
                staffsId: session.user.id
            }
        })

        return NextResponse.json(user)

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}
