'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  emoji?: string
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', emoji?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning', emoji?: string) => {
    console.log('🔔 showToast kaldt med:', { message, type, emoji })
    const id = Date.now().toString()
    setToasts(prev => {
      console.log('🔔 setToasts, nye toasts:', [...prev, { id, message, type, emoji }])
      return [...prev, { id, message, type, emoji }]
    })
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const getBorderColor = (type: string) => {
    if (type === 'success') return '#10b981'
    if (type === 'error') return '#ef4444'
    if (type === 'warning') return '#f59e0b'
    return '#3b82f6'
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ position: 'fixed', top: '24px', right: '24px' }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`bg-[#1a1a2e] border-l-4 rounded-r-lg px-4 py-3 pr-8 shadow-lg pointer-events-auto animate-slide-in`}
            style={{
              borderLeftColor: getBorderColor(toast.type),
            }}
          >
            <div className="flex items-center gap-2">
              {toast.emoji && <span className="text-lg">{toast.emoji}</span>}
              <span className="text-sm text-white">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}