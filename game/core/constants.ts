import type { BasicAttackProfile } from '~/game/core/types'

export const GAME_WIDTH = 2560
export const GAME_HEIGHT = 1560
export const ARENA_WIDTH = 1680
export const ARENA_HEIGHT = 1680
export const WORLD_PADDING = 120

export const PLAYER_STATS = {
  maxHp: 120,
  radius: 22,
  speed: 240,
  dashDistance: 150,
  dashDurationMs: 170,
  invulnerableMs: 600,
  basicAttack: {
    mode: 'ranged',
    range: 520,
    damage: 10,
    cooldownMs: 220,
    projectileSpeed: 640,
    projectileRadius: 8,
    projectileLifetimeMs: 1600,
    color: 0x72f1c7
  } satisfies BasicAttackProfile
}

export const BOSS_STATS = {
  maxHp: 520,
  radius: 36,
  moveSpeed: 96,
  chargeSpeed: 390,
  contactDamage: 20,
  phaseTwoThreshold: 0.5,
  basicAttack: {
    mode: 'melee',
    range: 74,
    damage: 16,
    cooldownMs: 900,
    hitRadius: 42,
    hitOffset: 38,
    color: 0xff8f70
  } satisfies BasicAttackProfile
}

export const DAMAGE_FLASH_MS = 120

export const COMBAT_TUNING = {
  player: {
    hurtboxScale: 0.86,
    dashInvulnerabilityMs: 220,
    damageInvulnerabilityMs: 680,
    basicAttackRecoverMs: 190,
    skillRecoverMs: 240,
    basicAttackComboCycleMs: 3000,
    basicAttackComboStepGapMs: 800,
    basicAttackComboAnimMs: 320
  },
  boss: {
    hurtboxScale: 0.94,
    projectileHitboxScale: 0.92,
    hazardHitboxScale: 0.96,
    contactHitboxScale: 0.9,
    telegraphMs: {
      volley: 520,
      slam: 760,
      charge: 680
    },
    chargeStopDistance: 36
  },
  feedback: {
    hitFlashMs: DAMAGE_FLASH_MS,
    skillPreviewMs: 260,
    dashGhostIntervalMs: 34
  }
}

export const PROJECTILE_LIMITS = {
  maxLifetimeMs: 5000
}
