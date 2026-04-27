'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ClientUser {
  id: string
  client_id: string
  name: string
  email: string
  status: string
  first_login_completed: number
  business_name: string | null
  phone: string | null
}

interface ClientAuthContextType {
  client: ClientUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined)

const API = process.env.NEXT_PUBLIC_API_URL!

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const res = await fetch(`${API}?action=client-session`, { credentials: 'include' })
      const data = await res.json()
      setClient(data.client || null)
    } catch {
      setClient(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}?action=client-sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.error) return { error: data.error }
      setClient(data.client)
      return {}
    } catch {
      return { error: 'Connection failed. Please try again.' }
    }
  }

  const signOut = async () => {
    await fetch(`${API}?action=client-sign-out`, { method: 'POST', credentials: 'include' })
    setClient(null)
  }

  return (
    <ClientAuthContext.Provider value={{ client, loading, signIn, signOut, refresh }}>
      {children}
    </ClientAuthContext.Provider>
  )
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext)
  if (!ctx) throw new Error('useClientAuth must be used within ClientAuthProvider')
  return ctx
}
