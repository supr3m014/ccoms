import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/email'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const { client_id } = await req.json()
  if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

  const res = await fetch(`${API}?table=clients&eq[id]=${client_id}`, { cache: 'no-store' })
  const data = await res.json()
  const client = data.data?.[0]
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  if (client.status !== 'active') return NextResponse.json({ error: 'Client not active' }, { status: 400 })

  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  await sendMail({
    to: client.email,
    subject: `Your Core Conversion Portal Access — ${client.client_id}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#1e40af,#0891b2);color:#fff;padding:32px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:22px">Core Conversion Client Portal</h1>
          <p style="margin:6px 0 0;opacity:.9;font-size:14px">Portal access details for ${client.name}</p>
        </div>
        <div style="background:#f9fafb;padding:32px;border:1px solid #e5e7eb;border-top:none">
          <p style="color:#374151;margin:0 0 20px">Hi <strong>${client.name}</strong>,</p>
          <p style="color:#374151;margin:0 0 20px">Here are your login details for the Core Conversion client portal:</p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <table style="width:100%;font-size:14px">
              <tr><td style="color:#6b7280;padding:6px 0;width:120px">Portal URL</td><td><a href="${portalUrl}/client-dashboard/login" style="color:#1e40af">${portalUrl}/client-dashboard/login</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Client ID</td><td style="font-weight:700;color:#111;font-family:monospace">${client.client_id}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Email</td><td style="color:#111">${client.email}</td></tr>
            </table>
          </div>
          <p style="color:#374151;margin:0 0 20px;font-size:14px">If you have forgotten your password, please contact us and we will reset it for you.</p>
          <a href="${portalUrl}/client-dashboard/login" style="display:inline-block;background:#1e40af;color:#fff;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px">
            Access Your Portal →
          </a>
        </div>
        <div style="padding:16px;text-align:center;font-size:12px;color:#9ca3af">
          Core Conversion · <a href="https://ccoms.ph" style="color:#9ca3af">ccoms.ph</a>
        </div>
      </div>`,
  })

  return NextResponse.json({ success: true })
}
