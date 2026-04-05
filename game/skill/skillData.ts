import type { SkillDefinition } from '~/game/core/types'

export const skillData: SkillDefinition[] = [
  {
    id: 'swd-blade-wave',
    characterId: 'a-swordsman',
    label: '블레이드 웨이브',
    cooldownMs: 3200,
    mpCost: 20,
    description: '전방에 검기를 부채꼴로 날립니다.',
    effect: { type: 'projectile_fan', damage: 14, color: 0x7df0b9, projectileCount: 3, projectileSpeed: 760, projectileRadius: 8, projectileLifetimeMs: 900, spread: 0.18 }
  },
  {
    id: 'swd-whirlwind',
    characterId: 'a-swordsman',
    label: '와류 베기',
    cooldownMs: 5200,
    mpCost: 28,
    description: '주변 근접 범위에 회전 베기를 가합니다.',
    effect: { type: 'aoe_burst', damage: 28, color: 0x70e0a1, radius: 88, ttlMs: 220 }
  },
  {
    id: 'swd-guard-break',
    characterId: 'a-swordsman',
    label: '가드 브레이크',
    cooldownMs: 4800,
    mpCost: 24,
    description: '전방 좁은 범위를 강하게 내려칩니다.',
    effect: { type: 'frontal_cleave', damage: 34, color: 0x9cf5c3, radius: 56, offset: 52, ttlMs: 180 }
  },
  {
    id: 'swd-cross-slash',
    characterId: 'a-swordsman',
    label: '크로스 슬래시',
    cooldownMs: 4300,
    mpCost: 22,
    description: '전방에 교차 검격을 날립니다.',
    effect: { type: 'projectile_fan', damage: 16, color: 0xa5ffd0, projectileCount: 2, projectileSpeed: 820, projectileRadius: 9, projectileLifetimeMs: 1000, spread: 0.22 }
  },
  {
    id: 'swd-earth-split',
    characterId: 'a-swordsman',
    label: '대지 가르기',
    cooldownMs: 7000,
    mpCost: 36,
    description: '보스 위치에 충격 장판을 일으킵니다.',
    effect: { type: 'ground_burst', damage: 42, color: 0x7dd7a7, radius: 84, telegraphMs: 350, ttlMs: 900 }
  },
  {
    id: 'mag-arcane-fan',
    characterId: 'b-mage',
    label: '아케인 팬',
    cooldownMs: 3400,
    mpCost: 24,
    description: '전방으로 다중 마력탄을 발사합니다.',
    effect: { type: 'projectile_fan', damage: 12, color: 0x7be9ff, projectileCount: 5, projectileSpeed: 820, projectileRadius: 8, projectileLifetimeMs: 1100, spread: 0.14 }
  },
  {
    id: 'mag-frost-ring',
    characterId: 'b-mage',
    label: '서리 고리',
    cooldownMs: 5200,
    mpCost: 30,
    description: '주변에 냉기 폭발을 일으킵니다.',
    effect: { type: 'aoe_burst', damage: 24, color: 0x8be9ff, radius: 96, ttlMs: 260 }
  },
  {
    id: 'mag-meteor',
    characterId: 'b-mage',
    label: '메테오 낙하',
    cooldownMs: 7600,
    mpCost: 44,
    description: '보스 위치에 강력한 낙하 마법을 떨어뜨립니다.',
    effect: { type: 'ground_burst', damage: 48, color: 0xff9f70, radius: 92, telegraphMs: 500, ttlMs: 1100 }
  },
  {
    id: 'mag-mana-lance',
    characterId: 'b-mage',
    label: '마나 랜스',
    cooldownMs: 4600,
    mpCost: 26,
    description: '강한 관통 마탄을 쏩니다.',
    effect: { type: 'projectile_shot', damage: 36, color: 0xb6f0ff, projectileSpeed: 980, projectileRadius: 11, projectileLifetimeMs: 1300 }
  },
  {
    id: 'mag-orb-burst',
    characterId: 'b-mage',
    label: '오브 폭산',
    cooldownMs: 5800,
    mpCost: 34,
    description: '짧은 지연 후 폭발하는 구체를 생성합니다.',
    effect: { type: 'ground_burst', damage: 32, color: 0x90b7ff, radius: 74, telegraphMs: 250, ttlMs: 700 }
  },
  {
    id: 'pal-holy-bolt',
    characterId: 'c-paladin',
    label: '홀리 볼트',
    cooldownMs: 3400,
    mpCost: 22,
    description: '성속성 투사체를 전방에 날립니다.',
    effect: { type: 'projectile_shot', damage: 24, color: 0xf6d57b, projectileSpeed: 760, projectileRadius: 10, projectileLifetimeMs: 1200 }
  },
  {
    id: 'pal-consecration',
    characterId: 'c-paladin',
    label: '축성',
    cooldownMs: 5600,
    mpCost: 30,
    description: '주변에 성역 충격을 일으킵니다.',
    effect: { type: 'aoe_burst', damage: 26, color: 0xffefab, radius: 104, ttlMs: 260 }
  },
  {
    id: 'pal-shield-bash',
    characterId: 'c-paladin',
    label: '방패 강타',
    cooldownMs: 4200,
    mpCost: 20,
    description: '전방 근접 범위를 강하게 타격합니다.',
    effect: { type: 'frontal_cleave', damage: 32, color: 0xf9e79b, radius: 60, offset: 48, ttlMs: 180 }
  },
  {
    id: 'pal-judgment',
    characterId: 'c-paladin',
    label: '심판의 창',
    cooldownMs: 4800,
    mpCost: 28,
    description: '집중된 성창을 발사합니다.',
    effect: { type: 'projectile_shot', damage: 34, color: 0xffe28a, projectileSpeed: 900, projectileRadius: 11, projectileLifetimeMs: 1300 }
  },
  {
    id: 'pal-sanctuary',
    characterId: 'c-paladin',
    label: '성역 폭발',
    cooldownMs: 6800,
    mpCost: 36,
    description: '보스 위치에 성광 폭발을 일으킵니다.',
    effect: { type: 'ground_burst', damage: 40, color: 0xfff1b8, radius: 88, telegraphMs: 320, ttlMs: 860 }
  }
]
