import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await db.admin.findUnique({
      where: { id: auth.adminId },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error('Admin profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin profile' }, { status: 500 })
  }
}