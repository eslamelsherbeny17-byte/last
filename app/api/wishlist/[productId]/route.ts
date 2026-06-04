import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

import '@/lib/models/Product';
import '@/lib/models/Category';
import '@/lib/models/Brand';

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const wishlist = await Wishlist.findOne({ user: decoded.userId });

    if (!wishlist) {
      return NextResponse.json({ message: 'Wishlist not found' }, { status: 404 });
    }

    // فلترة المصفوفة لحذف المنتج المطلوب
    wishlist.products = wishlist.products.filter((p: any) => p.toString() !== params.productId);

    await wishlist.save();
    await wishlist.populate({
      path: 'products',
      populate: [{ path: 'category' }, { path: 'brand' }]
    });

    return NextResponse.json({ message: 'Product removed from wishlist', data: wishlist.products }, { status: 200 });
  } catch (error) {
    console.error('Wishlist delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}