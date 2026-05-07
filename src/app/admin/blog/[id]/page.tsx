import React from 'react'
import PageContent from './PageContent'

export const dynamicParams = false
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'new' }]
}

export default function AdminBlogEditPage(): React.ReactElement {
  return React.createElement(PageContent)
}
