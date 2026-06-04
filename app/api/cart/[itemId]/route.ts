import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';
import '@/lib/models/Product'; // لضمان عدم حدوث MissingSchemaError

export async function PUT(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { quantity } = body;

    let cart = await Cart.findOne({ user: decoded.userId });
    if (!cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 });

    // البحث عن المنتج سواء بـ ID العنصر في السلة أو بـ ID المنتج نفسه
    const itemIndex = cart.cartItems.findIndex(
      (item: any) => item._id.toString() === params.itemId || item.product.toString() === params.itemId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.cartItems.splice(itemIndex, 1);
      } else {
        cart.cartItems[itemIndex].quantity = quantity;
      }
      await cart.save();
      await cart.populate('cartItems.product');
    }

    return NextResponse.json({ message: 'Cart updated', data: cart }, { status: 200 });
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    let cart = await Cart.findOne({ user: decoded.userId });
    if (!cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 });

    // فلترة السلة وإزالة العنصر
    cart.cartItems = cart.cartItems.filter(
      (item: any) => item._id.toString() !== params.itemId && item.product.toString() !== params.itemId
    );

    await cart.save();
    await cart.populate('cartItems.product');

    return NextResponse.json({ message: 'Item removed', data: cart }, { status: 200 });
  } catch (error) {
    console.error('Remove item error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}