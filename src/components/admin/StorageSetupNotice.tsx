'use client'

// Shown by the Media pages until the Firebase Storage bucket exists. It's a
// one-time, two-click step that only the project owner can do in the console.

import { HardDrive, ExternalLink } from 'lucide-react'

export default function StorageSetupNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-2xl">
      <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
        <HardDrive className="w-5 h-5" /> One-time setup: turn on file storage
      </h3>
      <p className="text-sm text-amber-800 mb-3">
        File uploads need Firebase Storage, which has to be switched on once from the Firebase website. Here&apos;s exactly what to do:
      </p>
      <ol className="text-sm text-amber-800 space-y-1.5 list-decimal ml-5 mb-4">
        <li>Click the button below — it opens the Storage page of your Firebase project.</li>
        <li>Click the big <strong>“Get started”</strong> button.</li>
        <li>If it asks for a location, pick <strong>asia-southeast1 (Singapore)</strong>.</li>
        <li>Click <strong>Done</strong>, then come back here and refresh this page.</li>
      </ol>
      <a href="https://console.firebase.google.com/project/ccoms-production/storage" target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold text-sm">
        Open Firebase Storage <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  )
}
