import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubCategory from '@/lib/models/SubCategory';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const subCategories = await SubCategory.find({}).populate('category', 'name').lean();

    const subCategoriesWithCount = await Promise.all(
      subCategories.map(async (subCat) => {
        const productsCount = await Product.countDocuments({ subCategory: subCat._id });
        return { ...subCat, productsCount };
      })
    );

    return NextResponse.json({ data: subCategoriesWithCount }, { status: 200 });
  } catch (error) {
    console.error('SubCategories GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const formData = await req.formData();
    const name = formData.get('name') as string;
    // ✨ تأكد إن الواجهة الأمامية بتبعت الحقل باسم 'categoryId' بالظبط
    const categoryId = formData.get('categoryId') as string; 
    const image = formData.get('image') as File;

    if (!name || !categoryId) {
      return NextResponse.json({ message: 'Name and Category ID are required' }, { status: 400 });
    }

    let imageUrl = '';
    if (image && image.size > 0) {
      imageUrl = await uploadToCloudinary(image);
    }

    const subCategory = new SubCategory({
      name,
      category: categoryId,
      image: imageUrl,
    });

    await subCategory.save();

    return NextResponse.json(
      { message: 'SubCategory created successfully', data: subCategory },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('SubCategory creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}