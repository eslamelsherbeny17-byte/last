import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Address from '@/lib/models/Address';
import { getTokenFromRequest, verifyToken } from '@/lib/middleware';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    // استخراج نفس المسميات
    const { alias, city, phone, postalCode, details } = body;

    const updatedAddress = await Address.findByIdAndUpdate(
      params.id,
      { alias, city, phone, postalCode, details },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }

    if (updatedAddress.user.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Address updated', data: updatedAddress }, { status: 200 });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    const address = await Address.findById(params.id);

    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }

    if (address.user.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await Address.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Address deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}