import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

// PUT update referral commission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { level, name, commission, status } = data

    // Validate required fields
    if (!level || !name || commission === undefined || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if level already exists (excluding current commission)
    const existingLevel = await db.referralCommission.findFirst({
      where: {
        level,
        id: { not: params.id }
      }
    })

    if (existingLevel) {
      return NextResponse.json({ error: 'Commission level already exists' }, { status: 400 })
    }

    const updatedCommission = await db.referralCommission.update({
      where: { id: params.id },
      data: {
        level,
        name,
        commission,
        status
      }
    })

    return NextResponse.json(updatedCommission)
  } catch (error) {
    console.error('Referral commission update error:', error)
    return NextResponse.json({ error: 'Failed to update referral commission' }, { status: 500 })
  }
}

// DELETE referral commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.referralCommission.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Referral commission deleted successfully' })
  } catch (error) {
    console.error('Referral commission deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete referral commission' }, { status: 500 })
  }
}