import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

// GET settings
export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let settings = await db.settings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await db.settings.create({
        data: {
          app_name: 'Investment App',
          currency: 'USD',
          deposit_bonus: 0,
          allow_deposit_bonus: false,
          withdraw_enabled: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST/UPDATE settings
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      app_name,
      logo,
      phone,
      currency,
      deposit_bonus,
      allow_deposit_bonus,
      withdraw_enabled
    } = data

    // Validate required fields
    if (!app_name || !currency) {
      return NextResponse.json({ error: 'App name and currency are required' }, { status: 400 })
    }

    // Check if settings exist
    const existingSettings = await db.settings.findFirst()
    
    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await db.settings.update({
        where: { id: existingSettings.id },
        data: {
          app_name,
          logo: logo || null,
          phone: phone || null,
          currency,
          deposit_bonus: deposit_bonus || 0,
          allow_deposit_bonus: allow_deposit_bonus || false,
          withdraw_enabled: withdraw_enabled !== undefined ? withdraw_enabled : true
        }
      })
    } else {
      // Create new settings
      settings = await db.settings.create({
        data: {
          app_name,
          logo: logo || null,
          phone: phone || null,
          currency,
          deposit_bonus: deposit_bonus || 0,
          allow_deposit_bonus: allow_deposit_bonus || false,
          withdraw_enabled: withdraw_enabled !== undefined ? withdraw_enabled : true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}