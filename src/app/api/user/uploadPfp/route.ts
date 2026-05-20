
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';


export async function POST(req: NextRequest, res: NextResponse){
    const session = await getServerSession(authOptions);

    
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

        const filename = session?.user.id + '.png';


        await writeFile(
            path.join(process.cwd(), 'public/images/pfp', filename), buffer
        )

        return NextResponse.json({ Message: 'Successfully changed the profile picture!', status: 201})
    
    } catch (error) {

        return NextResponse.json({ Message: 'Uknown server error occurred!', status: 500 })
    
    }

    
}