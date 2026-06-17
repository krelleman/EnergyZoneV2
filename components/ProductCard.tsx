// components/ProductCard.tsx
import Image from 'next/image'

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
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.thumbnail || 'https://picsum.photos/seed/1/400/300'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.brand}</p>
          </div>
          <span className="text-sm font-bold text-orange-500">
            {product.company_score}/6 ⭐
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {product.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-200 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="font-bold text-lg">{product.price_dkk} kr</span>
          <span className="text-xs text-gray-400">{product.size_ml} ml</span>
        </div>
      </div>
    </div>
  )
}