// Firebase client SDK — lazy singleton, initialized from public env vars.
//
// IMPORTANT (spec §19): import this module ONLY from admin/leads pages.
// The public /assessment page must not import it — submissions go through a
// plain fetch() to the Cloud Function endpoint, so the public bundle carries
// zero Firebase JS. Never put Admin SDK credentials anywhere in src/.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const USE_EMULATOR = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === '1'

let app: FirebaseApp | null = null
let emulatorsConnected = false

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId)
}

function getApp(): FirebaseApp {
  if (!app) {
    app = getApps()[0] ?? initializeApp(config)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getApp())
  connectEmulators(auth, null)
  return auth
}

export function getDb(): Firestore {
  const db = getFirestore(getApp())
  connectEmulators(null, db)
  return db
}

function connectEmulators(auth: Auth | null, db: Firestore | null) {
  if (!USE_EMULATOR || emulatorsConnected || typeof window === 'undefined') return
  try {
    const a = auth ?? getAuth(getApp())
    const d = db ?? getFirestore(getApp())
    connectAuthEmulator(a, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(d, '127.0.0.1', 8080)
  } catch {
    /* already connected */
  }
  emulatorsConnected = true
}
