import PageContent from './PageContent'

export const dynamicParams = false
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'new' }]
}

export default function Page() {
  return <PageContent />
}
