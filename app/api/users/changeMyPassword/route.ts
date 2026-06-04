import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getTokenFromRequest, verifyToken, generateToken } from '@/lib/middleware';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'الرجاء تسجيل الدخول أولاً' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    // ✅ دعم مسميات مختلفة من الفرونت إند لتجنب مشكلة undefined
    const currentPassword = body.currentPassword || body.oldPassword;
    const newPassword = body.newPassword || body.password;

    // ✅ التأكد من أن الفرونت إند أرسل الكلمات فعلاً قبل محاولة التشفير
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'الرجاء إدخال كلمة المرور الحالية والجديدة' }, { status: 400 });
    }

    // جلب المستخدم مع الباسورد القديم عشان نقارنه
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التأكد من صحة الباسورد الحالي
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json({ message: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    }

    // التشفير اليدوي لكلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // التحديث باستخدام findByIdAndUpdate لتجنب مشاكل الـ Validation
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { password: hashedNewPassword },
      { new: true, runValidators: false } 
    ).select('-password');

    // إصدار توكن جديد عشان اليوزر ميعملش تسجيل خروج إجباري
    const newToken = generateToken({
      userId: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return NextResponse.json({ 
      message: 'تم تغيير كلمة المرور بنجاح', 
      token: newToken,
      data: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}