import { NextRequest, NextResponse } from 'next/server'
import { sendMail, contactReplyTemplate } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { to, name, original_message, reply_content } = await req.json()

  if (!to || !reply_content?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    await sendMail({
      to,
      subject: `Re: Your message to Core Conversion`,
      html: contactReplyTemplate({ name, original_message, reply_content }),
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[contact reply]', err)
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}
