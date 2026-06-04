import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { resetCode } = await req.json();

    // تشفير الكود المدخل لمقارنته بالمشفر في قاعدة البيانات
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    const user = await User.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() }, // التأكد أن وقت الصلاحية أكبر من الوقت الحالي
    });

    if (!user) {
      return NextResponse.json({ message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }, { status: 400 });
    }

    // السماح بتغيير كلمة المرور
    user.passwordResetVerified = true;
    await user.save();

    return NextResponse.json({ message: 'تم التحقق بنجاح' }, { status: 200 });
  } catch (error) {
    console.error('Verify Reset Code Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}