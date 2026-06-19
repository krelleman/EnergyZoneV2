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
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2. plads */}
              {topUsers[1] && (
                <div className="podium-2 podium-float relative rounded-2xl p-4 text-center flex flex-col items-center justify-end pb-6">
                  <div className="sparkle-container">
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                  </div>
                  <div className="text-4xl mb-1">🥈</div>
                  <div className="avatar-ring avatar-ring-silver">
                    <div className="avatar">{topUsers[1].display_name?.charAt(0) || 'U'}</div>
                  </div>
                  <p className="text-sm font-bold text-white mt-2">{topUsers[1].display_name || 'Ukendt'}</p>
                  <span className={`rank-badge ${getLevel(topUsers[1].total_points || 0).rankClass.replace('rank-', 'rank-')}`}>{getLevel(topUsers[1].total_points || 0).rank}</span>
                  <p className="text-xs text-gray-400 mt-1">Level {topUsers[1].level || 0}</p>
                  <p className="text-lg font-bold text-primary mt-1">{topUsers[1].total_points || 0} pt</p>
                </div>
              )}

              {/* 1. plads (størst) */}
              {topUsers[0] && (
                <div className="podium-1 podium-float rounded-2xl p-4 text-center flex flex-col items-center justify-end pb-6 -mt-4">
                  <div className="sparkle-container">
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-black text-[10px] font-bold px-4 py-1 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                    <span className="crown">👑</span> MESTR <span className="crown">👑</span>
                  </div>
                  <div className="text-5xl mb-1">🥇</div>
                  <div className="avatar-ring avatar-ring-gold">
                    <div className="avatar">{topUsers[0].display_name?.charAt(0) || 'U'}</div>
                  </div>
                  <p className="text-sm font-bold text-white mt-2">{topUsers[0].display_name || 'Ukendt'}</p>
                  <span className={`rank-badge ${getLevel(topUsers[0].total_points || 0).rankClass.replace('rank-', 'rank-')}`}>{getLevel(topUsers[0].total_points || 0).rank}</span>
                  <p className="text-xs text-gray-400 mt-1">Level {topUsers[0].level || 0}</p>
                  <p className="text-lg font-bold text-primary mt-1">{topUsers[0].total_points || 0} pt</p>
                </div>
              )}

              {/* 3. plads */}
              {topUsers[2] && (
                <div className="podium-3 podium-float relative rounded-2xl p-4 text-center flex flex-col items-center justify-end pb-6">
                  <div className="sparkle-container">
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                  </div>
                  <div className="text-4xl mb-1">🥉</div>
                  <div className="avatar-ring avatar-ring-bronze">
                    <div className="avatar">{topUsers[2].display_name?.charAt(0) || 'U'}</div>
                  </div>
                  <p className="text-sm font-bold text-white mt-2">{topUsers[2].display_name || 'Ukendt'}</p>
                  <span className={`rank-badge ${getLevel(topUsers[2].total_points || 0).rankClass.replace('rank-', 'rank-')}`}>{getLevel(topUsers[2].total_points || 0).rank}</span>
                  <p className="text-xs text-gray-400 mt-1">Level {topUsers[2].level || 0}</p>
                  <p className="text-lg font-bold text-primary mt-1">{topUsers[2].total_points || 0} pt</p>
                </div>
              )}
            </div>

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