'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Phone, Building, Calendar, Trash2 } from 'lucide-react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  company: string
  message: string
  created_at: string
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
      if (error) throw error
      fetchSubmissions()
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Submissions</h1>
        <p className="text-gray-600">View and manage contact form submissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                All Submissions ({submissions.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions yet</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="font-medium text-gray-900 mb-1">{submission.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{submission.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()} at{' '}
                      {new Date(submission.created_at).toLocaleTimeString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedSubmission.name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedSubmission.created_at).toLocaleDateString()} at{' '}
                    {new Date(selectedSubmission.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                {selectedSubmission.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a
                        href={`tel:${selectedSubmission.phone}`}
                        className="font-medium text-gray-900"
                      >
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedSubmission.company && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900">{selectedSubmission.company}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: Your inquiry&body=Hi ${selectedSubmission.name},%0D%0A%0D%0A`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
