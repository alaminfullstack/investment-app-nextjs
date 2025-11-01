import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pkg = await db.package.findUnique({
      where: { id: params.id }
    });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Failed to fetch package:', error);
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
    const { title, description, price, daily_income, validity, image, status } = await request.json();

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (daily_income !== undefined) updateData.daily_income = parseFloat(daily_income);
    if (validity !== undefined) updateData.validity = parseInt(validity);
    if (image !== undefined) updateData.image = image;
    if (status !== undefined) updateData.status = status;

    // Recalculate total income if price or validity changed
    if (daily_income !== undefined && validity !== undefined) {
      updateData.total_income = updateData.daily_income * updateData.validity;
    } else if (daily_income !== undefined || validity !== undefined) {
      const currentPackage = await db.package.findUnique({
        where: { id: params.id }
      });
      
      if (currentPackage) {
        const finalDailyIncome = daily_income !== undefined ? updateData.daily_income : currentPackage.daily_income;
        const finalValidity = validity !== undefined ? updateData.validity : currentPackage.validity;
        updateData.total_income = finalDailyIncome * finalValidity;
      }
    }

    const pkg = await db.package.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Failed to update package:', error);
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
    await db.package.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}