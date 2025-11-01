import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        referredUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            deposits: true,
            withdrawals: true,
            purchases: true
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, ref_id, ref_by, status, balance, deposit_balance, payment_method, method_number } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Generate ref_id if not provided
    let userRefId = ref_id;
    if (!userRefId) {
      userRefId = 'USR' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        ref_id: userRefId,
        ref_by,
        status: status || 'active',
        balance: balance || 0,
        deposit_balance: deposit_balance || 0,
        payment_method,
        method_number
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}