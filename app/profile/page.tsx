// app/profile/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import { getLevel, getLevelEmoji } from '@/lib/levels'

interface UserProfile {
  id: string
  display_name?: string
  email: string
  points: number
  level: number
}

interface Review {
  id: number
  product_id: number
  score: number
  comment?: string
  created_at: string
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
  total_score?: number
}

async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single() as { data: UserProfile | null }

  // Get user reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as { data: Review[] | null }

  // Get unique brands tried
  const { data: brandsData } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('user_id', user.id)
  
  let uniqueBrands = 0
  if (brandsData && brandsData.length > 0) {
    const productIds = brandsData.map(r => r.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('brand')
      .in('id', productIds)
    const brands = [...new Set(products?.map(p => p.brand) || [])]
    uniqueBrands = brands.length
  }

  // Get fridge (products user has drunk)
  const fridgeProducts = await getProductsByIds(
    reviews?.map(r => r.product_id) || []
  )

  return {
    profile: profile || { id: user.id, email: user.email || '', points: 0, level: 0 },
    reviews: reviews || [],
    brandsTried: uniqueBrands,
    fridgeProducts
  }
}

async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)
  return data || []
}

async function getFriends(userId: string) {
  const supabase = await createClient()
  // Assuming a friends table exists
  const { data } = await supabase
    .from('friendships')
    .select('friend_id, status')
    .eq('user_id', userId)
    .eq('status', 'accepted')
  return data || []
}

export default async function ProfilePage() {
  const userData = await getUserProfile()

  if (!userData) {
    redirect('/?login=true')
  }

  const { profile, reviews, brandsTried, fridgeProducts } = userData
  const levelInfo = getLevel(profile.points)
  const nextLevel = profile.level < 10 ? getLevel((getLevel(profile.points + 1).points.split('-')[1] || '9999')) : null
  const progressToNext = profile.level >= 10 
    ? 100 
    : Math.min(100, (profile.points % 10) * (profile.level === 0 ? 100 : 10))

  // Get user's favorite products (top 3 by user score)
  const favoriteProducts = fridgeProducts.slice(0, 3)

  // Get top 3 global users for leaderboard teaser
  const supabase = await createClient()
  const { data: globalTop } = await supabase
    .from('users')
    .select('id, display_name, points, level')
    .order('points', { ascending: false })
    .limit(3)

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profil header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4">
          <span className="text-4xl">{getLevelEmoji(profile.level)}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{profile.display_name || profile.email?.split('@')[0]}</h1>
        <p className="text-gray-400">{profile.email}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">
            {levelInfo.title}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${levelInfo.rankClass}`}>
            Rank: {levelInfo.rank}
          </span>
        </div>
      </div>

      {/* Point & Level progress */}
      <div className="bg-gray-50 rounded-xl p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Point</span>
          <span className="text-lg font-bold text-primary">{profile.points} pts</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
        {profile.level < 10 && (
          <p className="text-xs text-gray-400 mt-1">
            {nextLevel ? `${nextLevel.points} for at nå næste level` : ''}
          </p>
        )}
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
          <p className="text-sm text-gray-400">Anmeldelser</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length).toFixed(1) : '0'}
          </p>
          <p className="text-sm text-gray-400">Gennemsnit</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{brandsTried}</p>
          <p className="text-sm text-gray-400">Brands smagt</p>
        </div>
      </div>

      {/* Køleskab */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Køleskab</h2>
        {fridgeProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fridgeProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Ingen produkter i køleskabet endnu. Drik nogle!</p>
        )}
      </section>

      {/* Ønskeliste - placeholder */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ønskeliste</h2>
        <p className="text-gray-400 text-center py-8">Ønskelisten er tom. Tilføj produkter du vil prøve!</p>
      </section>

      {/* Personlige favoritter */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mine favoritter</h2>
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favoriteProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Ingen favoritter endnu</p>
        )}
      </section>

      {/* Leaderboard teaser */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Global Top 3</h2>
        <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-4">
          {globalTop && globalTop.length > 0 ? (
            globalTop.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 ${
                  index < (globalTop?.length || 0) - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getLevelEmoji(user.level)}</span>
                  <p className="font-bold text-gray-800">{user.display_name || 'Anonym'}</p>
                </div>
                <span className="text-primary font-bold">{user.points} pts</span>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-400">Ingen data endnu</p>
          )}
        </div>
      </section>

      {/* Venner - placeholder */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Venner</h2>
        <p className="text-gray-400 text-center py-8">Ingen venner endnu. Inviter venner til EnergyZone!</p>
      </section>

      {/* Seneste aktivitet */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Seneste aktivitet</h2>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">
                    {fridgeProducts.find(p => p.id === review.product_id)?.name || 'Ukendt produkt'}
                  </span>
                  <span className="text-amber-500">{'⭐'.repeat(review.score)}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('da-DK')}
                </p>
                {review.comment && (
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Ingen aktivitet endnu. Lav din første anmeldelse!</p>
        )}
      </section>
    </main>
  )
}