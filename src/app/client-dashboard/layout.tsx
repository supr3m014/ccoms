'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ClientAuthProvider, useClientAuth } from '@/contexts/ClientAuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ConfirmProvider } from '@/contexts/ConfirmContext'
import Link from 'next/link'
import {
  LayoutDashboard, ClipboardList, FolderOpen, BarChart2,
  CreditCard, Settings, MessageCircle, LogOut, Bell, Menu, X,
  ChevronRight
} from 'lucide-react'

const nav = [
  { name: 'Dashboard', href: '/client-dashboard', icon: LayoutDashboard },
  { name: 'My Orders', href: '/client-dashboard/orders', icon: ClipboardList },
  { name: 'Material Vault', href: '/client-dashboard/vault', icon: FolderOpen },
  { name: 'Reports', href: '/client-dashboard/reports', icon: BarChart2 },
  { name: 'Messages', href: '/client-dashboard/messages', icon: MessageCircle },
  { name: 'Billing', href: '/client-dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/client-dashboard/settings', icon: Settings },
]

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const { client, loading, signOut } = useClientAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!client && pathname !== '/client-dashboard/login') {
      router.push('/client-dashboard/login')
      return
    }
    // Force intake form on first login
    if (client && !client.first_login_completed && pathname !== '/client-dashboard/intake') {
      router.push('/client-dashboard/intake')
    }
  }, [client, loading, pathname])

  if (pathname === '/client-dashboard/login') return <>{children}</>

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const isActive = (href: string) => pathname === href || (href !== '/client-dashboard' && pathname?.startsWith(href))

  const handleSignOut = async () => {
    await signOut()
    router.push('/client-dashboard/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:h-auto`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/core-conversion.png" alt="" className="w-8 h-8 rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <p className="font-bold text-sm text-white">Core Conversion</p>
              <p className="text-xs text-slate-400">Client Portal</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Client info */}
        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{client.name}</p>
              <p className="text-xs text-slate-400 truncate">{client.client_id}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                onClick={() => setMobileOpen(false)}>
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <button onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{nav.find(n => isActive(n.href))?.name || 'Client Portal'}</h1>
              <p className="text-xs text-gray-400">{client.business_name || client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/client-dashboard/messages"
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {client.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <ClientLayoutContent>{children}</ClientLayoutContent>
        </ConfirmProvider>
      </ToastProvider>
    </ClientAuthProvider>
  )
}
