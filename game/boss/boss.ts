import { BOSS_STATS } from '~/game/core/constants'
import type { BossEntity } from '~/game/core/types'

export function createBoss(): BossEntity {
  return {
    id: 'boss',
    x: 1220,
    y: 520,
    radius: BOSS_STATS.radius,
    hp: BOSS_STATS.maxHp,
    maxHp: BOSS_STATS.maxHp,
    basicAttack: BOSS_STATS.basicAttack,
    alive: true,
    phase: 1,
    pattern: 'idle',
    patternIndex: 0,
    patternElapsedMs: 0,
    patternStepMs: 0,
    actionElapsedMs: 0,
    velocity: { x: 0, y: 0 },
    chargeTarget: null,
    phaseAnnounced: false,
    display: null
  }
}
