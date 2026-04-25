'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Check, X } from 'lucide-react'

interface Comment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  content: string
  status: 'approved' | 'pending' | 'spam'
  created_at: string
  post_title?: string
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'spam'>('all')

  useEffect(() => {
    fetchComments()
  }, [filter])

  const fetchComments = async () => {
    try {
      let query = supabase
        .from('interactions')
        .select('*')
        .eq('type', 'comment')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCommentStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('interactions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      spam: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100'
  }

  const filteredComments = comments.filter(c => filter === 'all' || c.status === filter)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comments</h1>
        <p className="text-gray-600">Moderate blog post comments</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({comments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending ({comments.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'approved' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Approved ({comments.filter(c => c.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('spam')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'spam' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Spam ({comments.filter(c => c.status === 'spam').length})
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading comments...</div>
        ) : filteredComments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No comments found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{comment.author_name}</h4>
                    <p className="text-sm text-gray-500">{comment.author_email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(comment.status)}`}>
                    {comment.status}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{comment.content}</p>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'approved')}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition flex items-center gap-1 text-xs font-medium"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'spam')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center gap-1 text-xs font-medium"
                      >
                        <X className="w-3 h-3" />
                        Spam
                      </button>
                    )}
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition flex items-center gap-1 text-xs font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
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
