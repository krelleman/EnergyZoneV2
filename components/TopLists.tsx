// components/TopLists.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  brand: string
  price_dkk: number
  company_score: number
  thumbnail: string
  tags: string[]
  size_ml: number
}

interface TopList {
  title: string
  products: Product[]
  emptyMessage: string
}

async function getTopProducts(): Promise<{ popular: Product[]; cheapest: Product[]; strawberry: Product[] }> {
  const supabase = await createClient()

  // 1. Mest populære (højeste total_score)
  const { data: popular } = await supabase
    .from('products')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(6)

  // 2. Billigste
  const { data: cheapest } = await supabase
    .from('products')
    .select('*')
    .order('price_dkk', { ascending: true })
    .limit(6)

  // 3. Lavest score (dårlige)
  const { data: lowScore } = await supabase
    .from('products')
    .select('*')
    .order('total_score', { ascending: true })
    .limit(6)

  return {
    popular: (popular || []) as Product[],
    cheapest: (cheapest || []) as Product[],
    strawberry: (lowScore || []) as Product[],
  }
}

function ProductMiniCard({ product, rank }: { product: Product; rank: number }) {
  const stars = '⭐'.repeat(Math.round(product.company_score || 0))
  const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-primary transition-all duration-200 h-full">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl">⚡</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
              {rankBadge && <span>{rankBadge}</span>}
            </div>
            <p className="text-gray-400 text-xs">{product.brand}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-primary font-bold text-sm">{product.price_dkk} kr</span>
              <span className="text-xs text-amber-500">{stars}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function TopLists() {
  const { popular, cheapest, strawberry } = await getTopProducts()

  const lists: TopList[] = [
    {
      title: '🔥 Mest populære',
      products: popular,
      emptyMessage: 'Ingen populære produkter endnu',
    },
    {
      title: '💰 Billigste',
      products: cheapest,
      emptyMessage: 'Ingen produkter fundet',
    },
    {
      title: '👎 Ikke lige vores smag',
      products: strawberry,
      emptyMessage: 'Ingen dårlige-produkter endnu',
    },
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Top anbefalinger
          <span className="block w-16 h-1 bg-primary mx-auto mt-2 rounded"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lists.map((list: TopList) => (
            <div key={list.title} className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">{list.title}</h3>
              <div className="space-y-2">
                {list.products.length > 0 ? (
                  list.products.slice(0, 6).map((product: Product, index: number) => (
                    <ProductMiniCard key={product.id} product={product} rank={index + 1} />
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">{list.emptyMessage}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}