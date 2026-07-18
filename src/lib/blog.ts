// Blog data layer — one Firestore collection (`blog_posts`) feeding BOTH the
// admin CMS and the public /blog pages, so a post published in the admin is
// live on the site (and on localhost) the moment it saves. Comments live in
// `blog_comments`, written by visitors (pending) and moderated in the admin.
//
// Public pages must dynamic-import this module inside an effect so the
// Firebase SDK stays out of the initial public bundle (spec §19).

import {
  collection, doc, query, where, orderBy, getDoc, getDocs, addDoc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

export type PostStatus = 'draft' | 'published'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  author: string
  status: PostStatus
  categories: string[]
  tags: string[]
  comments_enabled: boolean
  meta_title?: string
  meta_description?: string
  published_at: Timestamp | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface BlogComment {
  id: string
  post_slug: string
  name: string
  email?: string
  content: string
  status: 'pending' | 'approved' | 'spam'
  created_at: Timestamp
}

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

export const tsToIso = (t?: Timestamp | null): string | null => (t ? t.toDate().toISOString() : null)

/* ── Public reads (rules allow only status == 'published') ───────────── */

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const q = query(
    collection(getDb(), 'blog_posts'),
    where('status', '==', 'published'),
    orderBy('published_at', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }))
}

export async function fetchPublishedPost(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(getDb(), 'blog_posts'),
    where('slug', '==', slug),
    where('status', '==', 'published'),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }
}

/* ── Comments ────────────────────────────────────────────────────────── */

export async function fetchApprovedComments(slug: string): Promise<BlogComment[]> {
  const q = query(
    collection(getDb(), 'blog_comments'),
    where('post_slug', '==', slug),
    where('status', '==', 'approved'),
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<BlogComment, 'id'>) }))
    .sort((a, b) => (a.created_at?.toMillis() ?? 0) - (b.created_at?.toMillis() ?? 0))
}

/** Visitor-submitted; lands as `pending` and only shows once approved. */
export async function submitComment(slug: string, name: string, email: string, content: string): Promise<void> {
  await addDoc(collection(getDb(), 'blog_comments'), {
    post_slug: slug,
    name: name.trim().slice(0, 80),
    ...(email.trim() && { email: email.trim().slice(0, 254) }),
    content: content.trim().slice(0, 3000),
    status: 'pending',
    created_at: serverTimestamp(),
  })
}

/* ── Admin helpers ───────────────────────────────────────────────────── */

export async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const snap = await getDocs(query(collection(getDb(), 'blog_posts'), where('slug', '==', slug)))
  return snap.docs.some((d) => d.id !== excludeId)
}

export async function fetchPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(getDb(), 'blog_posts', id))
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<BlogPost, 'id'>) }) : null
}
