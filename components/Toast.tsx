'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  emoji?: string
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type = 'success', emoji = '✅', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Set visible to true MED DET SAMME
    setVisible(true)

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 500)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-blue-500',
    warning: 'border-yellow-500',
  }

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 max-w-sm w-full 
        bg-[#1a1a2e] border-l-4 ${colors[type]} 
        rounded-xl shadow-2xl p-4 flex items-center gap-3
        transition-all duration-500 ease-in-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">{message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onClose?.(), 500)
        }}
        className="text-gray-400 hover:text-white text-xl transition-colors"
      >
        ✕
      </button>
    </div>
  )
}