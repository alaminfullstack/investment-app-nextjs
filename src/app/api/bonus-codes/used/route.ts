import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await verifyUser()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usedCodes = await db.bonusCodeUsage.findMany({
      where: {
        user_id: auth.user.id
      },
      include: {
        bonusCode: {
          select: {
            code: true,
            income_amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(usedCodes)
  } catch (error) {
    console.error('Used bonus codes fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch used bonus codes' }, { status: 500 })
  }
}