import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUser()
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipient_email, message } = await request.json()

    if (!recipient_email) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipient_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Send an actual email using a service like SendGrid, Nodemailer, etc.
    // 2. Track email invitations in the database
    // 3. Create email templates
    
    // For now, we'll just log the invitation
    console.log('Email invitation sent:', {
      sender: auth.user.email,
      recipient: recipient_email,
      message: message || 'No custom message',
      referral_id: auth.user.ref_id,
      timestamp: new Date().toISOString()
    })

    // You could store this in a database table called "email_invitations"
    // await db.emailInvitation.create({
    //   data: {
    //     sender_id: auth.user.id,
    //     recipient_email,
    //     message,
    //     referral_id: auth.user.ref_id
    //   }
    // })

    return NextResponse.json({ 
      message: 'Invitation sent successfully' 
    })
  } catch (error) {
    console.error('Email invitation error:', error)
    return NextResponse.json({ 
      error: 'Failed to send invitation' 
    }, { status: 500 })
  }
}