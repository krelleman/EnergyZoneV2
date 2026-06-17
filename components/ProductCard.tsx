// components/ProductCard.tsx
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface Product {
  id: number
  name: string
  brand: string
  container_type: string
  size_ml: number
  price_dkk: number
  description: string
  caffeine_per_liter_mg: number
  company_score: number
  tags: string[]
  thumbnail: string
}

export default function ProductCard({ product }: { product: Product }) {
  const renderStars = (score: number) => {
    const filled = Math.max(0, Math.min(6, Math.round(score || 0)))
    return '★'.repeat(filled) + '☆'.repeat(6 - filled)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            ⚡
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {product.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xl font-bold text-primary">{product.price_dkk} kr</span>
          <span className="text-xs text-gray-400">{product.size_ml} ml</span>
        </div>
        <div className="mt-2 text-amber-500 text-sm">
          {renderStars(product.company_score)} <span className="text-gray-500">/6</span>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="mt-3 rounded-full w-full"
        >
          Jeg har drukket denne
        </Button>
      </div>
    </div>
  )
}