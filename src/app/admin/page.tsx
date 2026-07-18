'use client'

// Dashboard — live numbers from the real Firestore collections, and the two
// lists that actually need attention each morning: fresh leads and anything
// waiting on a reply.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  collection, query, where, orderBy, limit, getDocs, getCountFromServer, Timestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import {
  Zap, LifeBuoy, MessageCircle, Mail, FileText, TrendingUp, ArrowRight, MessageSquare,
} from 'lucide-react'

interface Stats {
  newLeads: number
  openTickets: number
  activeChats: number
  inboxUnread: number
  publishedPosts: number
  pendingComments: number
}

interface RecentLead { id: string; fullName: string; businessName: string; createdAt: Timestamp }
interface RecentTicket { id: string; subject: string; visitor_name: string; status: string; created_at: Timestamp }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const db = getDb()
      try {
        const count = async (q: Parameters<typeof getCountFromServer>[0]) =>
          (await getCountFromServer(q)).data().count

        const [newLeads, openTickets, activeChats, inboxUnread, publishedPosts, pendingComments] = await Promise.all([
          count(query(collection(db, 'leads'), where('status', '==', 'new'))),
          count(query(collection(db, 'tickets'), where('status', '==', 'open'))),
          count(query(collection(db, 'chat_sessions'), where('mode', 'in', ['ai', 'human']))),
          count(query(collection(db, 'contact_submissions'), where('archived', '==', false))),
          count(query(collection(db, 'blog_posts'), where('status', '==', 'published'))),
          count(query(collection(db, 'blog_comments'), where('status', '==', 'pending'))),
        ])
        setStats({ newLeads, openTickets, activeChats, inboxUnread, publishedPosts, pendingComments })

        const [leadsSnap, ticketsSnap] = await Promise.all([
          getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(collection(db, 'tickets'), orderBy('created_at', 'desc'), limit(5))),
        ])
        setRecentLeads(leadsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecentLead, 'id'>) })))
        setRecentTickets(ticketsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecentTicket, 'id'>) })))
      } catch (err) {
        console.error('dashboard load failed', err)
      }
      setLoading(false)
    })()
  }, [])

  const cards = stats ? [
    { name: 'New Leads', value: stats.newLeads, icon: Zap, color: 'from-blue-600 to-cyan-600', href: '/admin/leads' },
    { name: 'Open Tickets', value: stats.openTickets, icon: LifeBuoy, color: 'from-red-500 to-orange-500', href: '/admin/support' },
    { name: 'Active Chats', value: stats.activeChats, icon: MessageCircle, color: 'from-emerald-500 to-green-600', href: '/admin/support/chat' },
    { name: 'Inbox Messages', value: stats.inboxUnread, icon: Mail, color: 'from-orange-500 to-amber-500', href: '/admin/support/email' },
    { name: 'Published Posts', value: stats.publishedPosts, icon: FileText, color: 'from-purple-600 to-pink-600', href: '/admin/posts' },
    { name: 'Comments to Review', value: stats.pendingComments, icon: MessageSquare, color: 'from-yellow-500 to-amber-600', href: '/admin/posts/comments' },
  ] : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Live across leads, support, and content.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.name} href={card.href}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Latest Leads</h2>
            <Link href="/admin/leads" className="text-sm text-blue-600 font-semibold inline-flex items-center gap-1">All leads <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No leads yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentLeads.map((l) => (
                <Link key={l.id} href="/admin/leads" className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{l.fullName}</p>
                    <p className="text-xs text-gray-500">{l.businessName}</p>
                  </div>
                  <span className="text-xs text-gray-400">{l.createdAt?.toDate().toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Latest Tickets</h2>
            <Link href="/admin/support" className="text-sm text-blue-600 font-semibold inline-flex items-center gap-1">Ticket desk <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No tickets yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTickets.map((t) => (
                <Link key={t.id} href="/admin/support" className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500">{t.visitor_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${t.status === 'open' ? 'bg-red-100 text-red-700' : t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
