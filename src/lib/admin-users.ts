// Client for the adminUsers Cloud Function — every call is authenticated
// with the signed-in admin's ID token. Import only from admin pages.

import { getFirebaseAuth } from '@/lib/firebase'

export interface ManagedUser {
  uid: string
  email: string
  displayName: string
  admin: boolean
  disabled: boolean
  created: string
  lastSignIn: string | null
  providers: string[]
}

const ENDPOINT =
  process.env.NEXT_PUBLIC_ADMIN_USERS_ENDPOINT ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5001/demo-ccoms/asia-southeast1/adminUsers'
    : 'https://asia-southeast1-ccoms-production.cloudfunctions.net/adminUsers')

export async function usersOp<T = Record<string, unknown>>(
  op: string,
  args: Record<string, unknown> = {},
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const user = getFirebaseAuth().currentUser
  if (!user) return { ok: false, message: 'You are not signed in.' }
  try {
    const token = await user.getIdToken()
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ op, ...args }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success !== true) return { ok: false, message: data.message || 'Request failed.' }
    return { ok: true, data: data as T }
  } catch {
    return { ok: false, message: 'Could not reach the user service.' }
  }
}
