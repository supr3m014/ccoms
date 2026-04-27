'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { CheckCircle, Clock, AlertCircle, Send, Loader2, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

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
  description: string | null
  status: 'not_started' | 'in_progress' | 'waiting_on_client' | 'done'
  is_checked: number
  deadline: string | null
  sort_order: number
}

interface Comment {
  id: string
  task_id: string
  author_type: 'client' | 'admin'
  author_name: string
  content: string
  created_at: string
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  waiting_on_client: { label: 'Action Required', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircle },
}

export default function OrdersPage() {
  const { client } = useClientAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [openComments, setOpenComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [sendingComment, setSendingComment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active')

  useEffect(() => {
    if (!client) return
    loadOrders()
  }, [client, filter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      let query = supabase.from('orders').select('*').eq('client_id', client!.id).order('created_at', { ascending: false })
      if (filter === 'active') query = query.in('status', ['active', 'pending_verification', 'paused'])
      if (filter === 'completed') query = query.eq('status', 'completed')
      const { data: ordersData } = await query
      setOrders(ordersData || [])

      if (ordersData && ordersData.length > 0) {
        const ids = ordersData.map((o: Order) => o.id)
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .in('order_id', ids)
          .eq('is_client_visible', 1)
          .order('sort_order')
        setTasks(tasksData || [])
      }
    } catch (e) { console.error('Orders error:', e) }
    finally { setLoading(false) }
  }

  const loadComments = async (taskId: string) => {
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .eq('is_internal', 0)
      .order('created_at', { ascending: true })
    setComments(prev => ({ ...prev, [taskId]: data || [] }))
  }

  const toggleComments = async (taskId: string) => {
    const newSet = new Set(openComments)
    if (newSet.has(taskId)) {
      newSet.delete(taskId)
    } else {
      newSet.add(taskId)
      if (!comments[taskId]) await loadComments(taskId)
    }
    setOpenComments(newSet)
  }

  const sendComment = async (taskId: string) => {
    const content = commentInputs[taskId]?.trim()
    if (!content || !client) return
    setSendingComment(taskId)
    try {
      await supabase.from('task_comments').insert([{
        task_id: taskId,
        author_type: 'client',
        author_name: client.name,
        content,
        is_internal: 0,
      }])
      setCommentInputs(prev => ({ ...prev, [taskId]: '' }))
      await loadComments(taskId)
    } catch {}
    setSendingComment(null)
  }

  const getProgress = (orderId: string) => {
    const t = tasks.filter(t => t.order_id === orderId)
    if (t.length === 0) return { total: 0, done: 0, pct: 0 }
    const done = t.filter(t => t.is_checked).length
    return { total: t.length, done, pct: Math.round((done / t.length) * 100) }
  }

  const SERVICE_LABELS: Record<string, string> = {
    seo: 'SEO', web_dev: 'Web Development', brand_design: 'Brand Design', ai_video: 'AI Video', other: 'Service'
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track your project progress and provide feedback</p>
        </div>
        <div className="flex gap-2">
          {(['active', 'completed', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No orders found</p>
        </div>
      ) : orders.map(order => {
        const prog = getProgress(order.id)
        const orderTasks = tasks.filter(t => t.order_id === order.id)
        const hasActionRequired = orderTasks.some(t => t.status === 'waiting_on_client')

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Order header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{order.service_name || SERVICE_LABELS[order.service_type]}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {order.payment_type === 'recurring' ? 'Monthly Subscription' : 'One-time Project'} ·
                    Started {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasActionRequired && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                      <AlertCircle className="w-3.5 h-3.5" /> Action Required
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'active' ? 'bg-green-50 text-green-700' : order.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-50 text-yellow-700'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>{prog.done}/{prog.total} tasks completed</span>
                  <span className="font-semibold text-gray-700">{prog.pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                    style={{ width: `${prog.pct}%` }} />
                </div>
              </div>
            </div>

            {/* Tasks */}
            {orderTasks.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No tasks yet — our team is preparing your project.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orderTasks.map(task => {
                  const cfg = STATUS_CONFIG[task.status]
                  const StatusIcon = cfg.icon
                  const commentsOpen = openComments.has(task.id)
                  const taskComments = comments[task.id] || []

                  return (
                    <div key={task.id} className={`${task.status === 'waiting_on_client' ? 'bg-yellow-50/50' : ''}`}>
                      <div className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          {/* Checkbox (read-only) */}
                          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${task.is_checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {task.is_checked ? <CheckCircle className="w-3 h-3 text-white" /> : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className={`font-medium text-sm ${task.is_checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {task.title}
                              </p>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.color}`}>
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {cfg.label}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.description}</p>
                            )}

                            {task.deadline && (
                              <p className="text-xs text-gray-400 mt-1">
                                📅 Due: {new Date(task.deadline).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}

                            {/* Comment toggle */}
                            <button onClick={() => toggleComments(task.id)}
                              className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                              <MessageCircle className="w-3.5 h-3.5" />
                              Comments {taskComments.length > 0 ? `(${taskComments.length})` : ''}
                              {commentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Comments section */}
                        {commentsOpen && (
                          <div className="mt-4 ml-9">
                            <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                              {taskComments.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No comments yet. Be the first to leave feedback.</p>
                              )}
                              {taskComments.map(c => (
                                <div key={c.id} className={`flex gap-2 ${c.author_type === 'client' ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c.author_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {c.author_name.charAt(0)}
                                  </div>
                                  <div className={`max-w-xs ${c.author_type === 'client' ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${c.author_type === 'admin' ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-700'}`}>
                                      {c.content}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 px-1">
                                      {c.author_name} · {new Date(c.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input type="text" value={commentInputs[task.id] || ''}
                                onChange={e => setCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') sendComment(task.id) }}
                                placeholder="Leave feedback on this task..."
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <button onClick={() => sendComment(task.id)} disabled={sendingComment === task.id || !commentInputs[task.id]?.trim()}
                                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-colors">
                                {sendingComment === task.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
