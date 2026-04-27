import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { randomUUID } from 'crypto'
import { notifyAdmin, newChatTemplate } from '@/lib/email'

const API = process.env.NEXT_PUBLIC_API_URL!

// MySQL TIMESTAMP format: 'YYYY-MM-DD HH:MM:SS'
const mysqlNow = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const SYSTEM_PROMPTS: Record<string, string> = {
  general: `You are a helpful support assistant for Core Conversion, a digital marketing agency based in the Philippines.
Be friendly, professional, and concise. Help users with general inquiries about services, pricing, and the company.
If the user needs billing, sales, or technical help specifically, let them know you'll connect them with the right team.
Keep responses under 3 sentences unless more detail is genuinely needed.`,

  billing: `You are a billing support specialist for Core Conversion digital marketing agency.
Help users with invoice questions, payment methods, subscription plans, refunds, and billing disputes.
Be empathetic and solution-focused. Always reassure the customer their concern is valid.
Keep responses concise and actionable. If you cannot resolve something, offer to escalate to a human agent.`,

  sales: `You are a sales representative for Core Conversion, a results-driven digital marketing agency.
Help prospects understand services: SEO, PPC, social media, content marketing, website development, and brand strategy.
Be enthusiastic but not pushy. Ask qualifying questions to understand their business needs.
Provide relevant examples and suggest appropriate service packages. Always offer to schedule a free consultation.`,

  technical: `You are a technical support specialist for Core Conversion.
Help users with website issues, campaign tracking problems, analytics setup, CMS questions, and integration troubleshooting.
Be precise and step-by-step in your instructions. Use simple language when possible.
If the issue requires access to their account or systems, offer to escalate to a human technician.`,
}

async function dbGet(table: string, params: Record<string, string> = {}) {
  const url = new URL(API)
  url.searchParams.set('table', table)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { cache: 'no-store' })
  return res.json()
}

async function dbPost(table: string, data: any, extra: Record<string, string> = {}) {
  const url = new URL(API)
  url.searchParams.set('table', table)
  Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
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

// POST /api/chat  — action: start | send | takeover | end | email-history | create-ticket
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  // --- START SESSION ---
  if (action === 'start') {
    const { visitor_name, visitor_email, visitor_phone, visitor_address, visitor_country, category } = body
    const sessionId = randomUUID()
    const result = await dbPost('chat_sessions', {
      id: sessionId,
      visitor_name, visitor_email, visitor_phone, visitor_address, visitor_country,
      category: category || 'general',
      mode: 'ai',
    })
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })

    // Welcome message from AI
    const welcomeMsg = `Hi ${visitor_name}! 👋 Welcome to Core Conversion support. I'm your AI assistant here to help with your ${category || 'general'} inquiry. How can I help you today?`
    await dbPost('chat_messages', {
      id: randomUUID(),
      session_id: sessionId,
      sender_type: 'ai',
      content: welcomeMsg,
    })

    // Notify admin (fire-and-forget — don't block the response)
    notifyAdmin({
      subject: `💬 New chat from ${visitor_name} [${category}]`,
      html: newChatTemplate({ visitor_name, visitor_email, visitor_phone, category, started_at: new Date().toISOString() }),
    }).catch(e => console.error('[chat notify]', e))

    return NextResponse.json({ session_id: sessionId, welcome: welcomeMsg })
  }

  // --- SEND MESSAGE ---
  if (action === 'send') {
    const { session_id, content } = body

    // Save visitor message
    await dbPost('chat_messages', { id: randomUUID(), session_id, sender_type: 'visitor', content })

    // Get session to check mode and category
    const sessionRes = await dbGet('chat_sessions', { [`eq[id]`]: session_id })
    const session = sessionRes.data?.[0]
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    if (session.mode !== 'ai') {
      return NextResponse.json({ message: null, mode: session.mode })
    }

    // Get conversation history (last 10 messages)
    const histRes = await dbGet('chat_messages', { [`eq[session_id]`]: session_id })
    const history = (histRes.data || []).slice(-10)
    const messages = history.map((m: any) => ({
      role: m.sender_type === 'visitor' ? 'user' : 'assistant',
      content: m.content,
    })).filter((m: any) => m.role === 'user' || m.role === 'assistant')

    // Call Claude AI
    let aiResponse = "I'm having trouble right now, but a human agent will be with you shortly."
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-key-here') {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: SYSTEM_PROMPTS[session.category] || SYSTEM_PROMPTS.general,
          messages: messages.length > 0 ? messages : [{ role: 'user', content }],
        })
        aiResponse = response.content[0].type === 'text' ? response.content[0].text : aiResponse
      } catch (err) {
        console.error('Claude API error:', err)
      }
    }

    await dbPost('chat_messages', { id: randomUUID(), session_id, sender_type: 'ai', content: aiResponse })
    return NextResponse.json({ message: aiResponse, mode: 'ai' })
  }

  // --- ADMIN TAKEOVER ---
  if (action === 'takeover') {
    const { session_id } = body
    await dbPut('chat_sessions', { mode: 'human' }, 'id', session_id)
    await dbPost('chat_messages', {
      id: randomUUID(),
      session_id,
      sender_type: 'system',
      content: '🔄 An agent has joined the chat and will assist you now.',
    })
    return NextResponse.json({ success: true })
  }

  // --- ADMIN REPLY ---
  if (action === 'admin-reply') {
    const { session_id, content } = body
    await dbPost('chat_messages', { id: randomUUID(), session_id, sender_type: 'admin', content })
    return NextResponse.json({ success: true })
  }

  // --- END SESSION ---
  if (action === 'end') {
    const { session_id } = body
    await dbPut('chat_sessions', { mode: 'ended', ended_at: mysqlNow() }, 'id', session_id)
    await dbPost('chat_messages', {
      id: randomUUID(),
      session_id,
      sender_type: 'system',
      content: 'Chat session ended. Thank you for contacting Core Conversion!',
    })
    return NextResponse.json({ success: true })
  }

  // --- CREATE TICKET FROM CHAT ---
  if (action === 'create-ticket') {
    const { session_id } = body
    const sessionRes = await dbGet('chat_sessions', { [`eq[id]`]: session_id })
    const session = sessionRes.data?.[0]
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const messagesRes = await dbGet('chat_messages', { [`eq[session_id]`]: session_id })
    const chatMessages: any[] = messagesRes.data || []

    // Create ticket
    const ticketId = randomUUID()
    const ticketRes = await dbPost('support_tickets', {
      id: ticketId,
      subject: `Chat inquiry — ${session.category}`,
      visitor_name: session.visitor_name,
      visitor_email: session.visitor_email,
      visitor_phone: session.visitor_phone || null,
      category: session.category,
      status: 'open',
      priority: 'medium',
      source: 'chat',
      chat_session_id: session_id,
    })

    if (!ticketRes.error) {
      // Copy chat messages into ticket_messages
      for (const m of chatMessages.filter((m: any) => m.sender_type !== 'system')) {
        await dbPost('ticket_messages', {
          id: randomUUID(),
          ticket_id: ticketId,
          sender_type: m.sender_type === 'visitor' ? 'customer' : 'admin',
          sender_name: m.sender_type === 'visitor' ? session.visitor_name : (m.sender_type === 'ai' ? 'AI Assistant' : 'Support Agent'),
          content: m.content,
        })
      }
    }

    await dbPut('chat_sessions', { ticket_created: 1 }, 'id', session_id)
    return NextResponse.json({ success: true, ticket_id: ticketId, error: ticketRes.error })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// GET /api/chat?session_id=X&since=ISO_TIMESTAMP  — poll for new messages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const session_id = searchParams.get('session_id')
  const type = searchParams.get('type')

  // Admin: get all active sessions
  if (type === 'admin-sessions') {
    const res = await dbGet('chat_sessions', { [`eq[mode]`]: 'ai' })
    const res2 = await dbGet('chat_sessions', { [`eq[mode]`]: 'human' })
    const sessions = [...(res.data || []), ...(res2.data || [])]
    return NextResponse.json({ sessions })
  }

  if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const [messagesRes, sessionRes] = await Promise.all([
    dbGet('chat_messages', { [`eq[session_id]`]: session_id }),
    dbGet('chat_sessions', { [`eq[id]`]: session_id }),
  ])

  const since = searchParams.get('since')
  let messages = messagesRes.data || []
  if (since) {
    messages = messages.filter((m: any) => new Date(m.created_at) > new Date(since))
  }

  return NextResponse.json({
    messages,
    session: sessionRes.data?.[0] || null,
  })
}
