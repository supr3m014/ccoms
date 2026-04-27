'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import {
  ClipboardList, Plus, Trash2, CheckSquare, Square, Edit3,
  ChevronDown, ChevronUp, X, Save, Loader2, AlertCircle, CheckCircle
} from 'lucide-react'

interface Client { id: string; client_id: string; name: string; email: string }
interface Order {
  id: string; client_id: string; service_type: string; service_name: string;
  status: string; payment_type: string; amount: number | null; created_at: string
  client?: Client
}
interface Task {
  id: string; order_id: string; title: string; description: string | null;
  status: string; is_checked: number; sort_order: number; deadline: string | null
}

const TASK_STATUSES = ['not_started', 'in_progress', 'waiting_on_client', 'done'] as const

export default function OrdersTasksPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [orders, setOrders] = useState<Order[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({})
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Task>>({})
  const [filterClient, setFilterClient] = useState('')
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetchOrders()
    supabase.from('clients').select('id, client_id, name, email').eq('status', 'active').order('name').then(({ data }) => setClients(data || []))
  }, [filterClient])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (filterClient) query = query.eq('client_id', filterClient)
      const { data: ordersData } = await query

      if (ordersData && ordersData.length > 0) {
        // Fetch clients separately (PHP bridge doesn't support JOIN syntax)
        const { data: clientsData } = await supabase.from('clients').select('id, client_id, name, email')
        const clientMap = new Map((clientsData || []).map((c: Client) => [c.id, c]))
        const enriched = ordersData.map((o: any) => ({ ...o, client: clientMap.get(o.client_id) }))
        setOrders(enriched)
      } else {
        setOrders([])
      }
    } catch {}
    setLoading(false)
  }

  const loadTasks = async (orderId: string) => {
    const { data } = await supabase.from('tasks').select('*').eq('order_id', orderId).order('sort_order')
    setTasks(prev => ({ ...prev, [orderId]: data || [] }))
  }

  const toggleOrder = async (orderId: string) => {
    const s = new Set(expandedOrders)
    if (s.has(orderId)) { s.delete(orderId) }
    else { s.add(orderId); if (!tasks[orderId]) await loadTasks(orderId) }
    setExpandedOrders(s)
  }

  const addTask = async (orderId: string) => {
    const title = newTaskInputs[orderId]?.trim()
    if (!title) return
    const id = crypto.randomUUID()
    const sortOrder = (tasks[orderId]?.length || 0) + 1
    await supabase.from('tasks').insert([{ id, order_id: orderId, title, sort_order: sortOrder, status: 'not_started', is_checked: 0 }])
    setNewTaskInputs(prev => ({ ...prev, [orderId]: '' }))
    await loadTasks(orderId)
  }

  const toggleTaskCheck = async (task: Task) => {
    const newChecked = task.is_checked ? 0 : 1
    const newStatus = newChecked ? 'done' : 'not_started'
    await supabase.from('tasks').update({ is_checked: newChecked, status: newStatus }).eq('id', task.id)
    setTasks(prev => ({
      ...prev,
      [task.order_id]: prev[task.order_id].map(t => t.id === task.id ? { ...t, is_checked: newChecked, status: newStatus } : t)
    }))
  }

  const updateTaskStatus = async (task: Task, status: string) => {
    const is_checked = status === 'done' ? 1 : 0
    await supabase.from('tasks').update({ status, is_checked }).eq('id', task.id)
    setTasks(prev => ({
      ...prev,
      [task.order_id]: prev[task.order_id].map(t => t.id === task.id ? { ...t, status, is_checked } : t)
    }))
  }

  const saveEditTask = async () => {
    if (!editingTask) return
    await supabase.from('tasks').update(editData).eq('id', editingTask)
    const orderId = Object.keys(tasks).find(oid => tasks[oid].some(t => t.id === editingTask))
    if (orderId) await loadTasks(orderId)
    setEditingTask(null)
    setEditData({})
    showToast('Task updated', 'success')
  }

  const deleteTask = async (task: Task) => {
    const ok = await showConfirm(`Delete task "${task.title}"?`, { destructive: true })
    if (!ok) return
    await supabase.from('tasks').delete().eq('id', task.id)
    setTasks(prev => ({ ...prev, [task.order_id]: prev[task.order_id].filter(t => t.id !== task.id) }))
  }

  const STATUS_COLORS: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    waiting_on_client: 'bg-yellow-100 text-yellow-700',
    done: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders & Task Manager</h1>
          <p className="text-gray-500">Build and manage the project spreadsheet for each client</p>
        </div>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.client_id})</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const client = (order as any).client as Client
            const isExpanded = expandedOrders.has(order.id)
            const orderTasks = tasks[order.id] || []
            const done = orderTasks.filter(t => t.is_checked).length
            const pct = orderTasks.length > 0 ? Math.round((done / orderTasks.length) * 100) : 0

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => toggleOrder(order.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {client?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{client?.name || 'Unknown Client'} <span className="text-gray-400 font-normal text-sm">· {client?.client_id}</span></p>
                      <p className="text-sm text-gray-500">{order.service_name || order.service_type} · {order.payment_type === 'recurring' ? 'Monthly' : 'One-off'}{order.amount ? ` · ₱${order.amount.toLocaleString()}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {orderTasks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{done}/{orderTasks.length}</span>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    {/* Tasks */}
                    <div className="space-y-2 mb-4">
                      {orderTasks.map(task => (
                        <div key={task.id}>
                          {editingTask === task.id ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                              <input value={editData.title || ''} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <textarea value={editData.description || ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} rows={2}
                                placeholder="Description (visible to client)" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                              <div className="flex gap-2">
                                <input type="date" value={editData.deadline || ''} onChange={e => setEditData(d => ({ ...d, deadline: e.target.value }))}
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                                <button onClick={saveEditTask} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                                  <Save className="w-3.5 h-3.5" /> Save
                                </button>
                                <button onClick={() => setEditingTask(null)} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-50">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-3 p-3 rounded-xl group hover:bg-gray-50 ${task.status === 'waiting_on_client' ? 'bg-yellow-50' : ''}`}>
                              <button onClick={() => toggleTaskCheck(task)} className="shrink-0">
                                {task.is_checked ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5 text-gray-400" />}
                              </button>
                              <span className={`flex-1 text-sm ${task.is_checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                              {task.deadline && <span className="text-xs text-gray-400">📅 {task.deadline}</span>}
                              <select value={task.status} onChange={e => updateTaskStatus(task, e.target.value)}
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[task.status]}`}>
                                {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                              </select>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingTask(task.id); setEditData({ title: task.title, description: task.description, deadline: task.deadline }) }}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteTask(task)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add task input */}
                    <div className="flex gap-2">
                      <input value={newTaskInputs[order.id] || ''} onChange={e => setNewTaskInputs(p => ({ ...p, [order.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') addTask(order.id) }}
                        placeholder="Add a new task (press Enter)..."
                        className="flex-1 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-solid" />
                      <button onClick={() => addTask(order.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-xl text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
