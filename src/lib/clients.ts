// Clients suite data layer — the admin side of the client-portal blueprint.
// Collections: clients, orders, payments, client_files, and per-client
// message threads at client_messages/{clientId}/messages. Admin-only rules;
// the future /client-dashboard portal will get its own scoped access.

import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

export type ClientStatus = 'active' | 'paused' | 'archived'
export type OrderStatus = 'pending_verification' | 'active' | 'paused' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected'

export const SERVICE_TYPES = [
  'Digital Marketing', 'SEO', 'Local SEO', 'GEO / AI Search', 'Website Development',
  'Mobile App Development', 'AI Ad & Commercial Production', 'Other',
] as const

export interface Client {
  id: string
  client_number: string // CC-0001
  name: string
  company: string
  email: string
  phone: string
  status: ClientStatus
  notes: string
  created_at: Timestamp
  updated_at: Timestamp
}

export interface OrderTask {
  id: string
  title: string
  done: boolean
}

export interface Order {
  id: string
  client_id: string
  client_name: string // denormalized for list views
  service_type: string
  service_name: string
  status: OrderStatus
  payment_type: 'one_off' | 'recurring'
  amount: number
  start_date: string // yyyy-mm-dd
  tasks: OrderTask[]
  created_at: Timestamp
  updated_at: Timestamp
}

export interface Payment {
  id: string
  client_id: string
  client_name: string
  order_id?: string
  amount: number
  method: 'gcash' | 'bank_transfer' | 'card' | 'cash' | 'other'
  reference: string
  status: PaymentStatus
  notes: string
  paid_at: string // yyyy-mm-dd
  created_at: Timestamp
}

export interface ClientFile {
  id: string
  client_id: string
  client_name: string
  filename: string
  category: 'report' | 'material' | 'invoice' | 'other'
  path: string
  url: string
  size: number
  created_at: Timestamp
}

export interface ClientMessage {
  id: string
  sender: 'admin' | 'client'
  content: string
  created_at: Timestamp
}

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending_verification: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
}

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  pending_verification: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export const peso = (n: number): string =>
  `₱${(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Next sequential client number (CC-0001, CC-0002, …). */
export async function nextClientNumber(): Promise<string> {
  const snap = await getDocs(query(collection(getDb(), 'clients'), orderBy('client_number', 'desc'), limit(1)))
  const last = snap.empty ? 0 : parseInt(String(snap.docs[0].data().client_number).replace(/\D/g, ''), 10) || 0
  return `CC-${String(last + 1).padStart(4, '0')}`
}

export async function fetchClients(): Promise<Client[]> {
  const snap = await getDocs(query(collection(getDb(), 'clients'), orderBy('created_at', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) }))
}
