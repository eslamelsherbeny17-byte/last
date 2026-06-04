import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brand';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

// دالة التعديل (PUT)
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
    const image = formData.get('image') as File | null;

    const updateData: any = {};
    if (name) updateData.name = name;

    // لو رفع صورة جديدة، هنرفعها ونحدث الرابط
    if (image && image.size > 0) {
      const imageUrl = await uploadToCloudinary(image);
      updateData.image = imageUrl;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ message: 'Brand updated successfully', data: updatedBrand }, { status: 200 });
  } catch (error) {
    console.error('Brand update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// دالة الحذف (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    await Brand.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Brand deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Brand delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}