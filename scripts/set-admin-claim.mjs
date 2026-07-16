#!/usr/bin/env node
/**
 * Grant (or revoke) the `admin: true` custom claim that Firestore rules
 * require for reading/updating leads (spec §4.4 / §14).
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs paul@ccoms.ph            # grant (emulator)
 *   node scripts/set-admin-claim.mjs paul@ccoms.ph --revoke   # revoke (emulator)
 *   SEED_TARGET=production GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node scripts/set-admin-claim.mjs paul@ccoms.ph          # production
 *
 * The user must already exist in Firebase Authentication (they need to have
 * signed in at least once, or been created in the console). After changing a
 * claim, the user must sign out and back in for it to take effect.
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'node:fs'

const email = process.argv.find((a) => a.includes('@'))
const REVOKE = process.argv.includes('--revoke')
if (!email) {
  console.error('Usage: node scripts/set-admin-claim.mjs <email> [--revoke]')
  process.exit(1)
}

const TARGET = process.env.SEED_TARGET === 'production' ? 'production' : 'emulator'
if (TARGET === 'emulator') {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
  process.env.GCLOUD_PROJECT ||= 'demo-ccoms'
  initializeApp({ projectId: process.env.GCLOUD_PROJECT })
  console.log(`Target: Auth EMULATOR at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
} else {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf8'))) })
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  } else {
    initializeApp({ credential: applicationDefault() })
  }
  console.log('Target: PRODUCTION Firebase Auth')
}

const auth = getAuth()

async function main() {
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, REVOKE ? { admin: null } : { admin: true })
  console.log(`${REVOKE ? 'Revoked' : 'Granted'} admin claim for ${email} (uid ${user.uid}).`)
  console.log('The user must sign out and sign back in for the change to apply.')
}

main().then(() => process.exit(0)).catch((err) => { console.error(err.message || err); process.exit(1) })
