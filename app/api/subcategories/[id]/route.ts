import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubCategory from '@/lib/models/SubCategory';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { id } = params;
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const image = formData.get('image') as File | null;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (categoryId) updateData.category = categoryId;

    if (image && image.size > 0) {
      const imageUrl = await uploadToCloudinary(image);
      updateData.image = imageUrl;
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ message: 'SubCategory updated successfully', data: updatedSubCategory }, { status: 200 });
  } catch (error) {
    console.error('SubCategory update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    await SubCategory.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'SubCategory deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('SubCategory delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}