import type { SkillEffectType } from '~/game/core/types'

export interface SkillPresentationMeta {
  iconLabel: string
  previewClass: string
  previewDescription: string
}

const skillPresentationMap: Record<SkillEffectType, SkillPresentationMeta> = {
  projectile_fan: {
    iconLabel: 'FAN',
    previewClass: 'preview--fan',
    previewDescription: '전방으로 다수의 투사체가 퍼져나가는 예시'
  },
  projectile_shot: {
    iconLabel: 'SHOT',
    previewClass: 'preview--shot',
    previewDescription: '직선으로 빠르게 관통하는 단일 투사체 예시'
  },
  aoe_burst: {
    iconLabel: 'AOE',
    previewClass: 'preview--burst',
    previewDescription: '캐릭터 주변 원형 폭발 범위 예시'
  },
  ground_burst: {
    iconLabel: 'DROP',
    previewClass: 'preview--ground',
    previewDescription: '지점 지정 후 지연 폭발하는 장판 예시'
  },
  frontal_cleave: {
    iconLabel: 'CLEAVE',
    previewClass: 'preview--cleave',
    previewDescription: '전방 근접 부채꼴 타격 범위 예시'
  }
}

export function getSkillPresentationMeta(effectType: SkillEffectType) {
  return skillPresentationMap[effectType]
}
