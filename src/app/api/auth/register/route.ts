import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, ref_by } = await request.json();

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
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Validate ref_by if provided
    let referrer = null;
    if (ref_by) {
      referrer = await db.user.findUnique({
        where: { ref_id: ref_by }
      });

      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral ID' },
          { status: 400 }
        );
      }
    }

    // Generate unique ref_id
    const ref_id = 'USR' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        ref_id,
        ref_by: ref_by || null,
        status: 'active',
        balance: 0,
        deposit_balance: 0
      }
    });

    // Create welcome ledger entry
    await db.ledger.create({
      data: {
        user_id: user.id,
        type: 'welcome',
        amount: 0,
        description: 'Welcome to Investment App',
        balance_after: 0
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}