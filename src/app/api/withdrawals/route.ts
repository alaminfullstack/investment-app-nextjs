import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUserAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, address, notes } = await request.json();

    if (!amount || !method || !address) {
      return NextResponse.json({ error: 'Amount, method, and address are required' }, { status: 400 });
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (parseFloat(amount) > user.balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal request
    const withdrawal = await db.withdrawal.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        final_amount: parseFloat(amount),
        method,
        address,
        status: 'pending',
        notes,
      },
    });

    // Update user balance (freeze the amount)
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance - parseFloat(amount),
      },
    });

    // Create ledger entry
    await db.ledgerHistory.create({
      data: {
        userId: user.id,
        type: 'withdrawal',
        amount: -parseFloat(amount),
        description: `Withdrawal request of $${amount} via ${method}`,
        balance: user.balance - parseFloat(amount),
        status: 'pending',
      },
    });

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      db.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.withdrawal.count({ where }),
    ]);

    return NextResponse.json({
      withdrawals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}