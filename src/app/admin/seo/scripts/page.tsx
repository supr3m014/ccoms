'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Code, Plus } from 'lucide-react'

interface Script {
  id: string
  location: string
  script_content: string
  environment: string
  version: number
  is_active: boolean
  created_at: string
}

export default function SEOScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)
  const [headScript, setHeadScript] = useState('')
  const [bodyScript, setBodyScript] = useState('')
  const [footerScript, setFooterScript] = useState('')
  const [environment, setEnvironment] = useState('both')

  useEffect(() => {
    fetchScripts()
  }, [])

  const fetchScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_scripts')
        .select('*')
        .eq('is_active', true)
        .order('location')

      if (error) throw error

      const scriptsData = data || []
      setScripts(scriptsData)

      scriptsData.forEach((script: any) => {
        if (script.location === 'head') setHeadScript(script.script_content)
        if (script.location === 'body_start') setBodyScript(script.script_content)
        if (script.location === 'footer') setFooterScript(script.script_content)
      })
    } catch (error) {
      console.error('Error fetching scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveScripts = async () => {
    try {
      await supabase.from('seo_scripts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')

      const scriptsToInsert = []

      if (headScript.trim()) {
        scriptsToInsert.push({
          location: 'head',
          script_content: headScript.trim(),
          environment,
          is_active: true
        })
      }

      if (bodyScript.trim()) {
        scriptsToInsert.push({
          location: 'body_start',
          script_content: bodyScript.trim(),
          environment,
          is_active: true
        })
      }

      if (footerScript.trim()) {
        scriptsToInsert.push({
          location: 'footer',
          script_content: footerScript.trim(),
          environment,
          is_active: true
        })
      }

      if (scriptsToInsert.length > 0) {
        const { error } = await supabase
          .from('seo_scripts')
          .insert(scriptsToInsert)

        if (error) throw error
      }

      alert('Scripts saved successfully!')
      fetchScripts()
    } catch (error: any) {
      console.error('Error saving scripts:', error)
      alert(error.message || 'Failed to save scripts')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Scripts</h1>
        <p className="text-gray-600">Manage global scripts for tracking, analytics, and SEO</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Loading scripts...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Both (Staging & Production)</option>
                <option value="staging">Staging Only</option>
                <option value="production">Production Only</option>
              </select>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Code className="w-4 h-4 inline mr-2" />
                  Head Scripts
                </label>
                <p className="text-xs text-gray-500 mb-2">Scripts injected in the {'<head>'} section (e.g., Google Tag Manager)</p>
                <textarea
                  value={headScript}
                  onChange={(e) => setHeadScript(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='<script>
// Your head scripts here
</script>'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Code className="w-4 h-4 inline mr-2" />
                  Body Start Scripts
                </label>
                <p className="text-xs text-gray-500 mb-2">Scripts injected at the start of {'<body>'} (e.g., GTM noscript)</p>
                <textarea
                  value={bodyScript}
                  onChange={(e) => setBodyScript(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='<!-- Your body start scripts here -->'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Code className="w-4 h-4 inline mr-2" />
                  Footer Scripts
                </label>
                <p className="text-xs text-gray-500 mb-2">Scripts injected before closing {'</body>'} (e.g., analytics, chat widgets)</p>
                <textarea
                  value={footerScript}
                  onChange={(e) => setFooterScript(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='<script>
// Your footer scripts here
</script>'
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={saveScripts}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Save Scripts
              </button>
              <button
                onClick={() => {
                  setHeadScript('')
                  setBodyScript('')
                  setFooterScript('')
                }}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Scripts are versioned automatically - previous versions are preserved</li>
              <li>• Only one version can be active at a time per location</li>
              <li>• Scripts are cached and may take a few minutes to update on your site</li>
              <li>• Always test scripts in staging before deploying to production</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
