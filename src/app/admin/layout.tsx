'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, FileText, Image, FolderOpen, MessageSquare, Search as SearchIcon,
  Settings, Users, Server, ChevronDown, ChevronRight, Bell, User, ExternalLink,
  Plus, Menu, X, Zap, BarChart3, Tag, Shield, ChevronLeft, LogOut
} from 'lucide-react'

interface NavSection {
  name: string
  href?: string
  icon: any
  subsections?: { name: string; href: string }[]
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNewDropdown, setShowNewDropdown] = useState(false)
  const [showSiteTitleDropdown, setShowSiteTitleDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const navigation: NavSection[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    {
      name: 'Media Library',
      icon: Image,
      subsections: [
        { name: 'Library', href: '/admin/media' },
      ]
    },
    {
      name: 'Pages',
      icon: FileText,
      subsections: [
        { name: 'All Pages', href: '/admin/pages' },
        { name: 'Add Page', href: '/admin/pages/new' },
        { name: 'Categories', href: '/admin/pages/categories' },
        { name: 'Tags', href: '/admin/pages/tags' },
      ]
    },
    {
      name: 'Posts',
      icon: FolderOpen,
      subsections: [
        { name: 'All Posts', href: '/admin/posts' },
        { name: 'Add Post', href: '/admin/posts/new' },
        { name: 'Categories', href: '/admin/posts/categories' },
        { name: 'Tags', href: '/admin/posts/tags' },
      ]
    },
    { name: 'Interactions', href: '/admin/interactions', icon: MessageSquare },
    {
      name: 'SEO',
      icon: BarChart3,
      subsections: [
        { name: 'Meta', href: '/admin/seo/meta' },
        { name: 'Scripts', href: '/admin/seo/scripts' },
        { name: 'Redirects & HTTP', href: '/admin/seo/redirects' },
        { name: 'Sitemaps', href: '/admin/seo/sitemaps' },
      ]
    },
    {
      name: 'Settings',
      icon: Settings,
      subsections: [
        { name: 'General', href: '/admin/settings/general' },
        { name: 'Reading', href: '/admin/settings/reading' },
        { name: 'Media', href: '/admin/settings/media' },
        { name: 'Permalinks', href: '/admin/settings/permalinks' },
        { name: 'Admin Users', href: '/admin/settings' },
      ]
    },
    {
      name: 'Users',
      icon: Users,
      subsections: [
        { name: 'All Users', href: '/admin/users' },
        { name: 'Add User', href: '/admin/users/new' },
      ]
    },
    { name: 'System', href: '/admin/system', icon: Server },
  ]

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login' && pathname !== '/admin/setup') {
      router.push('/admin/login')
    }
  }, [user, loading, router, pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setShowProfileDropdown(false)
        setShowNewDropdown(false)
        setShowSiteTitleDropdown(false)
        setShowNotifications(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowProfileDropdown(false)
        setShowNewDropdown(false)
        setShowSiteTitleDropdown(false)
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    navigation.forEach(section => {
      if (section.subsections) {
        const isActive = section.subsections.some(sub => pathname?.startsWith(sub.href))
        if (isActive && !expandedSections.includes(section.name.toLowerCase())) {
          setExpandedSections(prev => [...prev, section.name.toLowerCase()])
        }
      }
    })
  }, [pathname, expandedSections])

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([])
        setSearching(false)
        return
      }

      if (!supabase) {
        setSearching(false)
        return
      }

      setSearching(true)
      try {
        const searchTerm = searchQuery.toLowerCase()

        const [pagesResult, postsResult, categoriesResult, tagsResult] = await Promise.all([
          supabase.from('pages').select('id, title, slug, status').ilike('title', `%${searchTerm}%`).limit(5),
          supabase.from('posts').select('id, title, slug, status').ilike('title', `%${searchTerm}%`).limit(5),
          supabase.from('categories').select('id, name, type').ilike('name', `%${searchTerm}%`).limit(5),
          supabase.from('tags').select('id, name, type').ilike('name', `%${searchTerm}%`).limit(5)
        ])

        const results = [
          ...(pagesResult.data || []).map((p: any) => ({ ...p, type: 'page', href: `/admin/pages` })),
          ...(postsResult.data || []).map((p: any) => ({ ...p, type: 'post', href: `/admin/posts` })),
          ...(categoriesResult.data || []).map((c: any) => ({ ...c, type: 'category', href: `/admin/${c.type}s/categories` })),
          ...(tagsResult.data || []).map((t: any) => ({ ...t, type: 'tag', href: `/admin/${t.type}s/tags` }))
        ]

        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setSearching(false)
      }
    }

    const debounce = setTimeout(performSearch, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  if (pathname === '/admin/login' || pathname === '/admin/setup') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName.toLowerCase())
        ? prev.filter(s => s !== sectionName.toLowerCase())
        : [...prev, sectionName.toLowerCase()]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === href
    return pathname?.startsWith(href)
  }

  const isSectionActive = (section: NavSection) => {
    if (section.href) {
      return isActive(section.href)
    }
    if (section.subsections) {
      return section.subsections.some(sub => isActive(sub.href))
    }
    return false
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-orange-500 text-white',
      'bg-teal-500 text-white',
    ]
    const index = email.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Admin Bar */}
      <div className="h-8 bg-gray-900 text-white flex items-center px-4 text-xs z-50">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <img src="/core-conversion.png" alt="Core Conversion" className="w-4 h-4" />

          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowSiteTitleDropdown(!showSiteTitleDropdown)}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              Core Conversion
              <ChevronDown className="w-3 h-3" />
            </button>

            {showSiteTitleDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded shadow-lg py-1 w-40 z-50">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setShowSiteTitleDropdown(false)}
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit Site
                </Link>
              </div>
            )}
          </div>

          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              New
            </button>

            {showNewDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded shadow-lg py-1 w-40 z-50">
                <Link
                  href="/admin/posts/new"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setShowNewDropdown(false)}
                >
                  Post
                </Link>
                <Link
                  href="/admin/pages/new"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setShowNewDropdown(false)}
                >
                  Page
                </Link>
                <Link
                  href="/admin/media"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setShowNewDropdown(false)}
                >
                  Media
                </Link>
                <Link
                  href="/admin/users/new"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setShowNewDropdown(false)}
                >
                  User
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:text-blue-400 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-1 bg-white text-gray-900 rounded shadow-lg w-80 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">New comment pending approval</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Post scheduled for publishing</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">New contact submission</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSearch(true)}
            className="hover:text-blue-400 transition-colors"
          >
            <SearchIcon className="w-4 h-4" />
          </button>

          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${getAvatarColor(user.email || '')}`}>
                {getInitials(user.email || '')}
              </div>
              <span>{user.email}</span>
            </button>

            {showProfileDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white text-gray-900 rounded shadow-lg py-1 w-48 z-50">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false)
                    handleSignOut()
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full text-left text-red-600"
                >
                  <Shield className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-900">Admin Panel</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const hasSubsections = item.subsections && item.subsections.length > 0
              const isExpanded = expandedSections.includes(item.name.toLowerCase())
              const itemActive = isSectionActive(item)

              return (
                <div key={item.name}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                        itemActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title={sidebarCollapsed ? item.name : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => hasSubsections && toggleSection(item.name)}
                        className="flex items-center gap-3 px-3 py-2 rounded text-gray-700 hover:bg-gray-50 transition-colors w-full"
                        title={sidebarCollapsed ? item.name : ''}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="text-sm flex-1 text-left">{item.name}</span>
                            {hasSubsections && (
                              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </button>

                      {!sidebarCollapsed && hasSubsections && isExpanded && (
                        <div className="ml-8 space-y-1 mt-1">
                          {item.subsections!.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                                isActive(sub.href)
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors w-full text-red-600 hover:bg-red-50 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search (type at least 3 characters)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {searching ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Searching...</p>
                </div>
              ) : searchQuery.length < 3 ? (
                <p className="text-sm text-gray-500 text-center py-8">Type at least 3 characters to search...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No results found</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <Link
                      key={`${result.type}-${result.id}-${index}`}
                      href={result.href}
                      onClick={() => {
                        setShowSearch(false)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {result.title || result.name}
                          </div>
                          {result.slug && (
                            <div className="text-xs text-gray-500">/{result.slug}</div>
                          )}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium capitalize">
                          {result.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { ToastProvider } from '@/contexts/ToastContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ToastProvider>
    </AuthProvider>
  )
}
