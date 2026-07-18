// Media library — files live in Firebase Storage under media/, and each file
// has a Firestore doc in `media` (fast to list/search, and deletable even if
// the object is already gone). Admin-only by rules.

import {
  collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, type UploadTask } from 'firebase/storage'
import { getDb, getStorageClient } from '@/lib/firebase'

export interface MediaItem {
  id: string
  filename: string
  path: string
  url: string
  contentType: string
  size: number
  created_at: Timestamp
}

export const isImage = (m: { contentType?: string }) => (m.contentType || '').startsWith('image/')

export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1)
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${units[i]}`
}

/** True when the error means the Storage bucket was never initialized. */
export const isBucketMissing = (err: unknown): boolean => {
  const code = (err as { code?: string })?.code || ''
  const msg = String((err as Error)?.message || '')
  return code === 'storage/unknown' || code === 'storage/retry-limit-exceeded' ||
    code === 'storage/bucket-not-found' || msg.includes('404')
}

export async function listMedia(): Promise<MediaItem[]> {
  const snap = await getDocs(query(collection(getDb(), 'media'), orderBy('created_at', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaItem, 'id'>) }))
}

/** Starts a resumable upload; resolves with the created doc when finished. */
export function uploadMedia(
  file: File,
  onProgress: (pct: number) => void,
): { task: UploadTask; done: Promise<MediaItem> } {
  const clean = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `media/${Date.now()}-${clean}`
  const task = uploadBytesResumable(ref(getStorageClient(), path), file, { contentType: file.type })

  const done = new Promise<MediaItem>((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          const docData = {
            filename: file.name,
            path,
            url,
            contentType: file.type || 'application/octet-stream',
            size: file.size,
            created_at: serverTimestamp(),
          }
          const refDoc = await addDoc(collection(getDb(), 'media'), docData)
          resolve({ id: refDoc.id, ...docData, created_at: Timestamp.now() })
        } catch (err) { reject(err) }
      },
    )
  })
  return { task, done }
}

export async function deleteMedia(item: MediaItem): Promise<void> {
  try { await deleteObject(ref(getStorageClient(), item.path)) }
  catch { /* object may already be gone — still remove the doc */ }
  await deleteDoc(doc(getDb(), 'media', item.id))
}
