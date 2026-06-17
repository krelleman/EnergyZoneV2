// lib/levels.ts

export interface Level {
  level: number
  title: string
  points: string
  rank: string
  rankClass: string
  emoji: string
}

export const LEVELS: Level[] = [
  { level: 0, title: 'None', points: '0', rank: 'None', rankClass: 'rank-none', emoji: '⬜' },
  { level: 1, title: 'New Taster', points: '1-9', rank: 'Copper', rankClass: 'rank-copper', emoji: '🟫' },
  { level: 2, title: 'Energy Recruit', points: '10-29', rank: 'Bronze', rankClass: 'rank-bronze', emoji: '🥉' },
  { level: 3, title: 'Caffeine Knower', points: '30-69', rank: 'Silver', rankClass: 'rank-silver', emoji: '🥈' },
  { level: 4, title: 'Turbo', points: '70-149', rank: 'Gold', rankClass: 'rank-gold', emoji: '🥇' },
  { level: 5, title: 'Hyper', points: '150-299', rank: 'Platinum', rankClass: 'rank-platinum', emoji: '💎' },
  { level: 6, title: 'Taste Expert', points: '300-499', rank: 'Diamond', rankClass: 'rank-diamond', emoji: '💠' },
  { level: 7, title: 'Master', points: '500-799', rank: 'Master', rankClass: 'rank-master', emoji: '👑' },
  { level: 8, title: 'Grandmaster', points: '800-1199', rank: 'Grandmaster', rankClass: 'rank-grandmaster', emoji: '⭐' },
  { level: 9, title: 'Champion', points: '1200-1999', rank: 'Champion', rankClass: 'rank-champion', emoji: '🏆' },
  { level: 10, title: 'Legend', points: '2000+', rank: 'Radiant', rankClass: 'rank-radiant', emoji: '🌟' },
]

export function getLevel(points: number): Level {
  if (points <= 0) return LEVELS[0]
  if (points <= 9) return LEVELS[1]
  if (points <= 29) return LEVELS[2]
  if (points <= 69) return LEVELS[3]
  if (points <= 149) return LEVELS[4]
  if (points <= 299) return LEVELS[5]
  if (points <= 499) return LEVELS[6]
  if (points <= 799) return LEVELS[7]
  if (points <= 1199) return LEVELS[8]
  if (points <= 1999) return LEVELS[9]
  return LEVELS[10]
}

export function getRankBadge(level: number): string {
  const lvl = LEVELS.find(l => l.level === level)
  return lvl?.rankClass || 'rank-none'
}

export function getLevelEmoji(level: number): string {
  const lvl = LEVELS.find(l => l.level === level)
  return lvl?.emoji || '⚡'
}