'use client'

import { Database, Server, HardDrive, Cpu } from 'lucide-react'

export default function SystemPage() {
  const systemInfo = {
    version: '1.0.0',
    framework: 'Next.js 14',
    database: 'Supabase (PostgreSQL)',
    nodeVersion: process.version || 'N/A',
    environment: process.env.NODE_ENV || 'development'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Information</h1>
        <p className="text-gray-600">View system and environment details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Application</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium text-gray-900">{systemInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Framework:</span>
              <span className="font-medium text-gray-900">{systemInfo.framework}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium text-gray-900">{systemInfo.environment}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Database</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">{systemInfo.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Connected
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Runtime</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Node.js:</span>
              <span className="font-medium text-gray-900">{systemInfo.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium text-gray-900">Web</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cache</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">System Health</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-800">All systems operational</span>
        </div>
      </div>
    </div>
  )
}
