import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUserAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, transactionHash, notes } = await request.json();

    if (!amount || !method) {
      return NextResponse.json({ error: 'Amount and payment method are required' }, { status: 400 });
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Create deposit request
    const deposit = await db.deposit.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        final_amount: parseFloat(amount),
        method,
        transactionHash,
        status: 'pending',
        notes,
      },
    });

    // Create ledger entry
    await db.ledgerHistory.create({
      data: {
        userId: user.id,
        type: 'deposit',
        amount: parseFloat(amount),
        description: `Deposit request of $${amount} via ${method}`,
        balance: user.balance,
        status: 'pending',
      },
    });

    return NextResponse.json(deposit);
  } catch (error) {
    console.error('Create deposit error:', error);
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

    const [deposits, total] = await Promise.all([
      db.deposit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.deposit.count({ where }),
    ]);

    return NextResponse.json({
      deposits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}