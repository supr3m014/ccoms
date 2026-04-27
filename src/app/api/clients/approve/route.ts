import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sendMail } from '@/lib/email'

const API = process.env.NEXT_PUBLIC_API_URL!

async function dbPost(table: string, data: any) {
  const url = new URL(API)
  url.searchParams.set('table', table)
  const res = await fetch(url.toString(), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
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

export async function POST(req: NextRequest) {
  const { client_id, temp_password } = await req.json()
  if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

  // Call PHP bridge to approve client (hashes password + assigns client_id)
  const res = await fetch(`${API}?action=client-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id, temp_password }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error }, { status: 500 })

  // Get client details for the welcome email
  const clientRes = await dbGet('clients', { [`eq[id]`]: client_id })
  const client = clientRes.data?.[0]

  if (client) {
    const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create welcome notification
    await dbPost('client_notifications', {
      id: randomUUID(),
      client_id,
      type: 'payment_verified',
      message: `Welcome to Core Conversion! Your account (${data.client_id}) is now active. Please complete your onboarding form.`,
      link: '/client-dashboard/intake',
    })

    // Send welcome email
    const welcomeHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#1e40af,#0891b2);color:#fff;padding:32px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:24px">Welcome to Core Conversion! 🎉</h1>
          <p style="margin:8px 0 0;opacity:.9">Your payment has been verified. Your portal is ready.</p>
        </div>
        <div style="background:#f9fafb;padding:32px;border:1px solid #e5e7eb;border-top:none">
          <p style="color:#374151;margin:0 0 20px">Hi <strong>${client.name}</strong>,</p>
          <p style="color:#374151;margin:0 0 20px">Your payment has been successfully verified. You can now access your Core Conversion client portal.</p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <table style="width:100%;font-size:14px">
              <tr><td style="color:#6b7280;padding:4px 0;width:140px">Client ID</td><td style="font-weight:700;color:#111">${data.client_id}</td></tr>
              <tr><td style="color:#6b7280;padding:4px 0">Email</td><td style="color:#111">${client.email}</td></tr>
              <tr><td style="color:#6b7280;padding:4px 0">Temp Password</td><td style="font-family:monospace;font-weight:700;color:#1e40af">${temp_password}</td></tr>
            </table>
          </div>
          <p style="color:#ef4444;font-size:13px;margin:0 0 20px">⚠️ Please change your password after your first login.</p>
          <a href="${portalUrl}/client-dashboard/login" style="display:inline-block;background:#1e40af;color:#fff;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px">
            Access Your Portal →
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">If you have questions, reply to this email or message us in the portal.</p>
        </div>
        <div style="padding:16px;text-align:center;font-size:12px;color:#9ca3af">
          Core Conversion · <a href="https://ccoms.ph" style="color:#9ca3af">ccoms.ph</a>
        </div>
      </div>`

    sendMail({
      to: client.email,
      subject: `✅ Payment Verified — Welcome to Core Conversion (${data.client_id})`,
      html: welcomeHtml,
    }).catch(e => console.error('[welcome email]', e))
  }

  return NextResponse.json({ success: true, client_id: data.client_id, temp_password })
}
