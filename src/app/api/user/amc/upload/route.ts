import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';


export async function POST(req: NextRequest, res: NextResponse){
    const session = await getServerSession(authOptions);

    const url = new URL(req.url);
    const slaid = url.searchParams.get('slaid');
    const extension = url.searchParams.get('extension');
    
    if(!session){
        return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    try {
        const formData = await  req.formData();

        const file = formData.get('file') as Blob | undefined;
        
        if(!file){
            return NextResponse.json({ error: "No files received." }, { status: 400 });
        }  

        let buffer: Buffer;
        
        if (file instanceof Blob) {
        
            buffer = Buffer.from(await file.arrayBuffer());
        
        } else {
        
            throw new Error("File is not a Blob or File.");
        }

        const filename = slaid + '.' + extension;

        const location = await prisma.sla.update({
            where: {
                slaId: slaid
            },
            data: {
                pdfLocation: filename
            }
        })

        await writeFile(
            path.join(process.cwd(), 'public/uploads/', filename), buffer
        )

        return NextResponse.json({ Message: 'Successfully changed the profile picture!', status: 201})
    
    } catch (error) {

        return NextResponse.json({ Message: 'Uknown server error occurred!', status: 500 })
    
    }
}