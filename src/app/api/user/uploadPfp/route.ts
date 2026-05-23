import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import sharp from 'sharp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/authOptions';
import { PFP_SIZE } from '@/libs/profilePhoto';

const PFP_DIR = path.join(process.cwd(), 'public/images/pfp');
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user authenticated' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
    }

    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 5 MB.' },
        { status: 400 }
      );
    }

    let resized: Buffer;
    try {
      resized = await sharp(buffer)
        .rotate()
        .resize(PFP_SIZE, PFP_SIZE, {
          fit: 'cover',
          position: 'centre',
        })
        .png({ compressionLevel: 9 })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: 'Invalid image file. Use PNG, JPG, or WebP.' },
        { status: 400 }
      );
    }

    const filename = `${session.user.id}.png`;

    await mkdir(PFP_DIR, { recursive: true });
    await writeFile(path.join(PFP_DIR, filename), resized);

    return NextResponse.json(
      { message: 'Profile photo updated.' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Could not save profile photo.' },
      { status: 500 }
    );
  }
}
