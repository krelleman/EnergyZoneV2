// components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthModal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage(error.message)
      else {
        const modal = document.getElementById('auth-modal')
        if (modal) modal.style.display = 'none'
        window.location.reload()
      }
    } else {
      if (!username.trim()) {
        setMessage('⚠️ Du skal vælge et brugernavn')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username.trim(),
          },
        },
      })

      if (error) {
        setMessage(error.message)
      } else if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            display_name: username.trim(),
            points: 0,
            level: 0,
          })

        if (profileError) {
          console.error('Fejl ved oprettelse af profil:', profileError)
          setMessage('Bruger oprettet, men profilen kunne ikke gemmes.')
        } else {
          setMessage('✅ Bruger oprettet! Tjek din email for at bekræfte.')
        }
      }
    }
    setLoading(false)
  }

  return (
    <div
      id="auth-modal"
      className="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          ;(e.currentTarget as HTMLElement).style.display = 'none'
        }
      }}
    >
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={() => {
            const modal = document.getElementById('auth-modal')
            if (modal) modal.style.display = 'none'
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚡</div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Log ind' : 'Opret bruger'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Velkommen tilbage!' : 'Bliv en del af EnergyZone'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-400 block mb-1">Brugernavn</label>
              <input
                type="text"
                placeholder="Fx. EnergiFreak"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Kodeord</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? '⏳ Indlæser...' : isLogin ? '💪 Log ind' : '🚀 Opret bruger'}
          </button>
        </form>

        {message && (
          <p className={`text-center text-sm mt-3 ${
            message.includes('fejl') || message.includes('⚠️') ? 'text-red-400' : 'text-green-400'
          }`}>
            {message}
          </p>
        )}

        {/* Toggle login/register */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
              setUsername('')
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? '🆕 Har du ikke en bruger? Opret her' : '🔐 Har du allerede en konto? Log ind'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          🛡️ Sikker login – dine data er beskyttet
        </p>
      </div>
    </div>
  )
}