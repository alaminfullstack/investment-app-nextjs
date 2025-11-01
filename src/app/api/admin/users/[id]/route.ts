import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        referredUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        referredBy: {
          select: {
            id: true,
            name: true,
            email: true,
            ref_id: true
          }
        },
        _count: {
          select: {
            deposits: true,
            withdrawals: true,
            purchases: true,
            ledgers: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, phone, password, status, balance, deposit_balance, payment_method, method_number } = await request.json();

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (status !== undefined) updateData.status = status;
    if (balance !== undefined) updateData.balance = parseFloat(balance);
    if (deposit_balance !== undefined) updateData.deposit_balance = parseFloat(deposit_balance);
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (method_number !== undefined) updateData.method_number = method_number;

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}