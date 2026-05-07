import PageContent from './PageContent'

export const dynamicParams = false
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'new' }]
}

export default function AdminPageEditPage({ params }: { params: { id: string } }) {
  return <PageContent params={params} />
}
