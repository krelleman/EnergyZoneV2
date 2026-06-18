'use client'

import { useRouter } from 'next/navigation'
import { removeFromWishlist, removeFromFavorites } from '@/lib/actions'

interface RemoveButtonProps {
  productId: number
  type: 'wishlist' | 'fridge'
}

export default function RemoveButton({ productId, type }: RemoveButtonProps) {
  const router = useRouter()

  const handleRemove = async () => {
    if (type === 'wishlist') {
      await removeFromWishlist(productId)
    } else {
      await removeFromFavorites(productId)
    }
    router.refresh()
  }

  return (
    <button
      onClick={handleRemove}
      className="text-red-400 hover:text-red-300 text-xs ml-2"
      title={`Fjern fra ${type === 'wishlist' ? 'ønskelisten' : 'køleskab'}`}
    >
      ✕
    </button>
  )
}