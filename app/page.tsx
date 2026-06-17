// app/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'

async function Products() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(10)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fejl ved hentning af produkter:', error)
    return <p className="text-red-500">Kunne ikke hente produkter. Prøv igen senere.</p>
  }

  if (!products || products.length === 0) {
    return <p className="text-gray-400">Ingen produkter fundet i databasen.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">EnergyZone</h1>
      <p className="text-gray-500 mb-6">
        Opdag, bedøm og sammenlign energidrikke
      </p>

      <h2 className="text-2xl font-semibold mb-4">🔥 De nyeste energidrikke</h2>
      
      <Suspense fallback={<p className="text-gray-400">Indlæser produkter...</p>}>
        <Products />
      </Suspense>
    </main>
  )
}