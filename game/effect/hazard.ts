import type { Faction, HazardEntity } from '~/game/core/types'

export function createHazard(options: {
  id: string
  x: number
  y: number
  radius: number
  faction: Faction
  damage: number
  ttlMs: number
  telegraphMs: number
  color: number
  showIndicator?: boolean
}): HazardEntity {
  return {
    ...options,
    elapsedMs: 0,
    triggered: options.telegraphMs === 0,
    alive: true,
    display: null
  }
}
