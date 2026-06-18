import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getLevel } from '@/lib/levels'
import LeaderboardTabs from '@/components/LeaderboardTabs'

interface LeaderboardUser {
  id: string
  display_name?: string
  total_points: number
  level: number
}

interface Friend {
  id: string
  display_name?: string
  total_points: number
}

async function getFriends(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('friends')
    .eq('id', userId)
    .single()

  const friendIds = profile?.friends || []
  if (friendIds.length === 0) return []

  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, total_points')
    .in('id', friendIds) as { data: Friend[] | null }

  return data || []
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, total_points, level')
    .order('total_points', { ascending: false })
    .limit(10) as { data: LeaderboardUser[] | null }

  const topUsers = users || []
  const friendUsers = user ? await getFriends(user.id) : []

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-[#e8e8f0] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Leaderboard</h1>

        {topUsers.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-4 mb-12">
              {topUsers[0] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-2 bg-amber-400">🥇</div>
                  <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] w-32 text-center">
                    <p className="font-bold text-white truncate">{topUsers[0].display_name || 'Ukendt'}</p>
                    <p className="text-sm text-primary">{topUsers[0].total_points || 0} point</p>
                    <p className="text-xs text-[#a0a0b8]">{getLevel(topUsers[0].total_points || 0).emoji} {getLevel(topUsers[0].total_points || 0).title}</p>
                  </div>
                </div>
              )}
              {topUsers[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-2 bg-gray-300">🥈</div>
                  <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] w-32 text-center">
                    <p className="font-bold text-white truncate">{topUsers[1].display_name || 'Ukendt'}</p>
                    <p className="text-sm text-primary">{topUsers[1].total_points || 0} point</p>
                    <p className="text-xs text-[#a0a0b8]">{getLevel(topUsers[1].total_points || 0).emoji} {getLevel(topUsers[1].total_points || 0).title}</p>
                  </div>
                </div>
              )}
              {topUsers[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-2 bg-orange-400">🥉</div>
                  <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] w-32 text-center">
                    <p className="font-bold text-white truncate">{topUsers[2].display_name || 'Ukendt'}</p>
                    <p className="text-sm text-primary">{topUsers[2].total_points || 0} point</p>
                    <p className="text-xs text-[#a0a0b8]">{getLevel(topUsers[2].total_points || 0).emoji} {getLevel(topUsers[2].total_points || 0).title}</p>
                  </div>
                </div>
              )}
            </div>

{/* Række 4-10 */}
             <LeaderboardTabs 
               globalUsers={topUsers.slice(3)} 
               friendUsers={friendUsers} 
             />
          </>
        ) : (
          <p className="text-[#a0a0b8] text-center py-12">Ingen brugere fundet endnu.</p>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Tilbage til forsiden
          </Link>
        </div>
      </div>
    </main>
  )
}