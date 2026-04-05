import type { BossPatternDefinition } from '~/game/core/types'

export const bossPatternDefinitions: Record<'volley' | 'slam' | 'charge', BossPatternDefinition> = {
  volley: {
    key: 'volley',
    label: '탄막 사격',
    durationMs: 6200,
    intervalMs: 760
  },
  slam: {
    key: 'slam',
    label: '붕괴 장판',
    durationMs: 5600,
    intervalMs: 1280
  },
  charge: {
    key: 'charge',
    label: '돌진 압박',
    durationMs: 4200,
    intervalMs: 1420
  }
}

export const bossPhaseRotations = {
  1: ['volley', 'slam', 'charge'],
  2: ['volley', 'charge', 'slam']
} as const
