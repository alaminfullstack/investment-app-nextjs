import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUser()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Bonus code is required' }, { status: 400 })
    }

    // Find the bonus code
    const bonusCode = await db.bonusCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!bonusCode) {
      return NextResponse.json({ error: 'Invalid bonus code' }, { status: 404 })
    }

    if (bonusCode.status !== 'active') {
      return NextResponse.json({ error: 'Bonus code is not active' }, { status: 400 })
    }

    // Check if user has already used this code
    const existingUsage = await db.bonusCodeUsage.findFirst({
      where: {
        bonus_code_id: bonusCode.id,
        user_id: auth.user.id
      }
    })

    if (existingUsage) {
      return NextResponse.json({ error: 'You have already used this bonus code' }, { status: 400 })
    }

    // Create usage record
    await db.bonusCodeUsage.create({
      data: {
        bonus_code_id: bonusCode.id,
        user_id: auth.user.id,
        status: 'success'
      }
    })

    // Update user balance
    await db.user.update({
      where: { id: auth.user.id },
      data: {
        balance: {
          increment: bonusCode.income_amount
        }
      }
    })

    // Create ledger entry
    await db.ledger.create({
      data: {
        user_id: auth.user.id,
        type: 'bonus',
        amount: bonusCode.income_amount,
        description: `Bonus code redeemed: ${code}`,
        balance_after: auth.user.balance + bonusCode.income_amount
      }
    })

    return NextResponse.json({
      message: 'Bonus code redeemed successfully',
      bonus_amount: bonusCode.income_amount
    })
  } catch (error) {
    console.error('Bonus code redemption error:', error)
    return NextResponse.json({ error: 'Failed to redeem bonus code' }, { status: 500 })
  }
}