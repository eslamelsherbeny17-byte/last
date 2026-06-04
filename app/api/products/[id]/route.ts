import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

// تسجيل كل الـ Models عشان السيرفر ميفقدش الذاكرة وهو بيعمل populate
import '@/lib/models/Category';
import '@/lib/models/Brand';
import '@/lib/models/Review';
import '@/lib/models/User'; // 👈 السطر اللي كان ناقص

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const product = await Product.findById(params.id)
      .populate('category')
      .populate('brand')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
      });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    console.error('Product detail error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const titleAr = formData.get('titleAr') as string;
    const description = formData.get('description') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const priceAfterDiscount = formData.get('priceAfterDiscount') 
      ? parseFloat(formData.get('priceAfterDiscount') as string) 
      : undefined;
    const imageCover = formData.get('imageCover') as File;
    const quantity = formData.get('quantity') ? parseInt(formData.get('quantity') as string) : undefined;
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string;
    const colors = formData.getAll('colors[]') as string[];
    const sizes = formData.getAll('sizes[]') as string[];
    const imagesFiles = formData.getAll('images') as File[];

    const updateData: any = {};
    if (title) updateData.title = title;
    if (titleAr) updateData.titleAr = titleAr;
    if (description) updateData.description = description;
    if (descriptionAr) updateData.descriptionAr = descriptionAr;
    if (price !== undefined) updateData.price = price;
    if (priceAfterDiscount !== undefined) updateData.priceAfterDiscount = priceAfterDiscount;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (category) updateData.category = category;
    if (brand) updateData.brand = brand;
    if (colors.length > 0) updateData.colors = colors;
    if (sizes.length > 0) updateData.sizes = sizes;

    // Upload new imageCover to Cloudinary if provided
    if (imageCover) {
      updateData.imageCover = await uploadToCloudinary(imageCover);
    }

    // Upload new images to Cloudinary if provided
    if (imagesFiles.length > 0) {
      const imageUrls: string[] = [];
      for (const img of imagesFiles) {
        const url = await uploadToCloudinary(img as File);
        imageUrls.push(url);
      }
      updateData.images = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category')
      .populate('brand');

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Product updated successfully',
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}