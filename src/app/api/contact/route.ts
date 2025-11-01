import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Save the contact message to a database
    // 2. Send an email notification to the admin
    // 3. Send a confirmation email to the user
    
    // For now, we'll just log the message and return success
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // You could also store this in a database table called "contact_messages"
    // await db.contactMessage.create({
    //   data: { name, email, subject, message }
    // })

    return NextResponse.json({ 
      message: 'Contact form submitted successfully' 
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ 
      error: 'Failed to submit contact form' 
    }, { status: 500 })
  }
}