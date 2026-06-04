import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubCategory from '@/lib/models/SubCategory';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id: categoryId } = params;

    // بحث عن الفئات الفرعية التي تنتمي للفئة الأساسية المختارة
    const subCategories = await SubCategory.find({ category: categoryId }).lean();

    return NextResponse.json({ data: subCategories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}