/**
 * Admin user management. Firebase Auth accounts can only be listed/created/
 * deleted with the Admin SDK, so the admin panel's Users pages call this
 * function. Caller must present a valid ID token carrying admin: true.
 *
 * POST adminUsers  { op, ...args }
 *   op: 'list'                          → { users: [...] }
 *   op: 'create'  { email, password, displayName?, admin? }
 *   op: 'setAdmin'    { uid, admin }    — cannot demote yourself
 *   op: 'setDisabled' { uid, disabled } — cannot disable yourself
 *   op: 'delete'      { uid }           — cannot delete yourself
 *   op: 'resetLink'   { email }         → { link } password-reset URL
 */

import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type UserRecord } from 'firebase-admin/auth'

if (!getApps().length) initializeApp()

const REGION = 'asia-southeast1'

const ALLOWED_ORIGINS = [
  'https://ccoms.ph',
  'https://www.ccoms.ph',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
]

const publicUser = (u: UserRecord) => ({
  uid: u.uid,
  email: u.email ?? '',
  displayName: u.displayName ?? '',
  admin: u.customClaims?.admin === true,
  disabled: u.disabled,
  created: u.metadata.creationTime,
  lastSignIn: u.metadata.lastSignInTime ?? null,
  providers: u.providerData.map((p) => p.providerId),
})

export const adminUsers = onRequest(
  { region: REGION, cors: ALLOWED_ORIGINS, maxInstances: 5 },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, message: 'Method not allowed.' })
      return
    }

    const authHeader = String(req.headers.authorization || '')
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    let callerUid = ''
    try {
      const decoded = await getAuth().verifyIdToken(idToken)
      if (decoded.admin !== true) throw new Error('not admin')
      callerUid = decoded.uid
    } catch {
      res.status(403).json({ success: false, message: 'Not authorized.' })
      return
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const op = String(body.op || '')
    const auth = getAuth()

    try {
      switch (op) {
        case 'list': {
          const users: ReturnType<typeof publicUser>[] = []
          let pageToken: string | undefined
          do {
            const page = await auth.listUsers(1000, pageToken)
            users.push(...page.users.map(publicUser))
            pageToken = page.pageToken
          } while (pageToken)
          res.json({ success: true, users })
          return
        }

        case 'create': {
          const email = String(body.email || '').trim().toLowerCase()
          const password = String(body.password || '')
          const displayName = String(body.displayName || '').trim()
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || password.length < 8) {
            res.status(400).json({ success: false, message: 'A valid email and a password of at least 8 characters are required.' })
            return
          }
          const user = await auth.createUser({ email, password, ...(displayName && { displayName }) })
          if (body.admin === true) await auth.setCustomUserClaims(user.uid, { admin: true })
          logger.info('admin created user', { by: callerUid, uid: user.uid })
          res.json({ success: true, user: publicUser(await auth.getUser(user.uid)) })
          return
        }

        case 'setAdmin': {
          const uid = String(body.uid || '')
          if (uid === callerUid && body.admin !== true) {
            res.status(400).json({ success: false, message: 'You cannot remove your own admin access.' })
            return
          }
          await auth.setCustomUserClaims(uid, { admin: body.admin === true })
          res.json({ success: true })
          return
        }

        case 'setDisabled': {
          const uid = String(body.uid || '')
          if (uid === callerUid) {
            res.status(400).json({ success: false, message: 'You cannot disable your own account.' })
            return
          }
          await auth.updateUser(uid, { disabled: body.disabled === true })
          res.json({ success: true })
          return
        }

        case 'delete': {
          const uid = String(body.uid || '')
          if (uid === callerUid) {
            res.status(400).json({ success: false, message: 'You cannot delete your own account.' })
            return
          }
          await auth.deleteUser(uid)
          logger.info('admin deleted user', { by: callerUid, uid })
          res.json({ success: true })
          return
        }

        case 'resetLink': {
          const email = String(body.email || '').trim().toLowerCase()
          const link = await auth.generatePasswordResetLink(email)
          res.json({ success: true, link })
          return
        }

        default:
          res.status(400).json({ success: false, message: 'Unknown operation.' })
      }
    } catch (err) {
      logger.error('adminUsers failed', { op, error: (err as Error).message })
      const msg = (err as { code?: string }).code === 'auth/email-already-exists'
        ? 'That email already has an account.'
        : 'The operation failed. Please try again.'
      res.status(500).json({ success: false, message: msg })
    }
  },
)
