import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import '@/lib/models/Product'; // لضمان عدم حدوث خطأ MissingSchemaError
import '@/lib/models/User'; // 👈 مهم جداً عشان السيرفر يتعرف على موديل المستخدم

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any = { user: decoded.userId };
    if (decoded.role === 'admin') {
      query = {};
    }

    const orders = await Order.find(query)
      .populate('cartItems.product') 
      .populate('user', 'name email profileImg') // 👈 السطر ده اللي بيجيب بيانات العميل للأدمن
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return NextResponse.json(
      {
        data: orders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    // نستقبل البيانات كما يرسلها الفرونت إند
    const { shippingAddress, paymentMethodType = 'cash' } = body;

    const cart = await Cart.findOne({ user: decoded.userId });

    if (!cart || cart.cartItems.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const order = new Order({
      user: decoded.userId,
      cartItems: cart.cartItems, 
      totalOrderPrice: cart.totalCartPrice, 
      shippingAddress,
      paymentMethodType, 
      status: 'pending',
    });

    await order.save();
    await order.populate('cartItems.product');

    // تفريغ السلة بعد إتمام الطلب
    await Cart.findOneAndUpdate(
      { user: decoded.userId }, 
      { cartItems: [], totalCartPrice: 0, totalPriceAfterDiscount: 0 }
    );

    return NextResponse.json(
      { message: 'Order created successfully', data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}