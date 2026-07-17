#!/usr/bin/env node
/**
 * Sends one real email through the live sendSupportEmail function, signed in
 * as a real admin, to prove ticket replies/transcripts can reach customers.
 *
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *        node scripts/test-smtp-prod.mjs <recipient>
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'node:fs'

const to = process.argv[2]
if (!to) { console.error('usage: node scripts/test-smtp-prod.mjs <recipient>'); process.exit(1) }

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

initializeApp({ credential: cert(JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'))) })

// Mint a real ID token for an existing admin, the same way the browser would.
const user = await getAuth().getUserByEmail(env.ADMIN_EMAIL || 'paul@ccoms.ph')
const claims = (await getAuth().getUser(user.uid)).customClaims || {}
if (claims.admin !== true) { console.error(`${user.email} lacks the admin claim`); process.exit(1) }
console.log(`admin: ${user.email} (claim ok)`)

const customToken = await getAuth().createCustomToken(user.uid, { admin: true })
const signIn = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: customToken, returnSecureToken: true }) },
).then((r) => r.json())
if (!signIn.idToken) { console.error('sign-in failed:', signIn); process.exit(1) }

const res = await fetch('https://asia-southeast1-ccoms-production.cloudfunctions.net/sendSupportEmail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${signIn.idToken}` },
  body: JSON.stringify({
    to,
    subject: '[CCOMS] Support email is working ✓',
    text: 'This email was sent by the Core Conversion admin panel through support@ccoms.ph.\n\n'
      + 'If you can read this, ticket replies and chat transcripts will reach your customers.\n\n'
      + '— Core Conversion Support',
  }),
})
const data = await res.json().catch(() => ({}))
console.log(res.status === 200 && data.success ? `✓ email sent to ${to}` : `✗ failed: ${JSON.stringify(data)}`)
process.exit(res.status === 200 && data.success ? 0 : 1)
