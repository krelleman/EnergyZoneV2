'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  emoji?: string
  exiting?: boolean
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
    // Start fade-out 0.5 sekunder før fjernelse
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    }, 3500)
    // Fjern efter totalt 4 sekunder
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out forwards;
      }
      .animate-fade-out {
        animation: fadeOut 0.5s ease-out forwards;
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

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
            className={`bg-[#1a1a2e] border-l-4 rounded-r-lg px-4 py-3 pr-8 shadow-lg pointer-events-auto ${toast.exiting ? 'animate-fade-out' : 'animate-slide-in'}`}
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