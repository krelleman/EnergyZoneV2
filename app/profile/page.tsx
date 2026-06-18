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
    .select('*')
    .eq('id', user.id)
    .single() as { data: User | null }

  return profile
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

async function getFridgeProducts(productIds: number[]) {
  if (productIds.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
  return (data || []) as Product[]
}

function getHeroGradient(level: number): string {
  if (level <= 2) return 'from-[#B87333] via-[#CD7F32] to-[#B87333]'
  if (level <= 4) return 'from-[#C0C0C0] via-[#FFD700] to-[#C0C0C0]'
  if (level <= 6) return 'from-[#A0E6DE] via-[#00FFFF] to-[#A0E6DE]'
  if (level <= 8) return 'from-[#9932CC] via-[#D1001C] to-[#9932CC]'
  return 'from-[#FF4500] via-[#1E0F35] to-[#FF4500]'
}

export default async function ProfilePage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/?login=true')

  const reviews = await getReviews()
  const productIds = reviews?.map((r: Review) => r.product_id) || []
  const fridgeProducts = await getFridgeProducts(productIds)

  const avgScore = reviews.length > 0
    ? (reviews.reduce((acc: number, r: Review) => acc + r.score, 0) / reviews.length).toFixed(1)
    : '0'

  const levelInfo = getLevel(profile.points)
  const rankClass = levelInfo.rankClass.replace('rank-', '')
  const gradientClass = `rank-gradient-${rankClass}`

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
        <div className={`relative rounded-b-3xl overflow-hidden mb-12 h-48 md:h-64 ${gradientClass}`}>
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
            <p className="text-2xl font-bold text-white">0</p>
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
          <p className="text-[#a0a0b8] text-center py-8">Ønskelisten er tom. Tilføj produkter du vil prøve!</p>
        </section>

        {/* Favoritter */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Mine favoritter</h2>
          {fridgeProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {fridgeProducts.slice(0, 3).map((p: Product, index: number) => (
                <div key={p.id} className="relative">
                  <ProductCard product={p} />
                  <div className="absolute top-2 left-2 text-lg">
                    {['🥇', '🥈', '🥉'][index]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a0a0b8] text-center py-8">Ingen favoritter endnu</p>
          )}
        </section>

        {/* Venner */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Venner</h2>
          <p className="text-[#a0a0b8] text-center py-8">Ingen venner endnu. Inviter venner til EnergyZone!</p>
        </section>

        {/* Aktivitet */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Seneste aktivitet</h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review: Review) => (
                <div key={review.id} className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] flex justify-between">
                  <div>
                    <span className="text-amber-500">{'⭐'.repeat(review.score)}</span>
                    <span className="text-[#a0a0b8] text-sm ml-2">Anmeldelse skrevet</span>
                  </div>
                  <span className="text-xs text-[#a0a0b8]">{new Date(review.created_at).toLocaleDateString('da-DK')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a0a0b8] text-center py-8">Ingen aktivitet endnu. Lav din første anmeldelse!</p>
          )}
        </section>

        {/* Badges */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Badges</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {['🥇', '🥈', '🥉'].map((badge: string) => (
              <div key={badge} className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] text-center">
                <span className="text-2xl block mb-1">{badge}</span>
                <span className="text-xs text-[#a0a0b8]">T unlocked</span>
              </div>
            ))}
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