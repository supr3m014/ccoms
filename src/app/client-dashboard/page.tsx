'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import Link from 'next/link'
import {
  CheckCircle, Clock, AlertCircle, TrendingUp, FolderOpen,
  Bell, MessageCircle, CreditCard, ChevronRight, Loader2
} from 'lucide-react'

interface Order {
  id: string
  service_type: string
  service_name: string
  status: string
  payment_type: string
  start_date: string
  created_at: string
}

interface Task {
  id: string
  order_id: string
  title: string
  status: string
  is_checked: number
  deadline: string | null
}

interface Notification {
  id: string
  type: string
  message: string
  link: string | null
  is_read: number
  created_at: string
}

const SERVICE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  seo: { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'SEO' },
  web_dev: { bg: 'bg-blue-500', text: 'text-blue-700', label: 'Web Dev' },
  brand_design: { bg: 'bg-purple-500', text: 'text-purple-700', label: 'Brand Design' },
  ai_video: { bg: 'bg-orange-500', text: 'text-orange-700', label: 'AI Video' },
  other: { bg: 'bg-gray-500', text: 'text-gray-700', label: 'Service' },
}

export default function ClientDashboard() {
  const { client } = useClientAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client) return
    loadDashboard()
  }, [client])

  const loadDashboard = async () => {
    try {
      const [ordersRes, notifRes, msgsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('client_id', client!.id).order('created_at', { ascending: false }),
        supabase.from('client_notifications').select('*').eq('client_id', client!.id).eq('is_read', 0).order('created_at', { ascending: false }).limit(5),
        supabase.from('client_messages').select('id, read_at, sender_type').eq('client_id', client!.id).eq('sender_type', 'admin'),
      ])
      setOrders(ordersRes.data || [])
      setNotifications(notifRes.data || [])
      setUnreadMessages((msgsRes.data || []).filter((m: any) => !m.read_at).length)

      // Load tasks for active orders
      if (ordersRes.data && ordersRes.data.length > 0) {
        const orderIds = (ordersRes.data || []).filter((o: Order) => o.status === 'active').map((o: Order) => o.id)
        if (orderIds.length > 0) {
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .in('order_id', orderIds)
            .eq('is_client_visible', 1)
            .order('sort_order')
          setTasks(tasksData || [])
        }
      }
    } catch (e) {
      console.error('Dashboard error:', e)
    } finally {
      setLoading(false)
    }
  }

  const markNotificationRead = async (id: string) => {
    await supabase.from('client_notifications').update({ is_read: 1 }).eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTaskProgress = (orderId: string) => {
    const orderTasks = tasks.filter(t => t.order_id === orderId)
    if (orderTasks.length === 0) return 0
    const done = orderTasks.filter(t => t.is_checked).length
    return Math.round((done / orderTasks.length) * 100)
  }

  const getStatusIcon = (status: string) => {
    if (status === 'done') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-500" />
    if (status === 'waiting_on_client') return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const activeOrders = orders.filter(o => o.status === 'active')
  const pendingTasks = tasks.filter(t => t.status === 'waiting_on_client')

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good day, {client?.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 p-1.5 bg-blue-50 text-blue-600 rounded-xl" />
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeOrders.length}</p>
          <p className="text-sm text-gray-500 mt-1">Active Service{activeOrders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 p-1.5 bg-yellow-50 text-yellow-600 rounded-xl" />
            <span className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-0.5 rounded-full">Action</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">Waiting on You</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <MessageCircle className="w-8 h-8 p-1.5 bg-green-50 text-green-600 rounded-xl" />
            {unreadMessages > 0 && <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">New</span>}
          </div>
          <p className="text-3xl font-bold text-gray-900">{unreadMessages}</p>
          <p className="text-sm text-gray-500 mt-1">Unread Message{unreadMessages !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Bell className="w-8 h-8 p-1.5 bg-purple-50 text-purple-600 rounded-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
          <p className="text-sm text-gray-500 mt-1">Notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active services */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Active Services</h2>
            <Link href="/client-dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No active services</p>
              <p className="text-gray-400 text-sm mt-1">Your subscribed services will appear here</p>
            </div>
          ) : activeOrders.map(order => {
            const svc = SERVICE_COLORS[order.service_type] || SERVICE_COLORS.other
            const progress = getTaskProgress(order.id)
            const orderTasks = tasks.filter(t => t.order_id === order.id)
            const waitingTasks = orderTasks.filter(t => t.status === 'waiting_on_client')
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${svc.bg} rounded-xl flex items-center justify-center`}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.service_name || svc.label}</h3>
                      <p className="text-xs text-gray-400">{order.payment_type === 'recurring' ? 'Monthly' : 'One-off'} · Started {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {waitingTasks.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" /> {waitingTasks.length} Action Required
                    </span>
                  )}
                </div>
                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Overall Progress</span>
                    <span className="font-semibold text-gray-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${svc.bg} transition-all duration-500`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {/* Recent tasks */}
                {orderTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 py-1.5">
                    {getStatusIcon(task.status)}
                    <span className={`text-sm ${task.is_checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                  </div>
                ))}
                <Link href="/client-dashboard/orders"
                  className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View full details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" /> Notifications
            </h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">You're all caught up!</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <Bell className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => markNotificationRead(n.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Quick Access</h2>
            <div className="space-y-2">
              {[
                { href: '/client-dashboard/vault', icon: FolderOpen, label: 'Upload Files', sub: 'Share docs with our team' },
                { href: '/client-dashboard/messages', icon: MessageCircle, label: 'Send a Message', sub: unreadMessages > 0 ? `${unreadMessages} unread` : 'Chat with our team' },
                { href: '/client-dashboard/billing', icon: CreditCard, label: 'Billing', sub: 'View payment history' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <item.icon className="w-8 h-8 p-1.5 bg-gray-100 text-gray-600 rounded-lg shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
