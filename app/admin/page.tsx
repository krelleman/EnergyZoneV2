// app/admin/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ColorTagDetector from '@/components/ColorTagDetector'

interface Product {
  name: string
  brand: string
  description: string
  price_dkk: number
  company_score: number
  container_type: string
  tags: string[]
  thumbnail: string
  size_ml: number
}

export default function AdminPage() {
  const [product, setProduct] = useState<Product>({
    name: '',
    brand: '',
    description: '',
    price_dkk: 0,
    company_score: 0,
    container_type: '',
    tags: [],
    thumbnail: '',
    size_ml: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('products').insert([product])
    if (error) {
      alert('Fejl: ' + error.message)
    } else {
      alert('Produkt oprettet!')
      setProduct({
        name: '', brand: '', description: '', price_dkk: 0,
        company_score: 0, container_type: '', tags: [],
        thumbnail: '', size_ml: 0,
      })
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Admin: Opret produkt</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text" placeholder="Navn" value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="w-full px-4 py-2 rounded-full border" required
        />
        <input
          type="text" placeholder="Brand" value={product.brand}
          onChange={(e) => setProduct({ ...product, brand: e.target.value })}
          className="w-full px-4 py-2 rounded-full border" required
        />
        <input
          type="url" placeholder="Billede URL" value={product.thumbnail}
          onChange={(e) => setProduct({ ...product, thumbnail: e.target.value })}
          className="w-full px-4 py-2 rounded-full border"
        />
        
        <ColorTagDetector onColorTagsDetected={(colors) => {
          setProduct(prev => ({ ...prev, tags: [...prev.tags, ...colors] }))
        }} />
        
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map(t => (
              <span key={t} className="px-2 py-1 bg-gray-100 rounded-full text-xs">#{t}</span>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-full font-bold"
        >
          Opret produkt
        </button>
      </form>
    </main>
  )
}