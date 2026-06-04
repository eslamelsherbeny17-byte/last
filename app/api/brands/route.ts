import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brand';
import Product from '@/lib/models/Product'; // ✨ تم استدعاء المنتجات
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // ✨ جلب الماركات بصيغة lean للتعديل عليها
    const brands = await Brand.find({}).lean();

    // ✨ حساب عدد المنتجات المربوطة بكل ماركة
    const brandsWithCount = await Promise.all(
      brands.map(async (brand) => {
        const productsCount = await Product.countDocuments({ brand: brand._id });
        return {
          ...brand,
          productsCount
        };
      })
    );

    return NextResponse.json({ data: brandsWithCount }, { status: 200 });
  } catch (error) {
    console.error('Brands list error:', error);
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
    const image = formData.get('image'); // ✨ سيبناها من غير as File مؤقتاً عشان نفحصها

    console.log("📥 البيانات اللي وصلت للباك إند:", { name, isImageAttached: !!image });

    let imageUrl = '';
    
    // التأكد الصارم من إن الصورة عبارة عن ملف فعلي وحجمه أكبر من صفر
    if (image instanceof File && image.size > 0) {
      console.log("🚀 جاري رفع الصورة إلى Cloudinary...");
      try {
        imageUrl = await uploadToCloudinary(image);
        console.log("✅ تم رفع الصورة بنجاح:", imageUrl);
      } catch (uploadError) {
        console.error("🔥 فشل رفع الصورة لـ Cloudinary:", uploadError);
      }
    } else {
      console.log("⚠️ لم يتم استلام ملف صورة صالح.");
    }

    const brand = new Brand({
      name,
      image: imageUrl, // لو الرفع فشل أو مفيش صورة، هتتخزن فاضية
    });

    await brand.save();

    return NextResponse.json(
      { message: 'Brand created successfully', data: brand },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Brand creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}