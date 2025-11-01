import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUserAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    // Get package details
    const packageData = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (packageData.status !== 'active') {
      return NextResponse.json({ error: 'Package is not active' }, { status: 400 });
    }

    // Check if user has sufficient balance
    if (user.balance < packageData.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create purchase record
    const purchase = await db.purchase.create({
      data: {
        userId: user.id,
        packageId: packageId,
        amount: packageData.price,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + packageData.validity * 24 * 60 * 60 * 1000), // validity days in milliseconds
      },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            price: true,
            dailyIncome: true,
            validity: true,
          },
        },
      },
    });

    // Update user balance
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance - packageData.price,
      },
    });

    // Create ledger entry
    await db.ledgerHistory.create({
      data: {
        userId: user.id,
        type: 'purchase',
        amount: -packageData.price,
        description: `Purchased ${packageData.title} package`,
        balance: user.balance - packageData.price,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Create purchase error:', error);
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

    const [purchases, total] = await Promise.all([
      db.purchase.findMany({
        where,
        include: {
          package: {
            select: {
              id: true,
              title: true,
              price: true,
              dailyIncome: true,
              validity: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.purchase.count({ where }),
    ]);

    return NextResponse.json({
      purchases,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}