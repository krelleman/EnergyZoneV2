// app/admin/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
  created_at: string
}

interface User {
  id: string
  email: string
  display_name?: string
  points: number
  level: number
  is_admin?: boolean
}

interface Review {
  id: number
  user_id: string
  product_id: number
  score: number
  comment?: string
  created_at: string
  products?: { name: string; brand: string; thumbnail: string }
}

async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return profile?.is_admin === true
}

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return data || [] as Product[]
}

async function getUsers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)
  return data || [] as User[]
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
    .limit(50)
  return data || [] as Review[]
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/')
  }

  const products = await getProducts()
  const users = await getUsers()
  const reviews = await getReviews()

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>

      {/* Produkthåndtering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Produkter</h2>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400">{products.length} produkter</p>
            <Link href="/admin/products/new" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary/90">
              + Nyt produkt
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left pb-2">Navn</th>
                  <th className="text-left pb-2">Brand</th>
                  <th className="text-left pb-2">Pris</th>
                  <th className="text-left pb-2">Score</th>
                  <th className="text-left pb-2">Oprettet</th>
                  <th className="pb-2">Handling</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: Product) => (
                  <tr key={p.id} className="border-b border-gray-700/50 last:border-0">
                    <td className="py-2 text-white">{p.name}</td>
                    <td className="py-2 text-gray-400">{p.brand}</td>
                    <td className="py-2 text-primary">{p.price_dkk} kr</td>
                    <td className="py-2 text-amber-500">{p.company_score}/6</td>
                    <td className="py-2 text-gray-400">{new Date(p.created_at).toLocaleDateString('da-DK')}</td>
                    <td className="py-2 text-center">
                      <Link href={`/admin/products/${p.id}`} className="text-primary text-xs">Rediger</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Brugerhåndtering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Brugere</h2>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left pb-2">Navn</th>
                  <th className="text-left pb-2">Email</th>
                  <th className="text-left pb-2">Point</th>
                  <th className="text-left pb-2">Level</th>
                  <th className="pb-2">Handling</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-700/50 last:border-0">
                    <td className="py-2 text-white">{u.display_name || u.email?.split('@')[0]}</td>
                    <td className="py-2 text-gray-400">{u.email}</td>
                    <td className="py-2 text-primary">{u.points}</td>
                    <td className="py-2 text-gray-400">{u.level}</td>
                    <td className="py-2">
                      <button className="text-primary text-xs mr-2">+5 pts</button>
                      <button className="text-red-400 text-xs">Slet</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Anmeldelseshåndtering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Anmeldelser</h2>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="flex items-start justify-between bg-gray-900/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-bold">{r.products?.name || 'Ukendt produkt'}</p>
                    <p className="text-amber-500 text-sm">{'⭐'.repeat(r.score)}</p>
                    {r.comment && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{r.comment}</p>}
                    <p className="text-gray-500 text-[10px] mt-1">{new Date(r.created_at).toLocaleDateString('da-DK')}</p>
                  </div>
                  <button className="text-red-400 text-xs">Slet</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Ingen anmeldelser</p>
          )}
        </div>
      </section>

      {/* Butiksstyring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Tilføj butik</h2>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <form action={`/api/stores`} method="POST" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="product_id" className="bg-gray-900 text-white px-4 py-2 rounded-full" required>
              <option value="">Vælg produkt</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input name="store_name" type="text" placeholder="Butiksnavn" className="bg-gray-900 text-white px-4 py-2 rounded-full" required />
            <input name="price_dkk" type="number" placeholder="Pris" className="bg-gray-900 text-white px-4 py-2 rounded-full" required />
            <input name="last_seen_date" type="date" className="bg-gray-900 text-white px-4 py-2 rounded-full" required />
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full font-bold md:col-span-3">
              Tilføj butik
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}