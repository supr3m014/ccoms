// PHP Bridge Client - Replaces Supabase for Hostinger MySQL
// Provides a Supabase-compatible interface for the PHP API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yourdomain.com/api-bridge.php'

// HTTP helper functions (module-level)
const _get = async (url: string) => {
  try {
    const response = await fetch(url, { credentials: 'include' })
    const data = await response.json()
    return { data: data.data ?? data, count: data.count, error: data.error || null }
  } catch (error) {
    return { data: null, error }
  }
}

const _post = async (url: string, payload: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    const data = await response.json()
    return { data, error: data.error || null }
  } catch (error) {
    return { data: null, error }
  }
}

const _put = async (url: string, payload: any) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    const data = await response.json()
    return { data, error: data.error || null }
  } catch (error) {
    return { data: null, error }
  }
}

const _delete = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'DELETE', credentials: 'include' })
    const data = await response.json()
    return { data, error: data.error || null }
  } catch (error) {
    return { data: null, error }
  }
}

// QueryBuilder class - new instance for each from() call to avoid state mutation
// Implements PromiseLike so it can be awaited while still supporting method chaining
class QueryBuilder implements PromiseLike<any> {
  private table: string
  private filters: Record<string, any> = {}
  private orderColumn: string = ''
  private orderDirection: string = 'ASC'
  private limitCount: number = 0
  private needsCount: boolean = false
  private selectedColumns: string = '*'
  private _pendingOp: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select'
  private _pendingData: any = null
  private _pendingUpsertOptions: any = null

  constructor(table: string) {
    this.table = table
  }

  // Method chaining for queries
  select = (columns?: string, options?: any): QueryBuilder => {
    this.selectedColumns = columns || '*'
    if (options?.count === 'exact') this.needsCount = true
    if (options?.head) this.limitCount = 1
    return this
  }

  eq = (column: string, value: any): QueryBuilder => {
    this.filters[`eq_${column}`] = value
    return this
  }

  neq = (column: string, value: any): QueryBuilder => {
    this.filters['neq'] = column
    this.filters['neq_value'] = value
    return this
  }

  ilike = (column: string, value: any): QueryBuilder => {
    this.filters[`ilike_${column}`] = value
    return this
  }

  in = (column: string, values: any[]): QueryBuilder => {
    this.filters[`in_${column}`] = values
    return this
  }

  order = (column: string, options?: { ascending?: boolean }): QueryBuilder => {
    this.orderColumn = column
    this.orderDirection = options?.ascending === false ? 'DESC' : 'ASC'
    return this
  }

  limit = (count: number): QueryBuilder => {
    this.limitCount = count
    return this
  }

  // Execution methods
  single = async (): Promise<any> => {
    const result = await this._execute()
    if (result.error) return { data: null, error: result.error }
    const rows = result.data || []
    if (rows.length === 0) {
      return { data: null, error: { message: 'No rows found', code: 'PGRST116' } }
    }
    return { data: rows[0], error: null }
  }

  maybeSingle = async (): Promise<any> => {
    const result = await this._execute()
    if (result.error) return { data: null, error: result.error }
    const rows = result.data || []
    return { data: rows?.[0] || null, error: null }
  }

  // Insert method (returns builder for chaining, executes on await)
  insert = (data: any[] | any): QueryBuilder => {
    this._pendingOp = 'insert'
    this._pendingData = data
    return this
  }

  // Update method (returns builder for chaining, executes on await)
  update = (data: any): QueryBuilder => {
    this._pendingOp = 'update'
    this._pendingData = data
    return this
  }

  // Upsert method
  upsert = (data: any, options?: { onConflict?: string }): QueryBuilder => {
    this._pendingOp = 'upsert'
    this._pendingData = data
    this._pendingUpsertOptions = options
    return this
  }

  // Delete method (returns builder for chaining, executes on await)
  delete = (): QueryBuilder => {
    this._pendingOp = 'delete'
    return this
  }

  // PromiseLike implementation - makes the builder awaitable while supporting chaining
  then = (resolve?: ((value: any) => any) | null, reject?: ((reason?: any) => any) | null): Promise<any> => {
    let promise: Promise<any>

    switch (this._pendingOp) {
      case 'insert': {
        const data = this._pendingData
        if (Array.isArray(data)) {
          if (data.length === 0) {
            promise = Promise.resolve({ data: null, error: null })
          } else if (data.length === 1) {
            promise = _post(`${API_BASE_URL}?table=${this.table}`, data[0])
          } else {
            // Bulk: sequential inserts
            promise = (async () => {
              let lastResult: any = { data: null, error: null }
              for (const item of data) {
                lastResult = await _post(`${API_BASE_URL}?table=${this.table}`, item)
                if (lastResult.error) return lastResult
              }
              return lastResult
            })()
          }
        } else {
          promise = _post(`${API_BASE_URL}?table=${this.table}`, data)
        }
        break
      }
      case 'update': {
        const params = this._buildParams()
        promise = _put(`${API_BASE_URL}?table=${this.table}&${params.toString()}`, this._pendingData)
        break
      }
      case 'upsert': {
        const onConflict = this._pendingUpsertOptions?.onConflict || 'id'
        promise = _post(
          `${API_BASE_URL}?table=${this.table}&upsert=1&on_conflict=${onConflict}`,
          this._pendingData
        )
        break
      }
      case 'delete': {
        const params = this._buildParams()
        promise = _delete(`${API_BASE_URL}?table=${this.table}&${params.toString()}`)
        break
      }
      default:
        promise = this._execute()
    }

    return promise.then(resolve, reject)
  }

  // catch method for PromiseLike
  catch = (onrejected?: ((reason: any) => any) | null): Promise<any> => {
    let promise: Promise<any>

    switch (this._pendingOp) {
      case 'insert': {
        const data = this._pendingData
        if (Array.isArray(data)) {
          if (data.length === 0) {
            promise = Promise.resolve({ data: null, error: null })
          } else if (data.length === 1) {
            promise = _post(`${API_BASE_URL}?table=${this.table}`, data[0])
          } else {
            promise = (async () => {
              let lastResult: any = { data: null, error: null }
              for (const item of data) {
                lastResult = await _post(`${API_BASE_URL}?table=${this.table}`, item)
                if (lastResult.error) return lastResult
              }
              return lastResult
            })()
          }
        } else {
          promise = _post(`${API_BASE_URL}?table=${this.table}`, data)
        }
        break
      }
      case 'update': {
        const params = this._buildParams()
        promise = _put(`${API_BASE_URL}?table=${this.table}&${params.toString()}`, this._pendingData)
        break
      }
      case 'upsert': {
        const onConflict = this._pendingUpsertOptions?.onConflict || 'id'
        promise = _post(
          `${API_BASE_URL}?table=${this.table}&upsert=1&on_conflict=${onConflict}`,
          this._pendingData
        )
        break
      }
      case 'delete': {
        const params = this._buildParams()
        promise = _delete(`${API_BASE_URL}?table=${this.table}&${params.toString()}`)
        break
      }
      default:
        promise = this._execute()
    }

    return promise.catch(onrejected)
  }

  // Private helper methods
  private _buildParams = (): URLSearchParams => {
    const params = new URLSearchParams()
    if (this.needsCount) params.append('count', 'true')

    for (const [key, value] of Object.entries(this.filters)) {
      if (key.startsWith('eq_')) {
        const col = key.replace('eq_', '')
        params.append(`eq[${col}]`, value as string)
      } else if (key.startsWith('ilike_')) {
        const col = key.replace('ilike_', '')
        params.append(`ilike[${col}]`, value as string)
      } else if (key.startsWith('in_')) {
        const col = key.replace('in_', '')
        const vals = value as any[]
        vals.forEach(v => params.append(`in[${col}][]`, v))
      } else {
        params.append(key, value as string)
      }
    }

    if (this.orderColumn) {
      params.append('order', this.orderColumn)
      params.append('order_dir', this.orderDirection)
    }
    if (this.limitCount) params.append('limit', this.limitCount.toString())

    return params
  }

  private _execute = async (): Promise<any> => {
    const params = this._buildParams()
    params.append('table', this.table)
    return _get(`${API_BASE_URL}?${params.toString()}`)
  }
}

// Main PhpBridge class
class PhpBridge {
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return _post(`${API_BASE_URL}?action=sign-in`, credentials)
    },

    signOut: async () => {
      return _post(`${API_BASE_URL}?action=sign-out`, {})
    },

    getSession: async () => {
      const response = await fetch(`${API_BASE_URL}?action=session`, { credentials: 'include' })
      const data = await response.json()
      // Normalize: return { data: { session: ... } }
      const session = data.user ? { user: data.user } : null
      return { data: { session } }
    },

    signUp: async (params: { email: string; password: string; options?: any }) => {
      return _post(`${API_BASE_URL}?action=sign-up`, params)
    },

    onAuthStateChange: (callback: any) => {
      // Immediately call once with current session to simulate Supabase behavior
      fetch(`${API_BASE_URL}?action=session`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const session = data.user ? { user: data.user } : null
          callback('INITIAL_SESSION', session)
        })
        .catch(() => callback('INITIAL_SESSION', null))
      return { data: { subscription: { unsubscribe: () => {} } } }
    },

    admin: {
      listUsers: async () => {
        const data = await _get(`${API_BASE_URL}?action=list-users`)
        return { data: { users: data.data?.users || [] }, error: data.error }
      },

      deleteUser: async (userId: string | number) => {
        return _post(`${API_BASE_URL}?action=delete-user`, { id: userId })
      },
    },
  }

  // from() returns a new QueryBuilder instance (no singleton state mutation)
  from = (table: string): QueryBuilder => {
    return new QueryBuilder(table)
  }
}

export const phpBridge = new PhpBridge()
