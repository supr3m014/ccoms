#!/usr/bin/env node
/**
 * Seed (or remove) the dummy test lead from the spec (§7).
 *
 * Usage:
 *   node scripts/seed-dummy-lead.mjs            # seed into the EMULATOR
 *   node scripts/seed-dummy-lead.mjs --remove   # remove from the EMULATOR
 *   SEED_TARGET=production GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node scripts/seed-dummy-lead.mjs          # seed into production (explicit only)
 *
 * Safety: production is NEVER touched unless SEED_TARGET=production is set.
 * Never run the production seed as part of a deployment (spec: "Do not seed
 * it automatically in production after every deployment").
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'

const REMOVE = process.argv.includes('--remove')
const TARGET = process.env.SEED_TARGET === 'production' ? 'production' : 'emulator'
const DUMMY_MARKER = 'dummy-test-record'

if (TARGET === 'emulator') {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
  process.env.GCLOUD_PROJECT ||= 'demo-ccoms'
  initializeApp({ projectId: process.env.GCLOUD_PROJECT })
  console.log(`Target: Firestore EMULATOR at ${process.env.FIRESTORE_EMULATOR_HOST}`)
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
  console.log('Target: PRODUCTION Firestore')
}

const db = getFirestore()

async function main() {
  const existing = await db.collection('leads').where('seedMarker', '==', DUMMY_MARKER).get()

  if (REMOVE) {
    if (existing.empty) { console.log('No dummy record found — nothing to remove.'); return }
    for (const d of existing.docs) await d.ref.delete()
    console.log(`Removed ${existing.size} dummy record(s).`)
    return
  }

  if (!existing.empty) {
    console.log(`Dummy record already exists (${existing.docs[0].id}). Run with --remove first to reseed.`)
    return
  }

  // Spec §7 — exact dummy values. Timestamp: 7/14/2026 17:32:05 (Asia/Manila).
  const created = Timestamp.fromDate(new Date('2026-07-14T17:32:05+08:00'))
  const ref = await db.collection('leads').add({
    createdAt: created,
    updatedAt: created,

    emailAddress: 'ivydrobinson@gmail.com',
    fullName: 'Ivy Robinson',
    businessName: 'Freelancer',
    businessEmail: 'ivydrobinson@gmail.com',
    mobileNumber: '09922981422',
    role: 'CEO / President',
    onlinePresenceUrl: 'https://ivydrobinson.com',
    desiredBusinessOutcome: 'Select the closest answer.',
    growthConstraint: "We don't know management.",

    source: 'meta_ads',
    status: 'new',
    lastContactedAt: null,
    nextFollowUpAt: null,

    consentAccepted: true,
    pagePath: '/assessment',
    isArchived: false,
    seedMarker: DUMMY_MARKER, // identifies the record for safe removal
  })
  console.log(`Seeded dummy lead: ${ref.id}`)
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })
