// components/NewProducts.tsx
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
  created_at: string
}

async function getNewProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)
  return data || [] as Product[]
}

async function getAllTags() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('tags')
  
  // Aggregate tags by frequency
  const tagCounts: Record<string, number> = {}
  data?.forEach(product => {
    if (product.tags) {
      product.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  
  return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }))
}

export default async function NewProducts() {
  const products = await getNewProducts()
  const tags = await getAllTags()

  // Size based on frequency (min 12px, max 24px)
  const max = Math.max(...tags.map(t => t.count), 1)
  const min = 12
  const maxFs = 24

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Nyeste produkter
          <span className="block w-16 h-1 bg-primary mx-auto mt-2 rounded"></span>
        </h2>

        {/* New Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="block">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900">
                  <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                    NYT
                  </span>
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🥤</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 uppercase">{product.brand}</p>
                  <h3 className="font-bold text-base text-gray-800 line-clamp-2">{product.name}</h3>
                  <span className="mt-auto text-lg font-bold text-primary">{product.price_dkk} kr</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tag Cloud */}
        <div>
          <h3 className="text-xl font-bold text-center mb-4">Populære smagskategorier</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map(({ tag, count }) => {
              const fontSize = min + (count / max) * (maxFs - min)
              return (
                <Link
                  key={tag}
                  href={`/?filter=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  #{tag} ({count})
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}