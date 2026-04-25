import EditPageClient from './EditPageClient'

export async function generateStaticParams() {
  return [{ id: 'new' }]
}

export default function EditPage({ params }: { params: { id: string } }) {
  return <EditPageClient id={params.id} />
}
