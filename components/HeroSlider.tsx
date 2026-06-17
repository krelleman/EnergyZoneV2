'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface Product {
  id: number
  name: string
  brand: string
  description: string
  company_score: number
  thumbnail: string
  container_type?: string
  total_score?: number
  badge?: string
  badgeType?: string
}

interface HeroSliderProps {
  products: Product[]
}

export default function HeroSlider({ products }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (products.length === 0) return

    const interval = setInterval(() => {
      goToSlide((currentIndex + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, products.length])

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + products.length) % products.length)
  }

  const goToNext = () => {
    goToSlide((currentIndex + 1) % products.length)
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <p className="text-white text-xl">Ingen produkter at vise</p>
      </div>
    )
  }

  const product = products[currentIndex]

  const renderStars = (score: number) => {
    const fullStars = Math.round(score)
    const emptyStars = 6 - fullStars
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars)
  }

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-primary/20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6">
              {product.badge && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  product.badgeType === 'popular' ? 'bg-red-500' : 
                  product.badgeType === 'cheap' ? 'bg-green-500' : 
                  product.badgeType === 'new' ? 'bg-blue-500' : 'bg-primary'
                } text-white`}>
                  {product.badge}
                </span>
              )}
              <span className="text-white/60 text-sm font-medium">{product.brand}</span>
              <span className="w-px h-4 bg-white/20"></span>
              <span className="text-amber-500 text-sm font-bold">
                {renderStars(product.company_score)}
              </span>
              <span className="text-white/60 text-sm">({product.company_score}/6)</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-gray-300 text-lg max-w-xl mx-auto lg:mx-0 mb-8">
              {product.description || 'En fantastisk energidrik der giver dig den perfekte boost.'}
            </p>

            <Link href={`/product/${product.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full">
                Se produkt →
              </Button>
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                ) : (
                  <div className="text-8xl md:text-9xl">🥤</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {products.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-2xl transition-all duration-300 flex items-center justify-center"
              aria-label="Forrige produkt"
            >
              ❮
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-2xl transition-all duration-300 flex items-center justify-center"
              aria-label="Næste produkt"
            >
              ❯
            </button>
          </>
        )}

        {products.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Gå til slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none"></div>
    </section>
  )
}