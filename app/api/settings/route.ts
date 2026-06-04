import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/lib/models/Settings';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

// جلب الإعدادات
export async function GET() {
  try {
    await dbConnect();
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

// تحديث الإعدادات
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

    // 🛑 التعديل السحري: استبعاد الـ _id وأي بيانات ممنوع تتعدل
    const { _id, createdAt, updatedAt, __v, ...updateData } = body;

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