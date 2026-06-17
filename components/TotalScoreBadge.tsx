// components/TotalScoreBadge.tsx
interface TotalScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function TotalScoreBadge({ score, size = 'md', showLabel = true }: TotalScoreBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 text-white'
    if (score >= 60) return 'bg-amber-500 text-white'
    if (score >= 40) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  const getLabel = (score: number) => {
    if (score >= 80) return 'Fremragende'
    if (score >= 60) return 'God'
    if (score >= 40) return 'Okay'
    return 'Skuffende'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-bold ${getColor(score)} ${sizeClasses[size]}`}>
      <span>{Math.round(score)}%</span>
      {showLabel && <span className="font-medium">{getLabel(score)}</span>}
    </div>
  )
}