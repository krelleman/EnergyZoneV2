// app/page.tsx
import { createClient } from '@/utils/supabase/server'
import HeroSlider from '@/components/HeroSlider'
import TopLists from '@/components/TopLists'
import ReviewsSection from '@/components/ReviewsSection'
import LeaderboardSnippet from '@/components/LeaderboardSnippet'
import Footer from '@/components/Footer'
import ClientProducts from '@/components/ClientProducts'

export const dynamic = 'force-dynamic'

interface Product {
  id: number
  name: string
  brand: string
  description: string
  price_dkk: number
  company_score: number
  tags: string[]
  thumbnail: string
  size_ml: number
  caffeine_per_liter_mg?: number
  created_at: string
  total_score?: number
}

async function getHeroProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(1)
  const mostPopular = data?.[0]
  
  const supabase2 = await createClient()
  const { data: cheapest } = await supabase2
    .from('products')
    .select('*')
    .order('price_dkk', { ascending: true })
    .limit(1)
  
  const supabase3 = await createClient()
  const { data: newest } = await supabase3
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  
  return [
    mostPopular ? { ...mostPopular, badge: '🔥 Mest populær' as const, badgeType: 'popular' as const } : null,
    cheapest?.[0] ? { ...cheapest[0], badge: '💰 Billigst' as const, badgeType: 'cheap' as const } : null,
    newest?.[0] ? { ...newest[0], badge: '🆕 Ny' as const, badgeType: 'new' as const } : null,
  ].filter(Boolean) as Array<Product & { badge: string; badgeType: string }>
}

async function getAllProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data || [] as Product[]
}

export default async function Home() {
  const heroProducts = await getHeroProducts()
  const allProducts = await getAllProducts()

  return (
    <>
      <main>
        <HeroSlider products={heroProducts} />
        
        <TopLists />
        
        <ReviewsSection />
        
        <LeaderboardSnippet />
        
        <ClientProducts initialProducts={allProducts} />
      </main>
      
      <Footer />
    </>
  )
}