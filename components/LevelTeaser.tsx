// components/LevelTeaser.tsx
import { createClient } from '@/utils/supabase/server'
import { LEVELS, getLevel, type Level } from '@/lib/levels'

async function getUserLevel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('points, level')
    .eq('id', user.id)
    .single()
  return data
}

export default async function LevelTeaser() {
  const userData = await getUserLevel()
  
  const userLevel = userData?.level || 0
  const userPoints = userData?.points || 0
  const levelInfo = getLevel(userPoints)
  
  const nextLevelIndex = LEVELS.findIndex(l => l.level === userLevel) + 1
  const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null
  
  const progressPercentage = userLevel >= 10 
    ? 100 
    : userLevel === 0 
      ? Math.min(100, userPoints * 10)
      : Math.min(100, (userPoints % 10) * 10)

  return (
    <section className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl p-6 border border-gray-700 text-center">
      <h2 className="text-2xl font-bold text-white mb-2">⚡ Level system</h2>
      <p className="text-gray-400 max-w-lg mx-auto mb-4">
        Optjen point ved at anmelde energidrikke. Stig i level og få eksklusive badges!
      </p>

      {/* Alle levels i en række */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {LEVELS.map((level: Level) => (
          <span
            key={level.level}
            className={`px-3 py-1 rounded-full text-xs ${
              level.level === userLevel
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            {level.emoji} {level.title}
          </span>
        ))}
      </div>

      {/* Brugerens nuværende level */}
      {userData ? (
        <div className="mt-4">
          <p className="text-sm text-gray-300">
            Du er{' '}
            <span className="text-amber-400 font-bold">
              Level {levelInfo.level} {levelInfo.emoji} {levelInfo.title}
            </span>
            {nextLevel && ' – '}
            {nextLevel && `${Math.max(0, (nextLevel.level === 1 ? 10 : nextLevel.level * 30) - userPoints)} point til næste level`}
          </p>
          <div className="w-full max-w-sm mx-auto h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mt-4">
          Log ind for at se din level progression
        </p>
      )}
    </section>
  )
}