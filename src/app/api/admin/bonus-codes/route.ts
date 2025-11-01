import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

// GET all bonus codes
export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bonusCodes = await db.bonusCode.findMany({
      include: {
        _count: {
          select: {
            usages: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bonusCodes)
  } catch (error) {
    console.error('Bonus codes fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bonus codes' }, { status: 500 })
  }
}

// POST create new bonus code
export async function POST(request: NextRequest) {
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

    // Check if code already exists
    const existingCode = await db.bonusCode.findUnique({
      where: { code }
    })

    if (existingCode) {
      return NextResponse.json({ error: 'Bonus code already exists' }, { status: 400 })
    }

    const newBonusCode = await db.bonusCode.create({
      data: {
        code: code.toUpperCase(),
        income_amount,
        status
      }
    })

    return NextResponse.json(newBonusCode)
  } catch (error) {
    console.error('Bonus code creation error:', error)
    return NextResponse.json({ error: 'Failed to create bonus code' }, { status: 500 })
  }
}