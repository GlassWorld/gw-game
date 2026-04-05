import type {
  BattleMode,
  BattleSetup,
  BossDefinition,
  CharacterDefinition,
  CharacterId,
  RunRewardSummary
} from '~/game/core/types'
import { bossData, defaultBoss } from '~/game/boss/bossData'
import { characterData } from '~/game/character/characterData'
import { emptyBattleLoadout } from '~/game/data/loadoutData'
import { getSkillsByIds } from '~/game/skill/skill'

export function useBattleSelection() {
  const selectedCharacterId = ref<CharacterId | null>(characterData[0]?.id ?? null)
  const selectedBossId = ref<string | null>(null)
  const selectedSkillIds = ref<string[]>([])
  const selectedStatId = ref<string | null>(null)
  const selectedPotionId = ref<string | null>(null)
  const totalCurrency = ref(0)
  const totalSkillUpgradePoints = ref(0)
  const latestReward = ref<RunRewardSummary | null>(null)
  const clearedBossIds = ref<string[]>([])
  const runCompleted = ref(false)

  const selectedCharacter = computed<CharacterDefinition | null>(() => (
    characterData.find((character) => character.id === selectedCharacterId.value) ?? null
  ))

  const availableSkills = computed(() => (
    selectedCharacter.value ? getSkillsByIds(selectedCharacter.value.skillPool) : []
  ))

  const selectedBoss = computed(() => (
    bossData.find((boss) => boss.id === selectedBossId.value) ?? null
  ))

  const availableBosses = computed(() => (
    bossData.filter((boss) => !clearedBossIds.value.includes(boss.id))
  ))

  const clearedBosses = computed(() => (
    bossData.filter((boss) => clearedBossIds.value.includes(boss.id))
  ))

  const createBattleSetup = (mode: BattleMode, bossName?: string): BattleSetup | null => {
    if (!selectedCharacter.value || selectedSkillIds.value.length !== 3) {
      return null
    }

    return {
      mode,
      character: selectedCharacter.value,
      bossId: selectedBoss.value?.id ?? defaultBoss.id,
      bossName: bossName ?? selectedBoss.value?.name ?? defaultBoss.name,
      selectedSkillIds: [...selectedSkillIds.value],
      loadout: {
        statId: selectedStatId.value,
        potionId: selectedPotionId.value
      }
    }
  }

  const resetHubSelections = () => {
    selectedSkillIds.value = []
    const emptyLoadout = emptyBattleLoadout()
    selectedStatId.value = emptyLoadout.statId
    selectedPotionId.value = emptyLoadout.potionId
  }

  const resetRunProgress = () => {
    selectedBossId.value = null
    latestReward.value = null
    totalCurrency.value = 0
    totalSkillUpgradePoints.value = 0
    clearedBossIds.value = []
    runCompleted.value = false
    resetHubSelections()
  }

  const selectCharacter = (characterId: CharacterId) => {
    if (selectedCharacterId.value === characterId) {
      return
    }

    selectedCharacterId.value = characterId
    selectedBossId.value = null
    resetHubSelections()
  }

  const selectBoss = (bossId: string) => {
    selectedBossId.value = bossId
  }

  const toggleSkill = (skillId: string) => {
    if (selectedSkillIds.value.includes(skillId)) {
      selectedSkillIds.value = selectedSkillIds.value.filter((id) => id !== skillId)
      return
    }

    if (selectedSkillIds.value.length >= 3) {
      return
    }

    selectedSkillIds.value = [...selectedSkillIds.value, skillId]
  }

  const applyRunReward = (boss: BossDefinition, reward: RunRewardSummary) => {
    latestReward.value = reward
    totalCurrency.value += reward.currency
    totalSkillUpgradePoints.value += reward.skillUpgradePoints

    if (!clearedBossIds.value.includes(boss.id)) {
      clearedBossIds.value = [...clearedBossIds.value, boss.id]
    }
  }

  return {
    selectedCharacterId,
    selectedBossId,
    selectedSkillIds,
    selectedStatId,
    selectedPotionId,
    totalCurrency,
    totalSkillUpgradePoints,
    latestReward,
    clearedBossIds,
    runCompleted,
    selectedCharacter,
    availableSkills,
    selectedBoss,
    availableBosses,
    clearedBosses,
    createBattleSetup,
    resetHubSelections,
    resetRunProgress,
    selectCharacter,
    selectBoss,
    toggleSkill,
    applyRunReward
  }
}
