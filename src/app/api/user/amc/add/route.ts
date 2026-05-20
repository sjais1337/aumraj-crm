import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/libs/authOptions";
import prisma from '@/libs/prismadb';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json({ error: 'User not authenticated'}, { status: 401 })
    }

    try { 
        const body = await request.json();

        let { staffsId, supportType, oem, slaStartDate, slaEndDate, description, contractId, serialNo, sla, isNewCompany, isNewPerson} = body
        
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

        const slaEntry = await prisma.sla.create({
            data: {
                companyId: companyId,
                personId: personId,
                staffsId: staffsId,
                supportType: supportType,
                oem: oem,
                slaStartDate: new Date(slaStartDate),
                slaEndDate: new Date(slaEndDate),
                productDescription: description,
                pdfLocation: '',
                contractId: contractId,
                serialNo: serialNo,
                sla: sla
            }
        })

        return NextResponse.json(slaEntry)

    }catch(err){
        console.log(err)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
