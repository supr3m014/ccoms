import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { notifyAdmin, newTicketTemplate, ticketReplyTemplate, sendMail } from '@/lib/email'

const API = process.env.NEXT_PUBLIC_API_URL!

async function dbPost(table: string, data: any) {
  const url = new URL(API)
  url.searchParams.set('table', table)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

async function dbGet(table: string, params: Record<string, string> = {}) {
  const url = new URL(API)
  url.searchParams.set('table', table)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { cache: 'no-store' })
  return res.json()
}

async function dbPut(table: string, data: any, eqField: string, eqValue: string) {
  const url = new URL(API)
  url.searchParams.set('table', table)
  url.searchParams.set(`eq[${eqField}]`, eqValue)
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// POST /api/tickets  body: { action: 'create' | 'reply' | 'update-status' | 'assign', ...fields }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  // ── CREATE TICKET ──────────────────────────────────────────────────────────
  if (action === 'create') {
    const { subject, visitor_name, visitor_email, visitor_phone, category, priority, content } = body
    const ticketId = randomUUID()

    const ticketResult = await dbPost('support_tickets', {
      id: ticketId,
      subject,
      visitor_name,
      visitor_email,
      visitor_phone: visitor_phone || null,
      category,
      priority,
      status: 'open',
      source: 'manual',
    })

    if (ticketResult.error) return NextResponse.json({ error: ticketResult.error }, { status: 500 })

    // First message
    await dbPost('ticket_messages', {
      id: randomUUID(),
      ticket_id: ticketId,
      sender_type: 'customer',
      sender_name: visitor_name,
      content,
      is_internal: 0,
    })

    // Notify admin
    notifyAdmin({
      subject: `🎫 New ticket: ${subject}`,
      html: newTicketTemplate({ subject, visitor_name, visitor_email, visitor_phone, category, priority, content }),
    }).catch(e => console.error('[ticket notify]', e))

    return NextResponse.json({ success: true, ticket_id: ticketId })
  }

  // ── REPLY TO TICKET ────────────────────────────────────────────────────────
  if (action === 'reply') {
    const { ticket_id, content, is_internal = false } = body

    // Get ticket info for the email
    const ticketRes = await dbGet('support_tickets', { [`eq[id]`]: ticket_id })
    const ticket = ticketRes.data?.[0]
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    await dbPost('ticket_messages', {
      id: randomUUID(),
      ticket_id,
      sender_type: 'admin',
      sender_name: 'Support Team',
      content,
      is_internal: is_internal ? 1 : 0,
    })

    // Update ticket updated_at
    const mysqlNow = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
    await dbPut('support_tickets', { updated_at: mysqlNow() }, 'id', ticket_id)

    // Send email to customer (skip for internal notes)
    if (!is_internal) {
      sendMail({
        to: ticket.visitor_email,
        subject: `Re: ${ticket.subject}`,
        html: ticketReplyTemplate({
          subject: ticket.subject,
          visitor_name: ticket.visitor_name,
          reply_content: content,
          ticket_id,
        }),
      }).catch(e => console.error('[ticket reply email]', e))
    }

    return NextResponse.json({ success: true })
  }

  // ── UPDATE STATUS ──────────────────────────────────────────────────────────
  if (action === 'update-status') {
    const { ticket_id, status } = body
    const result = await dbPut('support_tickets', { status }, 'id', ticket_id)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ── ASSIGN TICKET ──────────────────────────────────────────────────────────
  if (action === 'assign') {
    const { ticket_id, assigned_to } = body
    const result = await dbPut('support_tickets', { assigned_to: assigned_to || null }, 'id', ticket_id)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
