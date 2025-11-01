import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

// PUT update bonus code
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
    const { code, income_amount, status } = data

    // Validate required fields
    if (!code || income_amount === undefined || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if code already exists (excluding current code)
    const existingCode = await db.bonusCode.findFirst({
      where: {
        code: code.toUpperCase(),
        id: { not: params.id }
      }
    })

    if (existingCode) {
      return NextResponse.json({ error: 'Bonus code already exists' }, { status: 400 })
    }

    const updatedBonusCode = await db.bonusCode.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        income_amount,
        status
      }
    })

    return NextResponse.json(updatedBonusCode)
  } catch (error) {
    console.error('Bonus code update error:', error)
    return NextResponse.json({ error: 'Failed to update bonus code' }, { status: 500 })
  }
}

// DELETE bonus code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if bonus code has usages
    const usageCount = await db.bonusCodeUsage.count({
      where: { bonus_code_id: params.id }
    })

    if (usageCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete bonus code that has been used' 
      }, { status: 400 })
    }

    await db.bonusCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Bonus code deleted successfully' })
  } catch (error) {
    console.error('Bonus code deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete bonus code' }, { status: 500 })
  }
}