import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { email, newPassword } = await req.json();

    // تأكد من تحويل الإيميل لـ lowercase عشان مايحصلش مشاكل في البحث
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التأكد من أن المستخدم اجتاز خطوة التحقق من الكود بنجاح
    if (!user.passwordResetVerified) {
      return NextResponse.json({ message: 'لم يتم التحقق من الرمز السري' }, { status: 400 });
    }

    // ✅ التعديل هنا: نمرر كلمة السر العادية، والـ Pre-save Hook هيشفرها مرة واحدة بس
    user.password = newPassword;

    // مسح حقول الاستعادة بعد نجاح العملية
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}