import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import '@/lib/models/Product';
import '@/lib/models/User';

// 1. جلب تفاصيل الطلب لليوزر والأدمن (GET)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const order = await Order.findById(params.id)
      .populate('cartItems.product')
      .populate('user', 'name email phone'); 

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    // حماية: اليوزر يشوف طلبه فقط، والأدمن يشوف أي طلب
    if (decoded.role !== 'admin' && order.user._id.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ data: order }, { status: 200 });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 2. تحديث حالة الطلب من قبل الأدمن (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();
    const { status, isPaid, isDelivered, trackingNumber } = body;

    const updateData: any = { status, trackingNumber };

    if (status === 'processing') updateData.processingAt = new Date();
    if (status === 'shipped') updateData.shippedAt = new Date();
    if (status === 'delivered' || isDelivered) {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
      updateData.status = 'delivered';
    }
    
    if (isPaid) {
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('cartItems.product');

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    return NextResponse.json({ message: 'Order updated successfully', data: order }, { status: 200 });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}