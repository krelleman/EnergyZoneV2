// components/LeaderboardSnippet.tsx
import { createClient } from '@/utils/supabase/server'

interface LeaderboardUser {
  id: string
  display_name: string
  points: number
  level: number
}

async function getLeaderboard() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('id, display_name, points, level')
    .order('points', { ascending: false })
    .limit(3)
  return data || [] as LeaderboardUser[]
}

export default async function LeaderboardSnippet() {
  const topUsers = await getLeaderboard()

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Top 3 bedømmere
          <span className="block w-16 h-1 bg-primary mx-auto mt-2 rounded"></span>
        </h2>

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 ${
                  index < topUsers.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    'bg-amber-600 text-amber-100'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{user.display_name || 'Anonym'}</p>
                    <span className="text-xs text-gray-400">Level {user.level}</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">{user.points} pts</span>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-gray-400">Ingen data endnu</p>
          )}
        </div>
      </div>
    </section>
  )
}