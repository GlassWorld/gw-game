import type { BasicAttackProfile, BattleLoadout } from '~/game/core/types'

export interface LoadoutOption {
  id: string
  label: string
  description: string
  cost: number
}

export const resourceBudget = 10

export const statOptions: LoadoutOption[] = [
  { id: 'stat-power', label: '공격 배분', description: '피해와 압박을 우선하는 성장 선택', cost: 2 },
  { id: 'stat-focus', label: '집중 배분', description: 'MP 운용과 스킬 회전을 안정화', cost: 2 },
  { id: 'stat-guard', label: '수비 배분', description: 'HP와 유지력을 높이는 안전 선택', cost: 2 }
]

export const potionOptions: LoadoutOption[] = [
  { id: 'potion-recovery', label: '회복 포션', description: '실수 보정을 위한 기본 포션', cost: 1 },
  { id: 'potion-mana', label: '마력 포션', description: '스킬 사용 빈도를 늘리는 보조 포션', cost: 1 },
  { id: 'potion-burst', label: '격화 포션', description: '짧은 순간 화력을 끌어올리는 공격형 포션', cost: 2 }
]

export function emptyBattleLoadout(): BattleLoadout {
  return {
    statId: null,
    potionId: null
  }
}

export function calculateSpentResources(loadout: BattleLoadout) {
  const statCost = statOptions.find((option) => option.id === loadout.statId)?.cost ?? 0
  const potionCost = potionOptions.find((option) => option.id === loadout.potionId)?.cost ?? 0
  return statCost + potionCost
}

export function buildLoadoutSummary(loadout: BattleLoadout) {
  const labels = [
    statOptions.find((option) => option.id === loadout.statId)?.label,
    potionOptions.find((option) => option.id === loadout.potionId)?.label
  ].filter((label): label is string => Boolean(label))

  return labels.length > 0 ? labels.join(', ') : '기본 세팅'
}

export function describeLoadoutEffects(loadout: BattleLoadout) {
  const effects: string[] = []

  if (loadout.statId === 'stat-power') effects.push('평타 피해 +2')
  if (loadout.statId === 'stat-focus') effects.push('최대 MP +20', 'MP 재생 +3')
  if (loadout.statId === 'stat-guard') effects.push('최대 HP +20')
  if (loadout.potionId === 'potion-recovery') effects.push('최대 HP +12')
  if (loadout.potionId === 'potion-mana') effects.push('최대 MP +14')
  if (loadout.potionId === 'potion-burst') effects.push('평타 속도 증가')

  return effects.length > 0 ? effects : ['추가 효과 없음']
}

export function applyLoadoutToCharacterStats(base: {
  maxHp: number
  maxMp: number
  mpRegenPerSecond: number
  basicAttack: BasicAttackProfile
}, loadout: BattleLoadout) {
  let maxHp = base.maxHp
  let maxMp = base.maxMp
  let mpRegenPerSecond = base.mpRegenPerSecond
  let basicAttack = { ...base.basicAttack }

  if (loadout.statId === 'stat-power') {
    basicAttack.damage += 2
  }

  if (loadout.statId === 'stat-focus') {
    maxMp += 20
    mpRegenPerSecond += 3
  }

  if (loadout.statId === 'stat-guard') {
    maxHp += 20
  }

  if (loadout.potionId === 'potion-recovery') {
    maxHp += 12
  }

  if (loadout.potionId === 'potion-mana') {
    maxMp += 14
  }

  if (loadout.potionId === 'potion-burst') {
    basicAttack.cooldownMs = Math.max(120, basicAttack.cooldownMs - 35)
  }

  return {
    maxHp,
    maxMp,
    mpRegenPerSecond,
    basicAttack
  }
}
