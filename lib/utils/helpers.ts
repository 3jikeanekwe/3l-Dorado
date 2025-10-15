/**
 * Format currency to USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate prize distribution
 */
export function calculatePrizes(totalPool: number, playerCount: number): { [key: number]: number } {
  const prizes: { [key: number]: number } = {}
  
  // Prize distribution: 1st=50%, 2nd=25%, 3rd=7%, 4th=5%, 5th=3%
  // Remaining 10% is platform fee
  prizes[1] = totalPool * 0.50
  prizes[2] = totalPool * 0.25
  prizes[3] = totalPool * 0.07
  prizes[4] = totalPool * 0.05
  prizes[5] = totalPool * 0.03
  
  return prizes
}

/**
 * Calculate XP gained based on position
 */
export function calculateXP(position: number, totalPlayers: number): number {
  const baseXP = 100
  const positionMultiplier = Math.max(0, (totalPlayers - position) / totalPlayers)
  return Math.floor(baseXP * positionMultiplier)
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  // XP needed = (level - 1)^2 * 100
  return Math.pow(currentLevel, 2) * 100
}

/**
 * Format player count
 */
export function formatPlayerCount(current: number, max: number): string {
  return `${current}/${max} players`
}

/**
 * Get game session status color
 */
export function getSessionStatusColor(status: string): string {
  switch (status) {
    case 'waiting':
      return 'bg-yellow-600'
    case 'active':
      return 'bg-green-600'
    case 'completed':
      return 'bg-blue-600'
    case 'cancelled':
      return 'bg-red-600'
    default:
      return 'bg-gray-600'
  }
}

/**
 * Get bet tier display name
 */
export function getBetTierDisplay(tier: string): string {
  if (tier === 'free') return 'Free Play'
  return `$${tier}`
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate game name
 */
export function validateGameName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Game name is required' }
  }
  
  if (name.length < 3) {
    return { valid: false, error: 'Game name must be at least 3 characters' }
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Game name must be less than 50 characters' }
  }
  
  return { valid: true }
}

/**
 * Check if user has sufficient balance
 */
export function hasSufficientBalance(balance: number, betAmount: number): boolean {
  return balance >= betAmount
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get win rate percentage
 */
export function getWinRate(wins: number, losses: number): number {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Generate random color
 */
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
