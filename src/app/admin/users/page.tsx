'use client'

import { useState } from 'react'
import { Plus, UserCircle } from 'lucide-react'
import Link from 'next/link'

export default function AllUsersPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
        <p className="text-gray-600 mb-4">Connect this to Supabase Auth to manage users</p>
        <p className="text-sm text-gray-500">
          Users are managed through Supabase Authentication. Visit your Supabase dashboard to view and manage users.
        </p>
      </div>
    </div>
  )
}
