import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

// GET all referral commissions
export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const commissions = await db.referralCommission.findMany({
      orderBy: { level: 'asc' }
    })

    return NextResponse.json(commissions)
  } catch (error) {
    console.error('Referral commissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch referral commissions' }, { status: 500 })
  }
}

// POST create new referral commission
export async function POST(request: NextRequest) {
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

    // Check if level already exists
    const existingLevel = await db.referralCommission.findFirst({
      where: { level }
    })

    if (existingLevel) {
      return NextResponse.json({ error: 'Commission level already exists' }, { status: 400 })
    }

    const newCommission = await db.referralCommission.create({
      data: {
        level,
        name,
        commission,
        status
      }
    })

    return NextResponse.json(newCommission)
  } catch (error) {
    console.error('Referral commission creation error:', error)
    return NextResponse.json({ error: 'Failed to create referral commission' }, { status: 500 })
  }
}