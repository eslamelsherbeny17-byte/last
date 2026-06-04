import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

// دالة التعديل (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token!);
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { rating, comment } = await req.json();

    // نتأكد إن اللي بيعدل هو صاحب التقييم نفسه
    const review = await Review.findOneAndUpdate(
      { _id: params.id, user: decoded.userId },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return NextResponse.json({ message: 'غير مصرح لك بتعديل هذا التقييم' }, { status: 403 });
    }

    // تحديث متوسط التقييمات للمنتج
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || r.ratings || 0), 0) / allReviews.length;

    await Product.findByIdAndUpdate(review.product, { ratingsAverage: avgRating });

    return NextResponse.json({ data: review, message: 'تم التعديل بنجاح' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// دالة الحذف (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token!);
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const review = await Review.findById(params.id);
    
    if (!review) return NextResponse.json({ message: 'Review not found' }, { status: 404 });

    // السماح بالحذف لو كان أدمن، أو لو كان هو نفس المستخدم صاحب التقييم
    if (decoded.role !== 'admin' && review.user.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'غير مصرح لك بحذف هذا التقييم' }, { status: 403 });
    }

    await review.deleteOne();

    // تحديث التقييم بعد الحذف
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.length > 0 
        ? allReviews.reduce((sum, r) => sum + (r.rating || r.ratings || 0), 0) / allReviews.length 
        : 0;

    await Product.findByIdAndUpdate(review.product, {
      ratingsAverage: avgRating,
      ratingsQuantity: allReviews.length,
      $pull: { reviews: params.id }
    });

    return NextResponse.json({ message: 'تم الحذف بنجاح' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}