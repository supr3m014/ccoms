import EditPostClient from './EditPostClient'

export async function generateStaticParams() { return [{ id: 'new' }] }

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <EditPostClient id={params.id} />
}
