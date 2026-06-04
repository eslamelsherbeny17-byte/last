import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Address from '@/lib/models/Address';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // جلب العناوين الخاصة بالمستخدم الحالي فقط
    const addresses = await Address.find({ user: decoded.userId }).sort('-createdAt');

    return NextResponse.json({ data: addresses }, { status: 200 });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    
    // 👇 هنا بنستخرج البيانات بنفس المسميات اللي الفرونت إند بيبعتها بالظبط
    const { alias, city, phone, postalCode, details } = body;

    // تأكيد إضافي عشان لو الفرونت بعت حاجة ناقصة الباك إند يرد بخطأ مفهوم
    if (!details || !city || !phone) {
      return NextResponse.json({ message: 'برجاء إكمال جميع البيانات المطلوبة' }, { status: 400 });
    }

    const newAddress = new Address({
      user: decoded.userId,
      alias: alias || 'home',
      city,
      phone,
      details,
      postalCode: postalCode || '',
    });

    await newAddress.save();

    return NextResponse.json(
      {
        message: 'تم إضافة العنوان بنجاح',
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Address creation error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}