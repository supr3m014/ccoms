import PlaceholderPage from '@/components/admin/PlaceholderPage'

export const dynamicParams = false
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'new' }]
}

export default function EditPostPage() {
  return <PlaceholderPage title="Edit Post" description="Post editor coming soon" backLink="/admin/posts" />
}
