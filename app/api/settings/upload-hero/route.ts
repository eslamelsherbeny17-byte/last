import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });

    const imageUrl = await uploadToCloudinary(file);
    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}