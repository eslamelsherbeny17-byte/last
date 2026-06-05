import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/lib/models/Settings';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    // البحث عن الإعدادات أو إنشاء ملف إعدادات فارغ لأول مرة
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create({});
    }
    
    return NextResponse.json({ data: settings }, { status: 200 });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

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

    // إزالة الحقول المحمية لتجنب تعارض MongoDB
    const { _id, createdAt, updatedAt, __v, ...updateData } = body;

    // استخدام upsert لضمان إنشاء الملف لو تم مسحه بالخطأ
    const settings = await Setting.findOneAndUpdate(
      {}, 
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(
      { message: 'Settings updated successfully', data: settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}