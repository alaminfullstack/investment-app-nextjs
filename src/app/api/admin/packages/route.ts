import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const packages = await db.package.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, price, daily_income, validity, image } = await request.json();

    if (!title || !price || !daily_income || !validity) {
      return NextResponse.json(
        { error: 'Title, price, daily income, and validity are required' },
        { status: 400 }
      );
    }

    const total_income = daily_income * validity;

    const pkg = await db.package.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        daily_income: parseFloat(daily_income),
        validity: parseInt(validity),
        total_income,
        image
      }
    });

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Failed to create package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}