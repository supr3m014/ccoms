'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Briefcase, Users, Mail, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  blogPosts: number
  caseStudies: number
  teamMembers: number
  contactSubmissions: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogPosts: 0,
    caseStudies: 0,
    teamMembers: 0,
    contactSubmissions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [blogRes, casesRes, teamRes, contactRes] = await Promise.all([
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
          supabase.from('case_studies').select('id', { count: 'exact', head: true }),
          supabase.from('team_members').select('id', { count: 'exact', head: true }),
          supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        ])

        setStats({
          blogPosts: blogRes.count || 0,
          caseStudies: casesRes.count || 0,
          teamMembers: teamRes.count || 0,
          contactSubmissions: contactRes.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Blog Posts',
      value: stats.blogPosts,
      icon: FileText,
      color: 'from-blue-600 to-cyan-600',
      href: '/admin/blog',
    },
    {
      name: 'Case Studies',
      value: stats.caseStudies,
      icon: Briefcase,
      color: 'from-purple-600 to-pink-600',
      href: '/admin/case-studies',
    },
    {
      name: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'from-green-600 to-emerald-600',
      href: '/admin/team',
    },
    {
      name: 'Contact Submissions',
      value: stats.contactSubmissions,
      icon: Mail,
      color: 'from-orange-600 to-red-600',
      href: '/admin/contacts',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your CMS admin panel</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.name}
                href={card.href}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/blog/new"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <p className="font-semibold text-blue-900">Create New Blog Post</p>
              <p className="text-sm text-blue-700">Write and publish a new article</p>
            </Link>
            <Link
              href="/admin/case-studies/new"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <p className="font-semibold text-purple-900">Add Case Study</p>
              <p className="text-sm text-purple-700">Showcase a new client success story</p>
            </Link>
            <Link
              href="/admin/team/new"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <p className="font-semibold text-green-900">Add Team Member</p>
              <p className="text-sm text-green-700">Add a new team member profile</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Content</p>
                <p className="text-sm text-gray-600">Create and edit blog posts, case studies, and team profiles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Submissions</p>
                <p className="text-sm text-gray-600">Check contact form submissions from potential clients</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Configure Settings</p>
                <p className="text-sm text-gray-600">Update site settings and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
