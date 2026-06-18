'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ReviewFormProps {
  productId: number
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedScore) return
    setIsSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSubmitting(false); return }

    // Check if user already reviewed this product
    const { count: existingReviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('user_id', user.id)

    const isFirstReview = (existingReviewCount || 0) === 0
    const pointsToAdd = isFirstReview ? 3 : 1

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: productId,
      score: selectedScore,
      comment: comment.trim() || null,
    })

    if (error) {
      console.error('Fejl ved anmeldelse:', error)
      alert('Kunne ikke gemme anmeldelse')
      setIsSubmitting(false)
      return
    }

    // Update points
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', user.id)
      .single()

    const newPoints = (profile?.total_points || 0) + pointsToAdd

    await supabase
      .from('profiles')
      .update({ total_points: newPoints })
      .eq('id', user.id)

    setSelectedScore(null)
    setComment('')
    window.location.reload()
  }

  return (
    <>
      {user ? (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Skriv en anmeldelse</h3>
          <p className="text-sm text-gray-400 mb-3">+1 point for hver anmeldelse</p>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Score (1-6)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedScore(s)}
                    className={`w-10 h-10 rounded-full transition-colors ${
                      selectedScore === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Kommentar (valgfri)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Skriv din kommentar..."
                className="w-full bg-white text-gray-800 rounded-xl p-3 border border-gray-200 focus:border-primary focus:outline-none min-h-[100px]"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedScore || isSubmitting}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sender...' : 'Send anmeldelse'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-6">
          <p className="text-gray-400">Log ind for at skrive en anmeldelse</p>
        </div>
      )}
    </>
  )
}