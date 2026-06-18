'use client'

import { useToast } from '@/context/ToastContext'

interface ProductActionsClientProps {
  productName: string
}

export default function ProductActionsClient({ productName }: ProductActionsClientProps) {
  const { showToast } = useToast()

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => showToast(`${productName} tilføjet til køleskabet!`, 'success', '🧊')}
        className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-bold transition-colors"
      >
        🍺 Jeg har drukket den
      </button>
      <button
        onClick={() => showToast(`${productName} tilføjet til ønskelisten!`, 'info', '❤️')}
        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold transition-colors"
      >
        ❤️ Ønskeliste
      </button>
    </div>
  )
}