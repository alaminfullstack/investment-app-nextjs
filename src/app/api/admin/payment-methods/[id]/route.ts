import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentMethod = await db.paymentMethod.findUnique({
      where: { id: params.id }
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Failed to fetch payment method:', error);
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
    const { name, image, address, status } = await request.json();

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;

    const paymentMethod = await db.paymentMethod.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Failed to update payment method:', error);
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
    await db.paymentMethod.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}