import nodemailer from 'nodemailer'

interface MailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

let _transporter: nodemailer.Transporter | null = null

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (_transporter) return _transporter

  const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS

  if (hasSmtp) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Dev fallback: Ethereal (auto-creates a test account, shows preview URL in console)
    const testAccount = await nodemailer.createTestAccount()
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
    console.log('[email] Using Ethereal test account:', testAccount.user)
  }

  return _transporter
}

export async function sendMail({ to, subject, html, text }: MailOptions) {
  const transporter = await getTransporter()
  const from = `"${process.env.FROM_NAME || 'Core Conversion'}" <${process.env.SMTP_USER || 'support@ccoms.ph'}>`

  const info = await transporter.sendMail({ from, to, subject, html, text: text || html.replace(/<[^>]+>/g, '') })

  if (!process.env.SMTP_PASS) {
    // Log Ethereal preview URL for dev testing
    console.log('[email] Preview URL:', nodemailer.getTestMessageUrl(info))
  }

  return info
}

export async function notifyAdmin({ subject, html }: { subject: string; html: string }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'paul@ccoms.ph'
  return sendMail({ to: adminEmail, subject, html })
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function newChatTemplate(data: {
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  category: string
  started_at: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e40af;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">💬 New Live Chat Session</h2>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px">Core Conversion Admin</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280;width:120px">Visitor</td><td style="padding:6px 0;font-weight:600;color:#111">${data.visitor_name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;color:#111">${data.visitor_email}</td></tr>
          ${data.visitor_phone ? `<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;color:#111">${data.visitor_phone}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#6b7280">Category</td><td style="padding:6px 0;color:#111;text-transform:capitalize">${data.category}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Started</td><td style="padding:6px 0;color:#111">${new Date(data.started_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</td></tr>
        </table>
        <div style="margin-top:20px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/support/chat"
             style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
            Open Chat Hub →
          </a>
        </div>
      </div>
    </div>`
}

export function newTicketTemplate(data: {
  subject: string
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  category: string
  priority: string
  content: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#7c3aed;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">🎫 New Support Ticket</h2>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px">Core Conversion Admin</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111">${data.subject}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280;width:120px">From</td><td style="padding:6px 0;font-weight:600;color:#111">${data.visitor_name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;color:#111">${data.visitor_email}</td></tr>
          ${data.visitor_phone ? `<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;color:#111">${data.visitor_phone}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#6b7280">Category</td><td style="padding:6px 0;color:#111;text-transform:capitalize">${data.category}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Priority</td><td style="padding:6px 0;color:#111;text-transform:capitalize">${data.priority}</td></tr>
        </table>
        <div style="margin:16px 0;padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;color:#374151;line-height:1.6">
          ${data.content.replace(/\n/g, '<br>')}
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/support"
           style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          Open Ticket Desk →
        </a>
      </div>
    </div>`
}

export function ticketReplyTemplate(data: {
  subject: string
  visitor_name: string
  reply_content: string
  ticket_id: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#059669;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">✉️ Reply to Your Support Ticket</h2>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px">Core Conversion Support</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280">Hi ${data.visitor_name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#374151">Our support team has replied to your ticket: <strong>${data.subject}</strong></p>
        <div style="padding:16px;background:#fff;border-left:4px solid #059669;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.6">
          ${data.reply_content.replace(/\n/g, '<br>')}
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#9ca3af">
          You can reply to this email to continue the conversation, or contact us at
          <a href="mailto:${process.env.SMTP_USER || 'support@ccoms.ph'}" style="color:#059669">${process.env.SMTP_USER || 'support@ccoms.ph'}</a>
        </p>
      </div>
      <div style="padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
        Core Conversion · <a href="https://ccoms.ph" style="color:#9ca3af">ccoms.ph</a>
      </div>
    </div>`
}

export function contactReplyTemplate(data: {
  name: string
  original_message: string
  reply_content: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e40af;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">Re: Your Message to Core Conversion</h2>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280">Hi ${data.name},</p>
        <div style="padding:16px;background:#fff;border-left:4px solid #1e40af;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.6;margin-bottom:20px">
          ${data.reply_content.replace(/\n/g, '<br>')}
        </div>
        <div style="padding:12px;background:#f3f4f6;border-radius:8px;font-size:13px;color:#6b7280">
          <p style="margin:0 0 4px;font-weight:600">Your original message:</p>
          <p style="margin:0;font-style:italic">${data.original_message.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      <div style="padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
        Core Conversion · <a href="https://ccoms.ph" style="color:#9ca3af">ccoms.ph</a>
      </div>
    </div>`
}
