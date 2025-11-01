import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const purchase = await db.purchase.findUnique({
      where: { id: params.id },
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

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Get purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, status, startDate, endDate } = await request.json();

    const purchase = await db.purchase.update({
      where: { id: params.id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
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
    console.error('Update purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.purchase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Delete purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}