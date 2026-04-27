'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ConfirmOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

interface ConfirmState extends ConfirmOptions {
  message: string
  resolve: (value: boolean) => void
}

interface ConfirmContextType {
  showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)

  const showConfirm = useCallback((message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ message, resolve, ...options })
    })
  }, [])

  const handleConfirm = () => {
    state?.resolve(true)
    setState(null)
  }

  const handleCancel = () => {
    state?.resolve(false)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {state.title || (state.destructive ? 'Confirm Delete' : 'Confirm Action')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{state.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                {state.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors text-sm ${
                  state.destructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {state.confirmText || (state.destructive ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider')
  return context
}
