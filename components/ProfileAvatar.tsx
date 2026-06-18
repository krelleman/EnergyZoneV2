// components/ProfileAvatar.tsx
'use client'

import { getLevel } from '@/lib/levels'

interface ProfileAvatarProps {
  displayName: string
  level?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ProfileAvatar({ displayName, level = 0, size = 'md' }: ProfileAvatarProps) {
  const userLevel = getLevel(level)
  const rankClass = userLevel.rankClass || 'rank-none'
  const ringClass = `rank-ring-${rankClass.replace('rank-', '')}` || 'rank-ring-none'

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl',
  }

  const ringSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  }

  const initials = displayName
    ? displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className={`rank-ring ${ringClass} ${ringSizes[size]} inline-block`}>
      <div className={`
        ${sizeClasses[size]}
        rounded-full bg-gradient-to-br from-primary to-purple-500
        flex items-center justify-center font-bold text-white
        shadow-lg shadow-primary/20
      `}>
        {initials}
      </div>
    </div>
  )
}