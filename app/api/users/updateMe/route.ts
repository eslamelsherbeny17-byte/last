import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'الرجاء تسجيل الدخول أولاً' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    
    // منع المستخدم من تغيير الباسورد أو الرول من هذا المسار
    const { password, role, isEmailVerified, ...updateData } = body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ message: 'تم تحديث البيانات بنجاح', data: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('UpdateMe Error:', error);
    return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}