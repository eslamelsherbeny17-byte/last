import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
}

export function authMiddleware(handler: any) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }

      (req as any).user = decoded;
      return handler(req);
    } catch (error) {
      return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
    }
  };
}

export function adminMiddleware(handler: any) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }

      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
      }

      (req as any).user = decoded;
      return handler(req);
    } catch (error) {
      return NextResponse.json({ message: 'Authorization failed' }, { status: 500 });
    }
  };
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
}
