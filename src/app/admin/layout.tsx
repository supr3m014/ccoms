'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ConfirmProvider } from '@/contexts/ConfirmContext'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, Image, FolderOpen, Users, BarChart3,
  ChevronDown, ChevronRight, User, LogOut, Search, Headphones,
  Wrench, Menu, ChevronLeft, ExternalLink, UserCircle, CreditCard
} from 'lucide-react'

interface SubSection {
  name: string
  href: string
}

interface NavItem {
  name: string
  href: string
  icon: any
  subsections?: SubSection[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: UserCircle,
    subsections: [
      { name: 'All Clients', href: '/admin/clients' },
      { name: 'Payments', href: '/admin/clients/payments' },
      { name: 'Orders & Tasks', href: '/admin/clients/orders' },
      { name: 'Client Messages', href: '/admin/clients/messages' },
      { name: 'Reports & Files', href: '/admin/clients/reports' },
    ]
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: Image,
    subsections: [
      { name: 'Media Library', href: '/admin/media' },
      { name: 'Add Media', href: '/admin/media/upload' },
    ]
  },
  {
    name: 'Pages',
    href: '/admin/pages',
    icon: FileText,
    subsections: [
      { name: 'All Pages', href: '/admin/pages' },
      { name: 'Create New Page', href: '/admin/pages/new' },
      { name: 'Categories', href: '/admin/pages/categories' },
      { name: 'Tags', href: '/admin/pages/tags' },
    ]
  },
  {
    name: 'Posts',
    href: '/admin/posts',
    icon: FolderOpen,
    subsections: [
      { name: 'All Posts', href: '/admin/posts' },
      { name: 'Create New Post', href: '/admin/posts/new' },
      { name: 'Categories', href: '/admin/posts/categories' },
      { name: 'Tags', href: '/admin/posts/tags' },
      { name: 'Comments', href: '/admin/posts/comments' },
    ]
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    subsections: [
      { name: 'All Users', href: '/admin/users' },
      { name: 'Add User', href: '/admin/users/new' },
      { name: 'Profile', href: '/admin/profile' },
      { name: 'Tags', href: '/admin/users/tags' },
    ]
  },
  {
    name: 'Support / Ticket',
    href: '/admin/support',
    icon: Headphones,
    subsections: [
      { name: 'Ticket Desk', href: '/admin/support' },
      { name: 'Live Chat Hub', href: '/admin/support/chat' },
      { name: 'Chat History', href: '/admin/support/chat-history' },
      { name: 'Email Inbox', href: '/admin/support/email' },
      { name: 'Response Macros', href: '/admin/support/macros' },
    ]
  },
  {
    name: 'Tools',
    href: '/admin/tools',
    icon: Wrench,
    subsections: [
      { name: 'Backup / Restore', href: '/admin/tools' },
    ]
  },
  {
    name: 'SEO',
    href: '/admin/seo/meta',
    icon: BarChart3,
    subsections: [
      { name: 'Meta Editor', href: '/admin/seo/meta' },
      { name: 'File Generator', href: '/admin/seo/files' },
      { name: 'Header / Footer Scripts', href: '/admin/seo/scripts' },
      { name: 'Schema', href: '/admin/seo/schema' },
      { name: 'Redirects', href: '/admin/seo/redirects' },
    ]
  },
]

function getInitials(email: string) {
  return email.charAt(0).toUpperCase()
}

function getAvatarColor(email: string) {
  const colors = [
    'bg-blue-600', 'bg-violet-600', 'bg-emerald-600',
    'bg-rose-600', 'bg-orange-600', 'bg-teal-600',
  ]
  return colors[email.charCodeAt(0) % colors.length]
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showSiteDropdown, setShowSiteDropdown] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login' && pathname !== '/admin/setup') {
      router.push('/admin/login')
    }
  }, [user, loading, router, pathname])

  // Auto-expand active section and close others
  useEffect(() => {
    const activeSection = navigation.find(item => {
      if (item.subsections) {
        return item.subsections.some(sub =>
          pathname === sub.href || pathname?.startsWith(sub.href + '/')
        )
      }
      return pathname === item.href
    })

    if (activeSection) {
      setExpandedSections(activeSection.subsections ? [activeSection.name] : [])
    }
  }, [pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
        setShowProfileDropdown(false)
        setShowSiteDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (pathname === '/admin/login' || pathname === '/admin/setup') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const toggleSection = (name: string) => {
    setExpandedSections(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname?.startsWith(href + '/')
  }

  // For subsection links: exact match wins; only fall back to startsWith
  // if NO sibling subsection has a closer exact match.
  const isSubActive = (href: string, siblings: SubSection[]) => {
    if (pathname === href) return true
    if (!pathname?.startsWith(href + '/')) return false
    // startsWith matched — but only use it if no sibling matches exactly
    return !siblings.some(s => pathname === s.href)
  }

  const isSectionActive = (item: NavItem) => {
    if (item.subsections) return item.subsections.some(s => isActive(s.href))
    return isActive(item.href)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* ── TOP BAR ── */}
      <header className="h-11 bg-gray-900 flex items-center px-4 shrink-0 z-50 border-b border-gray-800">

        {/* Left — site identity */}
        <div className="relative" data-dropdown>
          <button
            onClick={() => setShowSiteDropdown(v => !v)}
            onMouseEnter={() => setShowSiteDropdown(true)}
            onMouseLeave={() => setShowSiteDropdown(false)}
            className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors"
          >
            <img src="/core-conversion.png" alt="" className="w-5 h-5 rounded" />
            <span className="text-sm font-semibold hidden sm:block">Core Conversion</span>
          </button>

          {showSiteDropdown && (
            <div
              className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 w-44 z-50"
              onMouseEnter={() => setShowSiteDropdown(true)}
              onMouseLeave={() => setShowSiteDropdown(false)}
              data-dropdown
            >
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                onClick={() => setShowSiteDropdown(false)}
              >
                <ExternalLink className="w-4 h-4" />
                View Site
              </Link>
            </div>
          )}
        </div>

        {/* Right — search + avatar */}
        <div className="ml-auto flex items-center gap-3">

          {/* Search (mock) */}
          <button
            className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 rounded hover:bg-gray-800"
            title="Search (coming soon)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Avatar + dropdown */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowProfileDropdown(v => !v)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${getAvatarColor(user.email || '')} hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 hover:ring-offset-gray-900 transition-all`}
            >
              {getInitials(user.email || '')}
            </button>

            {showProfileDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-52 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                </div>
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleSignOut() }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANE ── */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shrink-0`}>

          {/* Sidebar header */}
          <div className="h-11 flex items-center justify-between px-3 border-b border-gray-200 shrink-0">
            {!sidebarCollapsed && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-auto"
            >
              {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {navigation.map(item => {
              const Icon = item.icon
              const hasSubs = !!item.subsections?.length
              const expanded = expandedSections.includes(item.name)
              const sectionActive = isSectionActive(item)

              return (
                <div key={item.name}>
                  <div className={`flex items-center rounded-lg transition-colors ${isSectionActive(item) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    {/* Section name — navigates to href */}
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 flex-1 px-3 py-2 min-w-0 ${isSectionActive(item) ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                      title={sidebarCollapsed ? item.name : ''}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium truncate">{item.name}</span>
                      )}
                    </Link>

                    {/* Chevron — expands/collapses only */}
                    {hasSubs && !sidebarCollapsed && (
                      <button
                        onClick={() => toggleSection(item.name)}
                        className="p-2 text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        {expanded
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>

                  {/* Subsections */}
                  {hasSubs && expanded && !sidebarCollapsed && (
                    <div className="ml-9 mt-0.5 space-y-0.5 pb-1">
                      {item.subsections!.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            isSubActive(sub.href, item.subsections!)
                              ? 'text-blue-600 bg-blue-50 font-medium'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-2 py-3 border-t border-gray-200 shrink-0">
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
