import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
// import { verifyAdmin } from '@/lib/auth'; // فك الكومنت لو عندك دالة للتحقق من الأدمن

// جلب الإعدادات (GET)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // البحث عن أول ملف إعدادات (لأنه يوجد ملف واحد فقط)
    let settings = await Settings.findOne();

    // لو المتجر لسه جديد ومفيش إعدادات، هنكريت إعدادات افتراضية
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
    await dbConnect();

    // 🔴 هنا يجب التأكد أن من يقوم بالتعديل هو (أدمن) فقط
    // const isAdmin = await verifyAdmin(req);
    // if (!isAdmin) return NextResponse.json({ message: 'غير مصرح لك' }, { status: 403 });

    const body = await req.json();

    // استخدام findOneAndUpdate بدون فلتر {} عشان نعدل على الملف الوحيد الموجود
    // upsert: true تعني لو الملف مش موجود، كريته
    const updatedSettings = await Settings.findOneAndUpdate(
      {}, 
      { $set: body },
      { new: true, upsert: true }
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