import { Construction } from 'lucide-react'
import Link from 'next/link'

interface PlaceholderPageProps {
  title: string
  description: string
  backLink?: string
  backLabel?: string
}

export default function PlaceholderPage({
  title,
  description,
  backLink = '/admin',
  backLabel = 'Back to Dashboard'
}: PlaceholderPageProps) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          <Link
            href={backLink}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
