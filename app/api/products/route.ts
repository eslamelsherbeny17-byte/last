import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Brand from '@/lib/models/Brand';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';



export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;

    // 1. إعدادات الصفحات (Pagination)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12'); // 12 منتج عشان يملوا الشبكة (Grid) بشكل متناسق
    const skip = (page - 1) * limit;

    // 2. استخراج المتغيرات من الرابط
    const search = searchParams.get('keyword') || searchParams.get('search') || '';
    const categories = searchParams.getAll('category');
    const brands = searchParams.getAll('brand');
    
    // الفرونت إند بيبعت السعر بالشكل ده price[gte] و price[lte]
    const priceGte = searchParams.get('price[gte]'); 
    const priceLte = searchParams.get('price[lte]');
    const isDiscounted = searchParams.get('isDiscounted');
    const sort = searchParams.get('sort') || '-createdAt';

    let query: any = {};

    // --- أ. فلتر البحث الذكي (يدعم الهمزات والتاء المربوطة) ---
    if (search) {
      const arabicRegex = search
        .replace(/[أإآا]/g, '[أإآا]')
        .replace(/[ةه]/g, '[ةه]')
        .replace(/[يى]/g, '[يى]');

      query.$or = [
        { title: { $regex: arabicRegex, $options: 'i' } },
        { titleAr: { $regex: arabicRegex, $options: 'i' } },
        { description: { $regex: arabicRegex, $options: 'i' } },
        { descriptionAr: { $regex: arabicRegex, $options: 'i' } }
      ];
    }

    // --- ب. فلتر الأقسام (Categories) ---
    if (categories.length > 0 && categories[0] !== 'all' && categories[0] !== '') {
      // معالجة لو الأقسام مبعوتة كمصفوفة أو نص مفصول بفاصلة
      const catArray = categories[0].includes(',') ? categories[0].split(',') : categories;
      query.category = { $in: catArray };
    }

    // --- ج. فلتر الماركات (Brands) ---
    if (brands.length > 0 && brands[0] !== 'all' && brands[0] !== '') {
      const brandArray = brands[0].includes(',') ? brands[0].split(',') : brands;
      query.brand = { $in: brandArray };
    }

    // --- د. فلتر السعر (Price Range) ---
    if (priceGte || priceLte) {
      query.price = {};
      if (priceGte) query.price.$gte = Number(priceGte);
      if (priceLte) query.price.$lte = Number(priceLte);
    }

    // --- هـ. فلتر التخفيضات (Sale) ---
    if (isDiscounted === 'true') {
      // لو المنتج عليه خصم، لازم يكون حقل السعر بعد الخصم موجود وأكبر من صفر
      query.priceAfterDiscount = { $exists: true, $gt: 0 };
    }

    // 3. جلب البيانات من الداتا بيز
    const products = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // 4. جلب العدد الكلي عشان الـ Pagination في الفرونت إند يشتغل
    const total = await Product.countDocuments(query);

    return NextResponse.json(
      {
        results: total,
        paginationResult: {
          currentPage: page,
          limit,
          numberOfPages: Math.ceil(total / limit),
        },
        data: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Products fetch error:', error);
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
    
    const title = formData.get('title') as string;
    const titleAr = formData.get('titleAr') as string || title;
    const description = formData.get('description') as string;
    const descriptionAr = formData.get('descriptionAr') as string || description;
    const price = parseFloat(formData.get('price') as string);
    const priceAfterDiscount = formData.get('priceAfterDiscount') 
      ? parseFloat(formData.get('priceAfterDiscount') as string) 
      : undefined;
    const imageCover = formData.get('imageCover') as File;
    const quantity = parseInt(formData.get('quantity') as string) || 0;
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string;
    
    // Validate required fields
    if (!title?.trim() || !description?.trim() || !price || !category?.trim()) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, price, category' },
        { status: 400 }
      );
    }

    const colors = formData.getAll('colors[]') as string[];
    const sizes = formData.getAll('sizes[]') as string[];
    const imagesFiles = formData.getAll('images') as File[];

    let imageCoverUrl = '';
    if (imageCover instanceof File && imageCover.size > 0) {
      try {
        imageCoverUrl = await uploadToCloudinary(imageCover);
      } catch (err) {
        console.error('[v0] Image upload failed:', err);
        return NextResponse.json(
          { message: 'Failed to upload cover image' },
          { status: 400 }
        );
      }
    }

    const imageUrls: string[] = [];
    if (imagesFiles && imagesFiles.length > 0) {
      for (const img of imagesFiles) {
        if (img instanceof File && img.size > 0) {
          try {
            const url = await uploadToCloudinary(img);
            imageUrls.push(url);
          } catch (err) {
            console.error('[v0] Additional image upload failed:', err);
          }
        }
      }
    }

    const product = new Product({
      title: title.trim(),
      titleAr: (titleAr || title).trim(),
      description: description.trim(),
      descriptionAr: (descriptionAr || description).trim(),
      price: Number(price),
      priceAfterDiscount: priceAfterDiscount ? Number(priceAfterDiscount) : undefined,
      imageCover: imageCoverUrl || 'https://via.placeholder.com/500',
      images: imageUrls,
      colors: colors.filter(c => c?.trim()),
      sizes: sizes.filter(s => s?.trim()),
      category,
      brand: brand || undefined,
      quantity: Math.max(0, quantity || 0),
      sold: 0,
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });

    await product.save();
    await product.populate('category');
    await product.populate('brand');

    return NextResponse.json(
      {
        message: 'Product created successfully',
        data: product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
