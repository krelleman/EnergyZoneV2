// components/Header.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Header() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <header className="bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-primary">
          EnergyZone
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-white hover:text-primary transition-colors text-sm font-medium">
            Top 3
          </Link>
          <Link href="/alle-produkter" className="text-white hover:text-primary transition-colors text-sm font-medium">
            Alle Produkter
          </Link>
          <Link href="/leaderboard" className="text-white hover:text-primary transition-colors text-sm font-medium">
            Leaderboard
          </Link>
          <Link href="/admin" className="text-white hover:text-primary transition-colors text-sm font-medium">
            Admin
          </Link>
          <Link href="/profile" className="text-white hover:text-primary transition-colors text-sm font-medium">
            Min Profil
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-medium">
                {user.email?.split('@')[0] || 'Bruger'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
              >
                Log Ud
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const modal = document.getElementById('auth-modal')
                if (modal) modal.style.display = 'flex'
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
            >
              Login
            </button>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white text-2xl"
          aria-label="Menu"
        >
          ☰
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 border-t border-white/10 py-4 px-4 flex flex-col gap-3">
          <Link href="/" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Top 3
          </Link>
          <Link href="/alle-produkter" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Alle Produkter
          </Link>
          <Link href="/leaderboard" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Leaderboard
          </Link>
          <Link href="/admin" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Admin
          </Link>
          <Link href="/profile" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Min Profil
          </Link>
          {user ? (
            <>
              <span className="text-white text-sm">{user.email?.split('@')[0] || 'Bruger'}</span>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false) }}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors text-left"
              >
                Log Ud
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                const modal = document.getElementById('auth-modal')
                if (modal) modal.style.display = 'flex'
                setIsMenuOpen(false)
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors text-left"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  )
}