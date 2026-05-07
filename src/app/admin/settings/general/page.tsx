'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GeneralSettingsPage() {
  const [siteName, setSiteName] = useState('Core Conversion')
  const [tagline, setTagline] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [dateFormat, setDateFormat] = useState('Y-m-d')
  const [timeFormat, setTimeFormat] = useState('H:i')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general')
        .maybeSingle()

      if (error) throw error

      if (data && data.value) {
        const settings = data.value as any
        setSiteName(settings.siteName || 'Core Conversion')
        setTagline(settings.tagline || '')
        setAdminEmail(settings.adminEmail || '')
        setTimezone(settings.timezone || 'UTC')
        setDateFormat(settings.dateFormat || 'Y-m-d')
        setTimeFormat(settings.timeFormat || 'H:i')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const settings = {
        siteName,
        tagline,
        adminEmail,
        timezone,
        dateFormat,
        timeFormat
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'general',
          value: settings
        }, { onConflict: 'key' })

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      alert(error.message || 'Failed to save settings')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">General Settings</h1>
        <p className="text-gray-600">Configure your site's basic information</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Site Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Just another website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email Address</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">This address is used for admin purposes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Y-m-d">2024-01-19</option>
              <option value="m/d/Y">01/19/2024</option>
              <option value="d/m/Y">19/01/2024</option>
              <option value="F j, Y">January 19, 2024</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="H:i">24-hour (14:30)</option>
              <option value="g:i a">12-hour (2:30 pm)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
