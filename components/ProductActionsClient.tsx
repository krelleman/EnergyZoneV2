'use client'

import { useToast } from '@/context/ToastContext'
import { addToFridge, addToWishlist } from '@/lib/actions'
import { useState } from 'react'

interface ProductActionsClientProps {
  productId: number
  productName: string
}

export default function ProductActionsClient({ productId, productName }: ProductActionsClientProps) {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log('🔧 ProductActionsClient render - showToast type:', typeof showToast)

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={async () => {
          console.log('🍺 1. Klik registreret på produktside')
          console.log('🍺 2. showToast type:', typeof showToast)
          setIsSubmitting(true)
          const result = await addToFridge(productId)
          console.log('🍺 3. Resultat fra addToFridge:', result)
          if (result.alreadyExists) {
            showToast(`${productName} er allerede i køleskabet!`, 'warning', '⚠️')
          } else {
            showToast(`${productName} tilføjet til køleskabet!`, 'success', '🧊')
          }
          setIsSubmitting(false)
        }}
        disabled={isSubmitting}
        className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-bold transition-colors disabled:opacity-50"
      >
        🍺 Jeg har drukket den
      </button>
      <button
        onClick={async () => {
          console.log('❤️ 1. Klik registreret på produktside')
          setIsSubmitting(true)
          const result = await addToWishlist(productId)
          if (result.alreadyExists) {
            showToast(`${productName} er allerede i ønskelisten!`, 'warning', '⚠️')
          } else {
            showToast(`${productName} tilføjet til ønskelisten!`, 'info', '❤️')
          }
          setIsSubmitting(false)
        }}
        disabled={isSubmitting}
        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold transition-colors disabled:opacity-50"
      >
        ❤️ Ønskeliste
      </button>
    </div>
  )
}