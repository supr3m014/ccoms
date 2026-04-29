import ClientDetailClient from './ClientDetailClient'

export async function generateStaticParams() { return [{ id: 'new' }] }

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return <ClientDetailClient id={params.id} />
}
