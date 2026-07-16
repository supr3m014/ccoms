'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut as fbSignOut, onAuthStateChanged, type User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'

// Admin authentication runs on Firebase Auth (same project as Leads), so local
// and live behave identically — no PHP/MySQL bridge needed to sign in. Access to
// the panel requires the `admin: true` custom claim (scripts/set-admin-claim.mjs).

interface User {
  id: string
  email: string
  created_at?: string
  last_sign_in_at?: string
}

interface Session {
  user: User
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signInWithGoogle: () => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  configured: false,
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

function normalize(u: FirebaseUser): User {
  return {
    id: u.uid,
    email: u.email ?? '',
    created_at: u.metadata.creationTime,
    last_sign_in_at: u.metadata.lastSignInTime,
  }
}

const NOT_ADMIN = 'This account is not authorized for the admin panel. Ask an administrator to grant access.'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const configured = isFirebaseConfigured()

  useEffect(() => {
    if (!configured) { setLoading(false); return }
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdTokenResult()
        const admin = token.claims.admin === true
        setIsAdmin(admin)
        // Only expose the user to the panel when they carry the admin claim.
        setUser(admin ? normalize(fbUser) : null)
      } else {
        setIsAdmin(false)
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [configured])

  async function afterSignIn(): Promise<{ error: { message: string } | null }> {
    const auth = getFirebaseAuth()
    const current = auth.currentUser
    if (!current) return { error: { message: 'Sign-in failed.' } }
    // A fresh sign-in mints a token that already carries current custom claims.
    // (If a claim is granted while already signed in, sign out and back in.)
    const token = await current.getIdTokenResult()
    if (token.claims.admin !== true) {
      await fbSignOut(auth)
      return { error: { message: NOT_ADMIN } }
    }
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    if (!configured) return { error: { message: 'Firebase is not configured. See docs/FIREBASE-SETUP.md.' } }
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
      return await afterSignIn()
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code || ''
      const msg = code.includes('too-many-requests')
        ? 'Too many attempts. Please wait a moment and try again.'
        : 'Invalid email or password.'
      return { error: { message: msg } }
    }
  }

  const signInWithGoogle = async () => {
    if (!configured) return { error: { message: 'Firebase is not configured. See docs/FIREBASE-SETUP.md.' } }
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
      return await afterSignIn()
    } catch {
      return { error: { message: 'Google sign-in failed.' } }
    }
  }

  const signOut = async () => {
    if (configured) await fbSignOut(getFirebaseAuth())
    setUser(null)
    setIsAdmin(false)
  }

  const session = user ? { user } : null

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, configured, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
