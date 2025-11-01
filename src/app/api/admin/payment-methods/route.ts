import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const paymentMethods = await db.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, image, address } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const paymentMethod = await db.paymentMethod.create({
      data: {
        name,
        image,
        address
      }
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Failed to create payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}