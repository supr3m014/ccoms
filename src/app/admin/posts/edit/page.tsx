'use client'

// Edit Post — the post ID travels as ?id= because a static export can't have
// dynamic /admin/posts/[id] routes.

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PostEditor from '@/components/admin/PostEditor'

function EditInner() {
  const params = useSearchParams()
  const [id, setId] = useState<string | null>(null)
  useEffect(() => { setId(params.get('id')) }, [params])
  if (id === null) return <div className="p-8 text-gray-500">Loading…</div>
  return <PostEditor postId={id} />
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading…</div>}>
      <EditInner />
    </Suspense>
  )
}
