import { NextRequest, NextResponse } from 'next/server'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = scryptSync(
  process.env.VAULT_SECRET_KEY || 'fallback-key-change-in-production',
  'ccoms-vault-salt',
  32
)

export async function POST(req: NextRequest) {
  const { action, value } = await req.json()

  if (!value) return NextResponse.json({ result: '' })

  if (action === 'encrypt') {
    const iv = randomBytes(16)
    const cipher = createCipheriv(ALGORITHM, KEY, iv)
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    const result = `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
    return NextResponse.json({ result })
  }

  if (action === 'decrypt') {
    try {
      const [ivHex, tagHex, encryptedHex] = value.split(':')
      if (!ivHex || !tagHex || !encryptedHex) return NextResponse.json({ result: value }) // plain text fallback
      const iv = Buffer.from(ivHex, 'hex')
      const tag = Buffer.from(tagHex, 'hex')
      const encrypted = Buffer.from(encryptedHex, 'hex')
      const decipher = createDecipheriv(ALGORITHM, KEY, iv)
      decipher.setAuthTag(tag)
      const result = decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
      return NextResponse.json({ result })
    } catch {
      return NextResponse.json({ result: value }) // return as-is if decryption fails
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
