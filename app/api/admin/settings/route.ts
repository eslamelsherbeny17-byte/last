import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

// ✨ منع الكاش نهائياً عشان التعديلات تظهر فوراً
export const dynamic = 'force-dynamic';

// جلب الإعدادات (GET)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json({ data: settings }, { status: 200 });
  } catch (error) {
    console.error('Get Settings Error:', error);
    return NextResponse.json({ message: 'حدث خطأ في جلب الإعدادات' }, { status: 500 });
  }
}

// تحديث الإعدادات (PUT)
export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    // 🛑 التعديل السحري: استبعاد الـ _id وأي بيانات ممنوع تتعدل عشان المونجو يقبل الحفظ
    const { _id, createdAt, updatedAt, __v, ...updateData } = body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {}, 
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ 
      message: 'تم تحديث الإعدادات بنجاح', 
      data: updatedSettings 
    }, { status: 200 });

  } catch (error) {
    console.error('Update Settings Error:', error);
    return NextResponse.json({ message: 'حدث خطأ أثناء تحديث الإعدادات' }, { status: 500 });
  }
}