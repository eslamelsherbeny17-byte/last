import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/lib/models/Cart';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import '@/lib/models/Product'; // لضمان عدم حدوث MissingSchemaError

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    let cart = await Cart.findOne({ user: decoded.userId }).populate('cartItems.product');

    if (!cart) {
      cart = new Cart({ user: decoded.userId, cartItems: [], totalCartPrice: 0 });
      await cart.save();
    }

    return NextResponse.json({ data: cart }, { status: 200 });
  } catch (error) {
    console.error('Cart fetch error:', error);
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
    const { productId, quantity = 1, color, size } = body;

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    let cart = await Cart.findOne({ user: decoded.userId });
    if (!cart) cart = new Cart({ user: decoded.userId, cartItems: [] });

    // التحقق إذا كان المنتج موجود مسبقاً بنفس اللون والمقاس
    const existingItemIndex = cart.cartItems.findIndex(
      (item: any) => 
        item.product.toString() === productId && 
        item.color === color && 
        item.size === size
    );

    if (existingItemIndex > -1) {
      cart.cartItems[existingItemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({
        product: productId,
        quantity,
        price: product.priceAfterDiscount || product.price, // تم التعديل إلى المسمى الصحيح
        color,
        size
      });
    }

    await cart.save();
    await cart.populate('cartItems.product');

    return NextResponse.json({ message: 'Item added to cart', data: cart }, { status: 200 });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// دالة مسح السلة بالكامل
export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const cart = await Cart.findOneAndUpdate(
      { user: decoded.userId },
      { cartItems: [], totalCartPrice: 0, totalPriceAfterDiscount: 0 },
      { new: true }
    );

    return NextResponse.json({ message: 'Cart cleared', data: cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}