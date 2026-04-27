'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { Loader2, CheckCircle, Upload, ChevronRight } from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file'
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  accept?: string
}

interface IntakeForm {
  id: string
  service_type: string
  title: string
  fields: FormField[]
}

export default function IntakePage() {
  const router = useRouter()
  const { client, refresh } = useClientAuth()
  const [forms, setForms] = useState<IntakeForm[]>([])
  const [activeForm, setActiveForm] = useState<IntakeForm | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fileUploads, setFileUploads] = useState<Record<string, File>>({})

  useEffect(() => {
    if (!client) return
    loadForms()
  }, [client])

  const loadForms = async () => {
    try {
      // Load active orders for this client to find the right form
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', client?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (orders && orders.length > 0) {
        const serviceType = orders[0].service_type
        const { data: formData } = await supabase
          .from('intake_forms')
          .select('*')
          .eq('service_type', serviceType)
          .eq('is_active', 1)
          .single()

        if (formData) setActiveForm(formData)
      } else {
        // Load general form or first available
        const { data: formData } = await supabase
          .from('intake_forms')
          .select('*')
          .eq('is_active', 1)
          .limit(1)
          .single()
        if (formData) setActiveForm(formData)
      }
    } catch (e) {
      console.error('Error loading intake form:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (fieldId: string, file: File) => {
    setFileUploads(prev => ({ ...prev, [fieldId]: file }))
    // Upload file
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setResponses(prev => ({ ...prev, [fieldId]: data.url }))
        // Save to vault
        await supabase.from('vault_files').insert([{
          client_id: client?.id,
          file_name: file.name,
          file_url: data.url,
          file_size: file.size,
          file_type: 'document',
          upload_type: 'client_upload',
          uploaded_by: 'client',
          description: 'Intake form upload',
        }])
      }
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeForm || !client) return

    // Validate required fields
    for (const field of activeForm.fields) {
      if (field.required && !responses[field.id]) {
        alert(`Please fill in: ${field.label}`)
        return
      }
    }

    setSubmitting(true)
    try {
      // Save responses
      await supabase.from('intake_responses').insert([{
        client_id: client.id,
        form_id: activeForm.id,
        responses: responses,
      }])

      // Mark first login as completed
      await supabase.from('clients').update({ first_login_completed: 1 }).eq('id', client.id)

      // Create notification for admin
      await supabase.from('client_notifications').insert([{
        client_id: client.id,
        type: 'intake_completed',
        message: `${client.name} has completed the onboarding intake form.`,
        link: `/admin/clients`,
      }])

      await refresh()
      router.push('/client-dashboard')
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome, {client?.name}!</h1>
          <p className="text-slate-400">Before we begin, please complete this quick onboarding form. This helps our team deliver exactly what you need.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{activeForm?.title || 'Onboarding Questionnaire'}</h2>

          {!activeForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No intake form assigned yet. You can skip for now.</p>
              <button onClick={async () => {
                await supabase.from('clients').update({ first_login_completed: 1 }).eq('id', client?.id)
                await refresh()
                router.push('/client-dashboard')
              }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeForm.fields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input type="text" value={responses[field.id] || ''}
                      onChange={e => setResponses(p => ({ ...p, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  )}

                  {field.type === 'textarea' && (
                    <textarea value={responses[field.id] || ''} rows={4}
                      onChange={e => setResponses(p => ({ ...p, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                  )}

                  {field.type === 'select' && field.options && (
                    <select value={responses[field.id] || ''}
                      onChange={e => setResponses(p => ({ ...p, [field.id]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="">Select an option...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {field.type === 'multiselect' && field.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {field.options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                          <input type="checkbox"
                            checked={Array.isArray(responses[field.id]) && responses[field.id].includes(opt)}
                            onChange={e => {
                              const current = Array.isArray(responses[field.id]) ? responses[field.id] : []
                              setResponses(p => ({ ...p, [field.id]: e.target.checked ? [...current, opt] : current.filter((v: string) => v !== opt) }))
                            }}
                            className="rounded" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'file' && (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-600">
                        {fileUploads[field.id] ? fileUploads[field.id].name : 'Click to upload file'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">ZIP, PNG, JPG, AI, PDF accepted</span>
                      <input type="file" accept={field.accept || '*'} className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(field.id, f) }} />
                    </label>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><span>Submit & Access Dashboard</span><ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
