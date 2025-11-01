import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const packageId = searchParams.get('packageId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (packageId) where.packageId = packageId;

    const [purchases, total] = await Promise.all([
      db.purchase.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              price: true,
              dailyReturn: true,
              validityDays: true,
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

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, packageId, amount, status, startDate, endDate } = await request.json();

    if (!userId || !packageId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const purchase = await db.purchase.create({
      data: {
        userId,
        packageId,
        amount: parseFloat(amount),
        status: status || 'active',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
            dailyReturn: true,
            validityDays: true,
          },
        },
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}