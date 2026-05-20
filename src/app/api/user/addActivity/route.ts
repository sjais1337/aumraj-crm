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

        const { activity, type, date, from, to, km, parking, isNewCompany, isNewPerson } = body;

        let companyId, personId;
        let output; 
        
        if(type == 'Office'){
            output = await prisma.activity.create({
                data: { 
                    date: new Date(date),
                    activity: activity,
                    location: type,
                    personId: null,
                    companyId: null,
                    fromLocation: null,
                    toLocation: null ,
                    distance: null,
                    parkingCost: null,
                    staffsId: session.user.id,
                    checked: false,
                    checkedBy: '',
                    notificationChecked: null
                }
            });
        }else{
            
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
    
            output = await prisma.activity.create({
                data: { 
                    date: new Date(date),
                    activity: activity,
                    location: type,
                    personId: personId,
                    companyId: companyId,
                    fromLocation: from == '' || undefined ? null : from,
                    toLocation: to == '' || undefined ? null : to,
                    distance: km == '' || undefined ? null : parseFloat(km),
                    parkingCost: parking == '' || undefined? null : parseInt(parking),
                    staffsId: session.user.id,                    
                    checked: false, 
                    checkedBy: '',
                    notificationChecked: null
                }
            })
        }


        return NextResponse.json(output)

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}
