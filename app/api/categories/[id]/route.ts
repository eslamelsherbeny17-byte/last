import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

// ==========================================
// 1. جلب فئة واحدة بالـ ID (GET)
// ==========================================
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ data: category }, { status: 200 });
  } catch (error) {
    console.error('Fetch category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ==========================================
// 2. تعديل الفئة والصورة (PUT)
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const image = formData.get('image');

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // تحديث النصوص
    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    // تحديث الصورة لو تم رفع ملف جديد
    if (image instanceof File && image.size > 0) {
      try {
        const imageUrl = await uploadToCloudinary(image);
        category.image = imageUrl;
      } catch (err) {
        console.error('Image upload failed:', err);
        return NextResponse.json({ message: 'Failed to upload image' }, { status: 500 });
      }
    }

    await category.save();

    return NextResponse.json(
      { message: 'Category updated successfully', data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ==========================================
// 3. حذف الفئة (DELETE)
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { id } = params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}