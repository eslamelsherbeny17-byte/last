import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    let query: any = {};
    if (productId) query.product = productId;

    const reviews = await Review.find(query)
      .populate('user', 'name profileImg email')
      .populate('product', 'title imageCover')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return NextResponse.json(
      {
        data: reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reviews fetch error:', error);
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
    // 👇 هنا صلحنا المسميات عشان تطابق الداتا بيز
    const { productId, rating, comment } = body;

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const review = new Review({
      product: productId,
      user: decoded.userId,
      rating,   // 👈 مفرد
      comment,  // 👈 تعليق
    });

    await review.save();
    await review.populate('user', 'name profileImg');
    await review.populate('product', 'title');

    const allReviews = await Review.find({ product: productId });
    // 👇 هنا بنجمع الـ rating الصح
    const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: avgRating,
      ratingsQuantity: allReviews.length,
      $push: { reviews: review._id },
    });

    return NextResponse.json({ message: 'Review created successfully', data: review }, { status: 201 });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}