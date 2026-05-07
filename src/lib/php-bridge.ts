const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ccoms.ph/api-bridge.php'

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

  single = async (): Promise<any> => {
    const result = await this._execute()
    if (result.error) return { data: null, error: result.error }
    const rows = result.data || []
    if (rows.length === 0) return { data: null, error: { message: 'No rows found', code: 'PGRST116' } }
    return { data: rows[0], error: null }
  }

  maybeSingle = async (): Promise<any> => {
    const result = await this._execute()
    if (result.error) return { data: null, error: result.error }
    const rows = result.data || []
    return { data: rows?.[0] || null, error: null }
  }

  insert = (data: any[] | any): QueryBuilder => {
    this._pendingOp = 'insert'
    this._pendingData = data
    return this
  }

  update = (data: any): QueryBuilder => {
    this._pendingOp = 'update'
    this._pendingData = data
    return this
  }

  upsert = (data: any, options?: { onConflict?: string }): QueryBuilder => {
    this._pendingOp = 'upsert'
    this._pendingData = data
    this._pendingUpsertOptions = options
    return this
  }

  delete = (): QueryBuilder => {
    this._pendingOp = 'delete'
    return this
  }

  then = (resolve?: ((value: any) => any) | null, reject?: ((reason?: any) => any) | null): Promise<any> => {
    return this._run().then(resolve, reject)
  }

  catch = (onrejected?: ((reason: any) => any) | null): Promise<any> => {
    return this._run().catch(onrejected)
  }

  private _run = (): Promise<any> => {
    switch (this._pendingOp) {
      case 'insert': {
        const data = this._pendingData
        if (Array.isArray(data)) {
          if (data.length === 0) return Promise.resolve({ data: null, error: null })
          if (data.length === 1) return _post(`${API_BASE_URL}?table=${this.table}`, data[0])
          return (async () => {
            let last: any = { data: null, error: null }
            for (const item of data) {
              last = await _post(`${API_BASE_URL}?table=${this.table}`, item)
              if (last.error) return last
            }
            return last
          })()
        }
        return _post(`${API_BASE_URL}?table=${this.table}`, data)
      }
      case 'update': {
        const params = this._buildParams()
        return _put(`${API_BASE_URL}?table=${this.table}&${params.toString()}`, this._pendingData)
      }
      case 'upsert': {
        const onConflict = this._pendingUpsertOptions?.onConflict || 'id'
        return _post(`${API_BASE_URL}?table=${this.table}&upsert=1&on_conflict=${onConflict}`, this._pendingData)
      }
      case 'delete': {
        const params = this._buildParams()
        return _delete(`${API_BASE_URL}?table=${this.table}&${params.toString()}`)
      }
      default:
        return this._execute()
    }
  }

  private _buildParams = (): URLSearchParams => {
    const params = new URLSearchParams()
    if (this.needsCount) params.append('count', 'true')
    for (const [key, value] of Object.entries(this.filters)) {
      if (key.startsWith('eq_')) {
        params.append(`eq[${key.replace('eq_', '')}]`, value as string)
      } else if (key.startsWith('ilike_')) {
        params.append(`ilike[${key.replace('ilike_', '')}]`, value as string)
      } else if (key.startsWith('in_')) {
        const col = key.replace('in_', '')
        ;(value as any[]).forEach(v => params.append(`in[${col}][]`, v))
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

class PhpBridge {
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }) =>
      _post(`${API_BASE_URL}?action=sign-in`, credentials),

    signOut: async () => _post(`${API_BASE_URL}?action=sign-out`, {}),

    getSession: async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        const response = await fetch(`${API_BASE_URL}?action=session`, {
          credentials: 'include',
          signal: controller.signal,
        })
        clearTimeout(timeout)
        const data = await response.json()
        const session = data.user ? { user: data.user } : null
        return { data: { session } }
      } catch {
        return { data: { session: null } }
      }
    },

    signUp: async (params: { email: string; password: string; options?: any }) =>
      _post(`${API_BASE_URL}?action=sign-up`, params),

    onAuthStateChange: (callback: any) => {
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
      deleteUser: async (userId: string | number) =>
        _post(`${API_BASE_URL}?action=delete-user`, { id: userId }),
    },
  }

  from = (table: string): QueryBuilder => new QueryBuilder(table)
}

export const phpBridge = new PhpBridge()
