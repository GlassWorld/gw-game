import type { Faction, ProjectileEntity } from '~/game/core/types'

export function createProjectile(options: {
  id: string
  x: number
  y: number
  radius: number
  faction: Faction
  damage: number
  vx: number
  vy: number
  ttlMs: number
  color: number
}): ProjectileEntity {
  return {
    ...options,
    elapsedMs: 0,
    alive: true,
    display: null
  }
}
