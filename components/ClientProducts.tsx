// components/ClientProducts.tsx
'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import ProductCard from '@/components/ProductCard'

interface Product {
  id: number
  name: string
  brand: string
  sub_brand?: string
  description: string
  price_dkk: number
  company_score: number
  container_type: string
  tags: string[]
  thumbnail: string
  size_ml: number
  caffeine_per_liter_mg: number
  created_at: string
  total_score?: number
}

interface ProductFilter {
  label: string
  value: string | null
}

interface ClientProductsProps {
  initialProducts: Product[]
}

export default function ClientProducts({ initialProducts }: ClientProductsProps) {
  const [products] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string | null>(null)
  const [sort, setSort] = useState('default')

  // Get unique sub_brands for filter
  const subBrands = useMemo(() => {
    const brands = new Set<string>()
    products.forEach((product: Product) => {
      if (product.sub_brand) brands.add(product.sub_brand)
    })
    return Array.from(brands).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Apply filter
    if (filter === 'dåse') {
      result = result.filter(p => p.container_type === 'Dåse')
    } else if (filter === 'flaske') {
      result = result.filter(p => p.container_type === 'Flaske')
    } else if (filter === 'glasflaske') {
      result = result.filter(p => p.container_type === 'Glasflaske')
    } else if (filter === 'jordbær') {
      result = result.filter(p => p.tags?.some(t => t.toLowerCase().includes('jordbær')))
    } else if (filter === 'sukkerfri') {
      result = result.filter(p => p.tags?.some(t => t.toLowerCase().includes('sukkerfri')))
    } else if (filter && filter.startsWith('sub:')) {
      const subBrand = filter.substring(4)
      result = result.filter(p => p.sub_brand === subBrand)
    }

    // Apply search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q)) ||
        (p.sub_brand && p.sub_brand.toLowerCase().includes(q))
      )
    }

    // Apply sort
    if (sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sort === 'price-asc') {
      result.sort((a, b) => a.price_dkk - b.price_dkk)
    } else if (sort === 'price-desc') {
      result.sort((a, b) => b.price_dkk - a.price_dkk)
    } else if (sort === 'rating') {
      result.sort((a, b) => b.company_score - a.company_score)
    } else if (sort === 'total-score') {
      result.sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    } else if (sort === 'caffeine') {
      result.sort((a, b) => (b.caffeine_per_liter_mg || 0) - (a.caffeine_per_liter_mg || 0))
    }

    return result
  }, [products, search, filter, sort])

  const FILTERS: ProductFilter[] = [
    { label: 'Alle', value: null },
    { label: 'Dåse', value: 'dåse' },
    { label: 'Flaske', value: 'flaske' },
    { label: 'Glasflaske', value: 'glasflaske' },
    { label: 'Jordbær', value: 'jordbær' },
    { label: 'Sukkerfri', value: 'sukkerfri' },
  ]

  return (
    <>
      <section className="sticky top-16 z-40 bg-white py-3 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {FILTERS.map((f: ProductFilter) => (
              <button
                key={f.label}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === f.value
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
            
            {subBrands.length > 0 && (
              <>
                <span className="w-full text-xs text-gray-400 my-1">Underkategorier:</span>
                {subBrands.map((brand: string) => (
                  <button
                    key={brand}
                    onClick={() => setFilter(`sub:${brand}`)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filter === `sub:${brand}`
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Input
              type="search"
              placeholder="Søg efter energidrikke, smag, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-full"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 rounded-full border border-gray-200 bg-white focus:border-primary focus:outline-none"
            >
              <option value="default">Sorter efter</option>
              <option value="name-asc">Navn (A-Z)</option>
              <option value="name-desc">Navn (Z-A)</option>
              <option value="price-asc">Pris (Lav-Høj)</option>
              <option value="price-desc">Pris (Høj-Lav)</option>
              <option value="rating">Bedst score</option>
              <option value="total-score">🏆 Samlet score</option>
              <option value="caffeine">Mest koffein</option>
            </select>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">🔥 Alle energidrikke</h2>
        
        {filteredProducts.length === 0 ? (
          <p className="text-gray-400">Ingen produkter fundet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}