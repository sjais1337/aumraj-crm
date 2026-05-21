import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";
import { queryCustomerGridRows, queryCustomerCounts } from '@/libs/customerQuery';

export async function POST(
    request: Request
){
    try { 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin) { 
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const body = await request.json()

        let { startRow, endRow, filterModel, sortModel } =  body;

        const [data, counts] = await Promise.all([
            queryCustomerGridRows(
                filterModel ?? {},
                sortModel,
                startRow,
                endRow
            ),
            queryCustomerCounts(filterModel ?? {}),
        ]);
        
        return NextResponse.json({
            data,
            contact: counts.contact,
        });
    }catch(err) {
        console.log(err) 
        return new NextResponse('Internal Error', { status: 500 })
    }
}
