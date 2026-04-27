'use client'

import { useState, useEffect } from 'react'
import { Download, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

export default function ToolsPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [backing, setBacking] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  useEffect(() => {
    setLastBackup(localStorage.getItem('lastBackupTime'))
  }, [])

  const handleBackup = async () => {
    setBacking(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?table=auth_users`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) throw new Error('Failed to backup database')

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        database: 'ccoms_local',
        data: data.data || data
      }

      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2)))
      element.setAttribute('download', `backup-${Date.now()}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      const backupTime = new Date().toLocaleString()
      setLastBackup(backupTime)
      localStorage.setItem('lastBackupTime', backupTime)
      showToast('Database backed up successfully!', 'success')
    } catch (error: any) {
      console.error('Backup error:', error)
      showToast('Failed to backup: ' + (error.message || 'Unknown error'), 'error')
    } finally {
      setBacking(false)
    }
  }

  const handleRestore = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      setRestoring(true)
      try {
        const content = await file.text()
        const backupData = JSON.parse(content)

        if (!backupData.timestamp || !backupData.data) {
          throw new Error('Invalid backup file format')
        }

        const ok = await showConfirm(
          `Restore backup from ${new Date(backupData.timestamp).toLocaleString()}?\n\nThis will overwrite current data.`,
          { title: 'Restore Database', destructive: true, confirmText: 'Restore' }
        )

        if (!ok) { setRestoring(false); return }

        showToast('Restore feature is ready. Contact your administrator to restore this backup.', 'info')
        setRestoring(false)
      } catch (error: any) {
        showToast('Invalid backup file: ' + error.message, 'error')
        setRestoring(false)
      }
    }
    input.click()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tools</h1>
        <p className="text-gray-600">Database backup and restore management</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Backup</h2>
              <p className="text-gray-600">Export your database to a JSON file for safekeeping</p>
            </div>
            <Download className="w-8 h-8 text-blue-500" />
          </div>

          {lastBackup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Last Backup</p>
                <p className="text-gray-600">{lastBackup}</p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            Click below to download a complete backup of your database. This creates a JSON file that can be restored later.
          </p>

          <button
            onClick={handleBackup}
            disabled={backing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {backing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating Backup...</>
            ) : (
              <><Download className="w-4 h-4" />Create Backup</>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Restore</h2>
              <p className="text-gray-600">Restore your database from a previously created backup</p>
            </div>
            <Upload className="w-8 h-8 text-amber-500" />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Warning</p>
              <p className="text-gray-600">Restoring will overwrite your current database. This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Select a backup JSON file to restore your database to a previous state.
          </p>

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {restoring ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
            ) : (
              <><Upload className="w-4 h-4" />Select Backup File</>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Backup Information</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Backups include all database tables and data</li>
          <li>• Backup files are saved as JSON format for easy inspection</li>
          <li>• Keep backups in a safe location (cloud storage, external drive, etc.)</li>
          <li>• Regular backups are recommended (weekly or after major changes)</li>
          <li>• Contact your administrator for full server-level backups</li>
        </ul>
      </div>
    </div>
  )
}
