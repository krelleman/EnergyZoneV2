'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/context/ToastContext'
import { addToFridge, addToWishlist } from '@/lib/actions'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  brand: string
  sub_brand?: string
  price_dkk: number
  price_min_dkk?: number
  price_max_dkk?: number
  price_avg_dkk?: number
  company_score: number
  thumbnail: string
  tags: string[]
  size_ml: number
  total_score?: number
}

export default function ProductCard({ product }: { product: Product }) {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stars = '⭐'.repeat(Math.round(product.company_score || 0))
  const emptyStars = '☆'.repeat(6 - Math.round(product.company_score || 0))
  const totalScore = product.total_score || 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-amber-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col border border-gray-100">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">⚡</div>
          )}
          {/* Score badge */}
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.company_score}/6
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{product.brand}</p>
              {product.sub_brand && (
                <p className="text-xs text-amber-600 font-medium">{product.sub_brand}</p>
              )}
              <h3 className="font-bold text-base text-gray-800 line-clamp-2">{product.name}</h3>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{product.size_ml} ml</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm text-amber-500">{stars}</span>
            <span className="text-sm text-gray-300">{emptyStars}</span>
            <span className="text-xs text-gray-400 ml-1">({product.company_score})</span>
          </div>

          {/* Total Score Progress */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-full max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getScoreColor(totalScore)}`}
                style={{ width: `${Math.min(totalScore, 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary">{Math.round(totalScore)}%</span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Price + Buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              {product.price_min_dkk && product.price_max_dkk ? (
                <div>
                  <span className="text-sm font-bold text-primary">
                    {product.price_min_dkk} - {product.price_max_dkk} kr
                  </span>
                  {product.price_avg_dkk && (
                    <p className="text-xs text-gray-400">
                      (ca. {product.price_avg_dkk.toFixed(2)} kr)
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xl font-bold text-primary">{product.price_dkk} kr</span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  showToast(`⏳ Tilføjer ${product.name}...`, 'info', '⏳')
                  setIsSubmitting(true)
                  try {
                    const result = await addToFridge(product.id)
                    if (result.alreadyExists) {
                      showToast(`✅ ${product.name} er allerede i køleskabet!`, 'success', '✅')
                    } else {
                      showToast(`✅ ${product.name} tilføjet til køleskabet!`, 'success', '🧊')
                    }
                  } catch (err) {
                    showToast(`Der opstod en fejl`, 'error', '❌')
                  }
                  setIsSubmitting(false)
                }}
                disabled={isSubmitting}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Tilføjer...' : '🍺 Køleskab'}
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  showToast(`⏳ Tilføjer til ønskelisten...`, 'info', '⏳')
                  setIsSubmitting(true)
                  try {
                    const result = await addToWishlist(product.id)
                    if (result.alreadyExists) {
                      showToast(`💝 ${product.name} er allerede på ønskelisten!`, 'info', '💝')
                    } else {
                      showToast(`💝 ${product.name} tilføjet til ønskelisten!`, 'info', '❤️')
                    }
                  } catch (err) {
                    showToast(`Der opstod en fejl`, 'error', '❌')
                  }
                  setIsSubmitting(false)
                }}
                disabled={isSubmitting}
                className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                ❤️ Ønskeliste
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}