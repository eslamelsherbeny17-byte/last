import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product'; // ✨ تم إضافة موديل المنتجات
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // ✨ استخدمنا lean() عشان نقدر نعدل على النتيجة ونضيفلها عدد المنتجات
    const categories = await Category.find({}).lean();

    // ✨ حساب عدد المنتجات لكل فئة
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        // بنعد المنتجات اللي الـ category بتاعها بيساوي الـ _id بتاع الفئة الحالية
        const productsCount = await Product.countDocuments({ category: category._id });
        
        return {
          ...category,
          productsCount // ضفنا الرقم هنا
        };
      })
    );

    return NextResponse.json({ results: categoriesWithCount.length, data: categoriesWithCount }, { status: 200 });
  } catch (error) {
    console.error('Categories list error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const formData = await req.formData();
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const image = formData.get('image') as File;

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    let imageUrl = '';
    if (image instanceof File && image.size > 0) {
      try {
        imageUrl = await uploadToCloudinary(image);
      } catch (err) {
        console.error('[v0] Category image upload failed:', err);
        imageUrl = 'https://via.placeholder.com/200';
      }
    }

    const category = new Category({
      name,
      description: description || '',
      image: imageUrl || 'https://via.placeholder.com/200',
    });

    await category.save();

    return NextResponse.json(
      {
        message: 'Category created successfully',
        data: category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Category creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}