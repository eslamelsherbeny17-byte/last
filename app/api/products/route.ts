import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Brand from '@/lib/models/Brand';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';


export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 💡 استخدام nextUrl يضمن قراءة الكلمات العربية بدون مشاكل
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // استخراج كلمة البحث
    const search = searchParams.get('keyword') || searchParams.get('search') || '';
    
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort') || '-createdAt';

    const skip = (page - 1) * limit;

    let query: any = {};

   // بدلاً من الـ $regex، استخدم $text في الـ query لو عايز نتائج أدق
if (search) {
  query.$text = { $search: search }; 
}

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    const products = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json(
      {
        results: total,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Products list error:', error);
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
