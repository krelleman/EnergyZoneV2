// components/LevelTable.tsx
import { LEVELS, type Level } from '@/lib/levels'

export default function LevelTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-center">⚡ Levels</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {LEVELS.map((level: Level) => (
          <div
            key={level.level}
            className={`text-center p-3 rounded-xl border ${
              level.level >= 4 && level.level <= 5
                ? 'border-orange-200 bg-orange-50'
                : level.level === 10
                ? 'border-purple-200 bg-purple-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="text-2xl">{level.emoji}</div>
            <div className="font-bold text-sm">{level.title}</div>
            <div className="text-xs text-gray-400">{level.points} pt</div>
            <div className={`text-xs font-medium ${level.rankClass} px-2 py-0.5 rounded-full mt-1 inline-block`}>
              {level.rank}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}