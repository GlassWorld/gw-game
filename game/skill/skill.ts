import type { SkillDefinition, SkillState } from '~/game/core/types'
import { skillData } from '~/game/skill/skillData'
import { getSkillPresentationMeta } from '~/game/skill/skillPresentation'

const slotKeys = ['Q', 'W', 'E'] as const

export function getSkillById(skillId: string) {
  return skillData.find((skill) => skill.id === skillId)
}

export function getSkillsByIds(skillIds: string[]) {
  return skillIds
    .map((skillId) => getSkillById(skillId))
    .filter((skill): skill is SkillDefinition => Boolean(skill))
}

export function getSkillHudMeta(skill: SkillDefinition) {
  const presentation = getSkillPresentationMeta(skill.effect.type)

  return {
    iconLabel: presentation.iconLabel,
    color: skill.effect.color
  }
}

export function createSkillStateMap(selectedSkillIds: string[]): Record<string, SkillState> {
  return getSkillsByIds(selectedSkillIds).reduce<Record<string, SkillState>>((acc, definition, index) => {
    acc[definition.id] = {
      definition,
      key: slotKeys[index] ?? `S${index + 1}`,
      remainingMs: 0
    }

    return acc
  }, {})
}
