'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Star, ThumbsUp, Search, Filter } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

interface Interaction {
  id: string
  type: string
  content_type: string
  content_id: string | null
  name: string
  email: string
  content: string
  rating: number | null
  status: string
  created_at: string
}

export default function InteractionsPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    fetchInteractions()
  }, [typeFilter, statusFilter])

  const fetchInteractions = async () => {
    try {
      let query = supabase
        .from('interactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setInteractions(data || [])
    } catch (error) {
      console.error('Error fetching interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('interactions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      fetchInteractions()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      showToast('Please select items first', 'warning')
      return
    }

    try {
      if (action === 'approve') {
        await supabase
          .from('interactions')
          .update({ status: 'published' })
          .in('id', selectedItems)
      } else if (action === 'spam') {
        await supabase
          .from('interactions')
          .update({ status: 'trash' })
          .in('id', selectedItems)
      } else if (action === 'delete') {
        const ok = await showConfirm(`Delete ${selectedItems.length} item(s)?`, { destructive: true })
        if (!ok) return
        await supabase
          .from('interactions')
          .delete()
          .in('id', selectedItems)
      }

      setSelectedItems([])
      fetchInteractions()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const filteredInteractions = interactions.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      trash: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4" />
      case 'review':
        return <Star className="w-4 h-4" />
      case 'testimonial':
        return <ThumbsUp className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const stats = {
    total: interactions.length,
    pending: interactions.filter(i => i.status === 'pending').length,
    published: interactions.filter(i => i.status === 'published').length,
    trash: interactions.filter(i => i.status === 'trash').length
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Interactions</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Published</p>
          <p className="text-3xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Trash</p>
          <p className="text-3xl font-bold text-red-600">{stats.trash}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="comment">Comments</option>
                <option value="review">Reviews</option>
                <option value="testimonial">Testimonials</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="trash">Trash</option>
              </select>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('spam')}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Mark as Spam
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search interactions..."
                className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
              />
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading interactions...</div>
        ) : filteredInteractions.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No interactions found</h3>
            <p className="text-gray-600">Interactions from your website will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInteractions.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id])
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id))
                      }
                    }}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium capitalize">{item.type}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{item.email}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{item.content}</p>
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(item.id, 'published')}
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          Approve
                        </button>
                      )}
                      {item.status === 'published' && (
                        <button
                          onClick={() => updateStatus(item.id, 'pending')}
                          className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          Unapprove
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(item.id, 'trash')}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Spam
                      </button>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-500">
                        On: {item.content_type} {item.content_id ? `(${item.content_id.substring(0, 8)})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
