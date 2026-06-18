// app/product/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import ProductActionsClient from '@/components/ProductActionsClient'
import ReviewForm from '@/components/ReviewForm'

interface PageProps {
  params: {
    id: string
  }
}

interface Product {
  id: number
  name: string
  brand: string
  sub_brand?: string
  price_dkk: number
  company_score: number
  thumbnail: string
  tags: string[]
  size_ml: number
  caffeine_per_liter_mg?: number
  caffeine_per_piece_mg?: number
  description?: string
  total_score?: number
}

interface Store {
  id: number
  product_id: number
  store_name: string
  price_dkk: number
  last_seen_date: string
}

interface Review {
  id: number
  user_id: string
  username?: string
  display_name?: string
  score: number
  comment?: string
  created_at: string
}

export default async function ProductPage({ params }: PageProps) {
  const supabase = await createClient()
  const { id } = await params
  const productId = parseInt(id)

  // Hent produkt
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single() as { data: Product | null }

  if (!product) {
    notFound()
  }

  // Hent anmeldelser for produktet
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false }) as { data: Review[] | null }

  // Hent relaterede produkter (samme brand)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('brand', product.brand)
    .neq('id', productId)
    .limit(4) as { data: Product[] | null }

  // Hent butikker
  const { data: stores } = await supabase
    .from('product_stores')
    .select('*')
    .eq('product_id', productId)
    .order('price_dkk', { ascending: true }) as { data: Store[] | null }

  // Beregn gennemsnitlig bruger-score
  const avgUserScore = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length
    : 0

  // Stjerner
  const renderStars = (score: number) => {
    const full = Math.round(score)
    const empty = 6 - full
    return '⭐'.repeat(Math.max(0, full)) + '☆'.repeat(Math.max(0, empty))
  }

  // Total score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Fremragende', color: 'bg-green-500' }
    if (score >= 60) return { label: 'God', color: 'bg-amber-500' }
    if (score >= 40) return { label: 'Okay', color: 'bg-orange-500' }
    return { label: 'Skuffende', color: 'bg-red-500' }
  }

  const totalScore = product.total_score || 0
  const scoreInfo = getScoreLabel(totalScore)

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Tilbage knap */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-6">
        ← Tilbage til produkter
      </Link>

      {/* Produkt grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Venstre: Billede */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain w-full h-full p-8"
            />
          ) : (
            <span className="text-8xl">⚡</span>
          )}

          {/* Samlet score badge */}
          <div className="absolute top-4 right-4 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            {Math.round(totalScore)}% Samlet
          </div>
        </div>

        {/* Højre: Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">{product.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{product.name}</h1>
            {product.sub_brand && (
              <p className="text-sm text-primary">{product.sub_brand}</p>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Scorer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-400">Firmaets score</p>
              <p className="text-2xl font-bold text-gray-800">{product.company_score}/6</p>
              <p className="text-sm text-amber-500">{renderStars(product.company_score)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-400">Bruger-score</p>
              <p className="text-2xl font-bold text-gray-800">{avgUserScore > 0 ? avgUserScore.toFixed(1) : 'Ingen'}/6</p>
              {avgUserScore > 0 ? (
                <p className="text-sm text-amber-500">{renderStars(avgUserScore)}</p>
              ) : (
                <p className="text-sm text-gray-500">Ingen anmeldelser endnu</p>
              )}
            </div>
          </div>

          {/* Samlet score progress bar */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Samlet score</span>
              <span className="text-lg font-bold text-gray-800">{Math.round(totalScore)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreInfo.color}`}
                style={{ width: `${Math.min(totalScore, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{scoreInfo.label}</p>
          </div>

          {/* Pris og detaljer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-400">Pris</p>
              <p className="text-2xl font-bold text-primary">{product.price_dkk} kr</p>
              <p className="text-sm text-gray-400">{product.size_ml} ml</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-400">Pris pr. liter</p>
              <p className="text-2xl font-bold text-gray-800">
                {(product.price_dkk / (product.size_ml / 1000)).toFixed(2)} kr
              </p>
            </div>
          </div>

          {/* Koffein */}
          {product.caffeine_per_liter_mg && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-400">Koffein pr. liter</p>
                <p className="text-xl font-bold text-gray-800">{product.caffeine_per_liter_mg} mg</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-400">Koffein pr. styk</p>
                <p className="text-xl font-bold text-gray-800">{product.caffeine_per_piece_mg || '-'} mg</p>
              </div>
            </div>
          )}

          {/* Beskrivelse */}
          {product.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Knapper */}
          <ProductActionsClient productId={product.id} productName={product.name} />

          {/* Find i butik */}
          {stores && stores.length > 0 && (
            <section className="mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Find i butik</h3>
              <div className="space-y-2">
                {stores.map((store: Store) => (
                  <div key={store.id} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{store.store_name}</p>
                      <p className="text-sm text-gray-400">{new Date(store.last_seen_date).toLocaleDateString('da-DK')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">{store.price_dkk} kr</span>
                      {store.price_dkk === Math.min(...stores.map(s => s.price_dkk)) && (
                        <span className="block text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Billigst!</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Anmeldelser */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Anmeldelser</h2>

        {/* Skriv anmeldelse */}
        <ReviewForm productId={product.id} />

        {/* Vis anmeldelser */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{review.display_name || review.username || 'Anonym'}</p>
                    <p className="text-amber-500">{'⭐'.repeat(review.score)}</p>
                    {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
                  </div>
                  <p className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString('da-DK')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Ingen anmeldelser endnu. Vær den første!</p>
        )}
      </section>

      {/* Relaterede produkter */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Relaterede produkter</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}