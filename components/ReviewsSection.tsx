// components/ReviewsSection.tsx
import { createClient } from '@/utils/supabase/server'
import LevelTable from './LevelTable'
import Link from 'next/link'
import Image from 'next/image'

interface Review {
  id: number
  user_id: string
  username?: string
  level?: number
  score: number
  comment?: string
  created_at: string
  product_id?: number
  products?: { name: string; brand: string; thumbnail: string }
}

async function getReviews() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      products(name, brand, thumbnail)
    `)
    .order('created_at', { ascending: false })
    .limit(8)
  return data || [] as Review[]
}

export default async function ReviewsSection() {
  const reviews = await getReviews()

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Seneste anmeldelser
          <span className="block w-16 h-1 bg-primary mx-auto mt-2 rounded"></span>
        </h2>

        {/* Reviews Grid - 4 columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-primary transition-all duration-200 flex flex-col h-full">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gray-800 text-white flex items-center justify-center font-bold text-sm">
                    {review.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{review.username || 'Anonym'}</p>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Level {review.level || 1}
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="text-amber-500 mb-2 text-sm">
                  {'⭐'.repeat(Math.round(review.score || 0))}
                  {'☆'.repeat(6 - Math.round(review.score || 0))}
                </div>

                {/* Comment - max 2 lines */}
                {review.comment && (
                  <p className="text-gray-300 text-xs line-clamp-2 mb-3 flex-grow">{review.comment}</p>
                )}

                {/* Product link */}
                {review.products && (
                  <Link href={`/product/${review.product_id}`} className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-700">
                    <div className="relative w-8 h-8 rounded bg-gray-700 flex-shrink-0">
                      {review.products.thumbnail ? (
                        <Image
                          src={review.products.thumbnail}
                          alt={review.products.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs flex items-center justify-center h-full">⚡</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs truncate">{review.products.name}</span>
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8 col-span-full">Ingen anmeldelser endnu</p>
          )}
        </div>

        {/* Level Table */}
        <LevelTable />
      </div>
    </section>
  )
}