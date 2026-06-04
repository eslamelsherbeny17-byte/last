import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'توكن غير صالح' }, { status: 401 });

    await dbConnect();

    // البحث عن المستخدم باستخدام الـ ID اللي موجود جوه التوكن
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    // إرجاع بيانات المستخدم (زي ما الفرونت إند متوقعها)
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error('getMe error:', error);
    return NextResponse.json({ message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}