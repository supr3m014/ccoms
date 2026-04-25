import EditBlogClient from './EditBlogClient'

export async function generateStaticParams() {
  return [{ id: 'new' }]
}

export default function EditBlogPost() {
  return <EditBlogClient />
}
