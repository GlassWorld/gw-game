import type { CharacterDefinition } from '~/game/core/types'

export const characterData: CharacterDefinition[] = [
  {
    id: 'a-swordsman',
    code: 'A',
    name: '검사',
    title: '전열 압박형',
    description: '근접 압박과 돌파력에 강한 표준형 딜러입니다.',
    color: 0x70e0a1,
    maxHp: 140,
    maxMp: 100,
    mpRegenPerSecond: 10,
    basicAttack: {
      mode: 'melee',
      range: 68,
      damage: 14,
      cooldownMs: 460,
      hitRadius: 44,
      hitOffset: 34,
      color: 0x70e0a1
    },
    skillPool: ['swd-blade-wave', 'swd-whirlwind', 'swd-guard-break', 'swd-cross-slash', 'swd-earth-split']
  },
  {
    id: 'b-mage',
    code: 'B',
    name: '마법사',
    title: '원거리 폭딜형',
    description: '원거리 투사체와 범위 마법으로 공간을 지배합니다.',
    color: 0x7be9ff,
    maxHp: 100,
    maxMp: 160,
    mpRegenPerSecond: 15,
    basicAttack: {
      mode: 'ranged',
      range: 560,
      damage: 10,
      cooldownMs: 320,
      projectileSpeed: 620,
      projectileRadius: 8,
      projectileLifetimeMs: 1600,
      color: 0x7be9ff
    },
    skillPool: ['mag-arcane-fan', 'mag-frost-ring', 'mag-meteor', 'mag-mana-lance', 'mag-orb-burst']
  },
  {
    id: 'c-paladin',
    code: 'C',
    name: '성기사',
    title: '유지력 전투형',
    description: '높은 체력과 중거리 성속성 기술로 꾸준히 압박합니다.',
    color: 0xf6d57b,
    maxHp: 170,
    maxMp: 120,
    mpRegenPerSecond: 11,
    basicAttack: {
      mode: 'ranged',
      range: 480,
      damage: 12,
      cooldownMs: 360,
      projectileSpeed: 540,
      projectileRadius: 9,
      projectileLifetimeMs: 1700,
      color: 0xf6d57b
    },
    skillPool: ['pal-holy-bolt', 'pal-consecration', 'pal-shield-bash', 'pal-judgment', 'pal-sanctuary']
  }
]

export const defaultBossName = '붉은 심판자'
