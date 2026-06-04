import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

// 👇 لضمان عدم حدوث MissingSchemaError أثناء الـ Populate
import '@/lib/models/Category';
import '@/lib/models/Brand';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    // جلب المفضلة مع تفاصيل المنتجات والفئات الخاصة بها
    let wishlist = await Wishlist.findOne({ user: decoded.userId }).populate({
      path: 'products',
      populate: [{ path: 'category' }, { path: 'brand' }]
    });

    if (!wishlist) {
      wishlist = new Wishlist({ user: decoded.userId, products: [] });
      await wishlist.save();
    }

    // 👇 هنا التعديل الأهم: نرجع مصفوفة المنتجات مباشرة عشان الـ Frontend يعرف يقرأها
    return NextResponse.json({ data: wishlist.products }, { status: 200 });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { productId } = body;

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    let wishlist = await Wishlist.findOne({ user: decoded.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: decoded.userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'products',
      populate: [{ path: 'category' }, { path: 'brand' }]
    });

    return NextResponse.json({ message: 'Product added to wishlist', data: wishlist.products }, { status: 200 });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}