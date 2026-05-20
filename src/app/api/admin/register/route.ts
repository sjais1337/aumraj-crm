import bcrypt from 'bcrypt';
import prisma from '@/libs/prismadb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';

export async function POST(
    request: Request
) {
    try{
        const body = await request.json();

        const session = await getServerSession(authOptions);

        if(!session){
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin){
            return new NextResponse('User is not admin.', { status: 401 } )
        }

        const {
            email,
            name,
            password,
            phone,
            post,
            salary,
            department,
            aadharNo,
            pan,
            joinDate,
            birthDate,
            anniversaryDate,
            slaEntryPerms,
            slaReportPerms,
            supportPerms
        } = body;


        if(!email || !name || !password) { 
            return new NextResponse('Missing Info', { status: 400 } )
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.staffs.create({
            data: { 
                hash: hashedPassword,
                emailId: email,
                name: name,
                phoneNo: phone,
                department: department,
                salary: parseInt(salary),
                joinDate: new Date(joinDate),
                birthDate: new Date(birthDate),
                anniversaryDate: anniversaryDate == '' ? null : new Date(anniversaryDate),
                aadharNo: aadharNo,
                panNo: pan,
                post: post,
                permissions: {
                    create: {
                        slaEntry: slaEntryPerms,
                        slaReport: slaReportPerms,
                        support: supportPerms,
                        admin: false,
                        funnel: false
                    }
                }
            }
        })

        return NextResponse.json(user)

    } catch(err: any) {
        console.log(err, 'REGISTRATION ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }  
}
