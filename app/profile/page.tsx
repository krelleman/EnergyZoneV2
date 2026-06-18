// app/profile/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import ProfileAvatar from '@/components/ProfileAvatar'
import { getLevel, LEVELS } from '@/lib/levels'

interface Review {
  id: number
  user_id: string
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
  price_min_dkk?: number
  price_max_dkk?: number
  price_avg_dkk?: number
  company_score: number
  thumbnail: string
  tags: string[]
  size_ml: number
  total_score?: number
}

interface User {
  id: string
  email: string
  display_name?: string
  points: number
  level: number
}

async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, display_name, points, level, fridge, wishlist')
    .eq('id', user.id)
    .single() as { data: User | null }

  return profile
}

async function getFridgeProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('fridge')
    .eq('id', user.id)
    .single()

  const fridgeIds = profile?.fridge || []
  const productIds = Array.isArray(fridgeIds) ? fridgeIds.map((p: any) => Number(p)).filter((p: number) => !isNaN(p)) : []

  if (productIds.length === 0) return []

  const { data } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds) as { data: Product[] | null }

  return (data || []) as Product[]
}

async function getWishlistProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('wishlist')
    .eq('id', user.id)
    .single()

  const wishlistIds = profile?.wishlist || []
  const productIds = Array.isArray(wishlistIds) ? wishlistIds.map((p: any) => Number(p)).filter((p: number) => !isNaN(p)) : []

  if (productIds.length === 0) return []

  const { data } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds) as { data: Product[] | null }

  return (data || []) as Product[]
}

async function getReviews() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return data || [] as Review[]
}



interface ReviewWithScore extends Review {
  user_score?: number
}

async function getFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: reviews } = await supabase
    .from('reviews')
    .select('product_id, score')
    .eq('user_id', user.id)
    .order('score', { ascending: false })
    .limit(5) as { data: { product_id: number; score: number }[] | null }

  if (!reviews || reviews.length === 0) return []

  const productIds = reviews.map(r => r.product_id)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds) as { data: Product[] | null }

  return products?.map(p => ({ ...p, user_score: reviews.find(r => r.product_id === p.id)?.score })) || []
}

function getHeroGradient(level: number): string {
  const gradients: Record<number, string> = {
    0: 'from-gray-600 to-gray-800',
    1: 'from-amber-700 to-amber-500',
    2: 'from-orange-700 to-orange-500',
    3: 'from-yellow-600 to-yellow-400',
    4: 'from-amber-400 to-yellow-500',
    5: 'from-blue-400 to-cyan-300',
    6: 'from-cyan-400 to-blue-300',
    7: 'from-purple-600 to-purple-400',
    8: 'from-red-600 to-red-400',
    9: 'from-orange-500 to-red-500',
    10: 'from-purple-900 via-purple-600 to-pink-500',
  }
  return gradients[level] || 'from-gray-600 to-gray-800'
}

interface Badge {
  id: string
  name: string
  icon: string
  description?: string
  unlocked: boolean
}

function getBadges(userLevel: number, reviewCount: number): Badge[] {
  return [
    // Level badges
    { id: 'level-1', name: 'New Taster', icon: '🟫', unlocked: userLevel >= 1 },
    { id: 'level-2', name: 'Energy Recruit', icon: '🥉', unlocked: userLevel >= 2 },
    { id: 'level-3', name: 'Caffeine Knower', icon: '🥈', unlocked: userLevel >= 3 },
    { id: 'level-4', name: 'Turbo', icon: '🥇', unlocked: userLevel >= 4 },
    { id: 'level-5', name: 'Hyper', icon: '💎', unlocked: userLevel >= 5 },
    { id: 'level-6', name: 'Taste Expert', icon: '💠', unlocked: userLevel >= 6 },
    { id: 'level-7', name: 'Master', icon: '👑', unlocked: userLevel >= 7 },
    { id: 'level-8', name: 'Grandmaster', icon: '⭐', unlocked: userLevel >= 8 },
    { id: 'level-9', name: 'Champion', icon: '🏆', unlocked: userLevel >= 9 },
    { id: 'level-10', name: 'Legend', icon: '🌟', unlocked: userLevel >= 10 },
    // Activity badges
    { id: 'first-review', name: 'Første anmeld', icon: '🌟', unlocked: reviewCount >= 1 },
    { id: '10-reviews', name: '10 Anmeldelser', icon: '💪', unlocked: reviewCount >= 10 },
    { id: '50-reviews', name: '50 Anmeldelser', icon: '🏅', unlocked: reviewCount >= 50 },
    { id: 'streak-7', name: 'Streak 7', icon: '🔥', unlocked: false },
    { id: 'streak-30', name: 'Streak 30', icon: '⚡', unlocked: false },
    { id: 'strawberry', name: 'Jordbær-ekspert', icon: '🍓', unlocked: false },
    { id: 'invite-5', name: 'Inviter 5', icon: '🎯', unlocked: false },
    { id: 'fridge-10', name: '10 i køleskab', icon: '📦', unlocked: false },
    { id: 'group-founder', name: 'Gruppe-grundl.', icon: '🌐', unlocked: false },
  ]
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'lige nu'
  if (diffMins < 60) return `${diffMins} min siden`
  if (diffHours < 24) return `${diffHours} timer siden`
  if (diffDays < 7) return `${diffDays} dage siden`
  return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

export default async function ProfilePage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/?login=true')

  const reviews = await getReviews()
  const fridgeProducts = await getFridgeProducts()
  const wishlistProducts = await getWishlistProducts()
  const favorites = await getFavorites()

  const avgScore = reviews.length > 0
    ? (reviews.reduce((acc: number, r: Review) => acc + r.score, 0) / reviews.length).toFixed(1)
    : '0'

  const levelInfo = getLevel(profile.points)
  const heroGradient = getHeroGradient(levelInfo.level)
  const badges = getBadges(profile.level || 0, reviews.length)

  // Calculate next level
  const currentLevelIndex = LEVELS.findIndex(l => l.level === levelInfo.level)
  const nextLevelData = currentLevelIndex < LEVELS.length - 1
    ? LEVELS[currentLevelIndex + 1]
    : null
  const pointsToNextLevel = nextLevelData
    ? Math.max(0, parseInt(nextLevelData.points.split('-')[0]) - profile.points)
    : 0

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-[#e8e8f0] pb-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* HERO BANNER - Level gradient (Bite 11.1) */}
        <div className={`relative rounded-b-3xl overflow-hidden mb-12 h-48 md:h-64 bg-gradient-to-r ${heroGradient}`}>
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)]"></div>
          </div>
          <div className="relative h-full flex items-center px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
              <div className="relative -mb-8 md:-mb-12">
                <ProfileAvatar displayName={profile.display_name || 'Bruger'} level={profile.level || 0} size="lg" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-[#1a1a2e] flex items-center justify-center text-xs">
                  ✓
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {profile.display_name || profile.email?.split('@')[0]}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full font-bold text-xs">
                    {levelInfo.title}
                  </span>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${levelInfo.rankClass.replace('rank-', 'text-')} bg-white/10 backdrop-blur-md`}>
                    Rank: {levelInfo.rank}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <span className="text-white/80"><span className="text-primary font-bold">{profile.points}</span> point</span>
                  <span className="text-white/80"><span className="text-amber-400 font-bold">{reviews.length}</span> anmeldelser</span>
                  <span className="text-white/80">Gns. score: <span className="text-amber-400 font-bold">{avgScore}</span>/6</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2a2a3e] mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#a0a0b8]">Næste level: {nextLevelData?.title || 'Max'}</span>
            <span className="text-sm font-bold text-primary">{profile.points} / {nextLevelData ? nextLevelData.points.split('-')[0] : 'Max'} point</span>
          </div>
<div className="w-full h-2 bg-[#0f0f1a] rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${heroGradient} rounded-full transition-all`}
                style={{ width: `${nextLevelData ? 100 - (pointsToNextLevel / parseInt(nextLevelData.points.split('-')[0]) * 100) : 100}%` }}
              />
            </div>
          {nextLevelData && (
            <p className="text-xs text-[#a0a0b8] mt-2">
              {pointsToNextLevel} point til næste level ({nextLevelData.title})
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 text-center border border-[#2a2a3e]">
            <p className="text-2xl font-bold text-white">{fridgeProducts.length}</p>
            <p className="text-sm text-[#a0a0b8]">Køleskab</p>
          </div>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 text-center border border-[#2a2a3e]">
            <p className="text-2xl font-bold text-white">{wishlistProducts.length}</p>
            <p className="text-sm text-[#a0a0b8]">Ønskeliste</p>
          </div>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 text-center border border-[#2a2a3e]">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-[#a0a0b8]">Favorit brands</p>
          </div>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 text-center border border-[#2a2a3e]">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-[#a0a0b8]">Venner</p>
          </div>
        </div>

        {/* Køleskab */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Køleskab</h2>
          {fridgeProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {fridgeProducts.map((p: Product, index: number) => (
                <div key={p.id} className="group bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-3 border border-[#2a2a3e] hover:border-primary transition-all duration-200">
                  <div className="text-center">
                    <span className="text-xs mb-1 block">{index < 3 ? ['🥇', '🥈', '🥉'][index] : ''}</span>
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-xs text-amber-500 mt-1">{'⭐'.repeat(Math.round(p.company_score || 0))}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a0a0b8] text-center py-8">Ingen produkter i køleskabet endnu. Drik nogle!</p>
          )}
        </section>

        {/* Ønskeliste */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Ønskeliste</h2>
          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {wishlistProducts.map((p: Product, index: number) => (
                <a key={p.id} href={`/product/${p.id}`} className="block group">
                  <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-3 border border-[#2a2a3e] hover:border-primary transition-all duration-200">
                    <div className="text-center">
                      <span className="text-xs mb-1 block">{index < 3 ? ['🥇', '🥈', '🥉'][index] : ''}</span>
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <p className="text-xs text-amber-500 mt-1">{'⭐'.repeat(Math.round(p.company_score || 0))}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[#a0a0b8] text-center py-8">Ønskelisten er tom. Tilføj produkter du vil prøve!</p>
          )}
        </section>

        {/* Showcase - Favoritprodukter (Bite 11.3) */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Mine favoritter</h2>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {favorites.map((p: Product & { user_score?: number }, index: number) => (
                <a key={p.id} href={`/product/${p.id}`} className="block group">
                  <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-3 border border-[#2a2a3e] hover:border-primary transition-all duration-200 h-full flex flex-col">
                    <div className="relative h-32 mb-2 rounded-lg overflow-hidden bg-[#0f0f1a]">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">⚡</div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                    <p className="text-xs text-[#a0a0b8] truncate">{p.brand}</p>
                    <p className="text-xs text-amber-500 mt-1">{p.price_dkk} kr</p>
                    <div className="mt-2 pt-2 border-t border-[#2a2a3e]">
                      <span className="text-amber-500">{'⭐'.repeat(p.user_score || 0)}</span>
                      <span className="text-xs text-[#a0a0b8] ml-1">din score</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[#a0a0b8] text-center py-8">Du har ingen favoritter endnu. Anmeld nogle produkter for at få dem vist her!</p>
          )}
        </section>

        {/* Venner */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Venner</h2>
          <p className="text-[#a0a0b8] text-center py-8">Ingen venner endnu. Inviter venner til EnergyZone!</p>
        </section>

        {/* Activity feed timeline (Bite 11.5) */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Seneste aktivitet</h2>
          {reviews.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#2a2a3e]"></div>
              <div className="space-y-4">
                {reviews.slice(0, 10).map((review: Review, index: number) => {
                  const product = fridgeProducts.find((p: Product) => p.id === review.product_id)
                  const timeAgo = getTimeAgo(new Date(review.created_at))
                  return (
                    <div key={review.id} className="relative flex items-start gap-4">
                      <div className="absolute left-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center z-10">
                        <span className="text-white text-sm">⭐</span>
                      </div>
                      <div className="ml-12 bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">
                              Du anmeldte {product?.name || 'et produkt'}
                            </p>
                            <span className="text-amber-500 text-xs">{'⭐'.repeat(review.score)}</span>
                          </div>
                          <span className="text-xs text-[#a0a0b8]">{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-[#a0a0b8] text-center py-8">Du har ingen aktivitet endnu. Begynd at anmelde produkter!</p>
          )}
        </section>

        {/* Achievement grid (Bite 11.4) */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Badges</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {badges.map((badge: Badge) => {
              const isUnlocked = badge.unlocked
              return (
                <div key={badge.id} className={`bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-3 border transition-all duration-200 ${isUnlocked ? 'border-primary/50 hover:border-primary' : 'border-[#2a2a3e]/50 grayscale opacity-50'}`}>
                  <div className="text-center">
                    <span className="text-2xl block mb-1">{isUnlocked ? badge.icon : '🔒'}</span>
                    <span className="text-xs font-bold text-white block truncate">{badge.name}</span>
                    {!isUnlocked && badge.description && (
                      <span className="text-[10px] text-[#a0a0b8] block truncate">{badge.description}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Rediger profil */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Rediger profil</h2>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-6 border border-[#2a2a3e]">
            <form className="space-y-4 max-w-md">
              <div>
                <label className="text-sm text-[#a0a0b8] block mb-1">Brugernavn</label>
                <input
                  type="text"
                  defaultValue={profile.display_name || ''}
                  className="w-full bg-[#0f0f1a] text-white rounded-xl px-4 py-3 border border-[#2a2a3e] focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#a0a0b8] block mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={profile.email || ''}
                  disabled
                  className="w-full bg-[#0f0f1a]/50 text-[#a0a0b8] rounded-xl px-4 py-3 border border-[#2a2a3e] cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors"
              >
                Gem ændringer
              </button>
            </form>
          </div>
        </section>

      </div>
    </main>
  )
}