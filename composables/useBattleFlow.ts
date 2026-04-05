import type { ComputedRef, Ref } from 'vue'
import type { BattleResult, BattleSetup, BossDefinition, CharacterDefinition, RunRewardSummary } from '~/game/core/types'
import { bossData, defaultBoss } from '~/game/boss/bossData'

type PageView = 'home' | 'character' | 'boss' | 'hub' | 'stage'

type GameController = {
  destroyGame: () => void
  mountGame: (setup: BattleSetup) => Promise<void>
  startPractice: (setup: BattleSetup) => void
  startGame: (setup: BattleSetup) => void
  restartGame: () => void
}

type BattleStateController = {
  returnToMenu: () => void
  setResult: (result: BattleResult) => void
}

type SelectionController = {
  selectedBossId: Ref<string | null>
  totalCurrency: Ref<number>
  totalSkillUpgradePoints: Ref<number>
  clearedBossIds: Ref<string[]>
  runCompleted: Ref<boolean>
  selectedCharacter: ComputedRef<CharacterDefinition | null>
  selectedBoss: ComputedRef<BossDefinition | null>
  availableBosses: ComputedRef<BossDefinition[]>
  createBattleSetup: (mode: 'practice' | 'battle', bossName?: string) => BattleSetup | null
  resetHubSelections: () => void
  resetRunProgress: () => void
  applyRunReward: (boss: BossDefinition, reward: RunRewardSummary) => void
}

type TravelOverlayController = {
  open: (title: string, body: string) => Promise<void>
  close: () => Promise<void>
  reset: () => void
}

type BossCutsceneController = {
  play: (frames: BossDefinition['introCutscene']) => Promise<void>
  finish: () => void
}

export function useBattleFlow(options: {
  battleState: BattleStateController
  selection: SelectionController
  travelOverlay: TravelOverlayController
  bossCutscene: BossCutsceneController
  game: GameController
}) {
  const pageView = ref<PageView>('home')

  const stopCurrentFlow = () => {
    options.bossCutscene.finish()
    options.travelOverlay.reset()
    options.battleState.returnToMenu()
    options.game.destroyGame()
  }

  const goHome = () => {
    stopCurrentFlow()
    options.selection.resetRunProgress()
    pageView.value = 'home'
  }

  const goCharacterSelect = () => {
    stopCurrentFlow()
    options.selection.resetRunProgress()
    pageView.value = 'character'
  }

  const goBossSelect = () => {
    if (!options.selection.selectedCharacter.value) {
      return
    }

    options.selection.selectedBossId.value = null
    options.selection.resetHubSelections()
    pageView.value = 'boss'
  }

  const goHubSetup = () => {
    if (!options.selection.selectedCharacter.value || !options.selection.selectedBoss.value) {
      return
    }

    options.selection.resetHubSelections()
    pageView.value = 'hub'
  }

  const goNextBossRoll = async () => {
    if (options.selection.availableBosses.value.length === 0) {
      return
    }

    await options.travelOverlay.open(
      '다음 보스 탐색',
      `남은 보스 ${options.selection.availableBosses.value.length}체 중 다음 상대를 결정합니다.`
    )
    options.selection.selectedBossId.value = null
    options.selection.resetHubSelections()
    pageView.value = 'boss'
    await options.travelOverlay.close()
  }

  const enterPractice = async () => {
    const setup = options.selection.createBattleSetup('practice', options.selection.selectedBoss.value?.name ?? '연습 표적')
    if (!setup) {
      return
    }

    await options.travelOverlay.open(
      '연습 공간으로 이동',
      `${options.selection.selectedBoss.value?.region ?? '훈련 구역'} 진입 전, 현재 세팅을 시험합니다.`
    )
    pageView.value = 'stage'
    await nextTick()
    await options.game.mountGame(setup)
    options.game.startPractice(setup)
    await options.travelOverlay.close()
  }

  const startBossBattle = async () => {
    const setup = options.selection.createBattleSetup('battle', options.selection.selectedBoss.value?.name ?? defaultBoss.name)
    if (!setup) {
      return
    }

    await options.travelOverlay.open(
      `${options.selection.selectedBoss.value?.name ?? defaultBoss.name} 토벌 개시`,
      options.selection.selectedBoss.value
        ? `${options.selection.selectedBoss.value.region} · ${options.selection.selectedBoss.value.encounterText}\n“${options.selection.selectedBoss.value.introLine}”`
        : `${defaultBoss.region} 깊숙한 곳으로 이동합니다. 잠시 후 전투가 시작됩니다.`
    )
    await options.travelOverlay.close()
    if (options.selection.selectedBoss.value) {
      await options.bossCutscene.play(options.selection.selectedBoss.value.introCutscene)
    }
    await options.game.mountGame(setup)
    options.game.startGame(setup)
  }

  const restartBattle = () => {
    options.game.restartGame()
  }

  const goCharacterSelectFromResult = () => {
    options.bossCutscene.finish()
    options.battleState.returnToMenu()
    options.game.destroyGame()
    pageView.value = 'character'
  }

  const goHubFromPractice = () => {
    options.bossCutscene.finish()
    options.battleState.returnToMenu()
    options.game.destroyGame()
    pageView.value = 'hub'
  }

  const handleBattleEnd = async (result: BattleResult) => {
    if (result === 'victory' && options.selection.selectedBoss.value) {
      const reward: RunRewardSummary = {
        bossName: options.selection.selectedBoss.value.name,
        currency: 3,
        skillUpgradePoints: 1
      }

      options.selection.applyRunReward(options.selection.selectedBoss.value, reward)
      await options.bossCutscene.play(options.selection.selectedBoss.value.deathCutscene)

      if (options.selection.clearedBossIds.value.length >= bossData.length) {
        options.selection.runCompleted.value = true
        await options.travelOverlay.open(
          '런 클리어',
          `모든 보스를 돌파했습니다.\n총 획득: 재화 ${options.selection.totalCurrency.value}, 강화 ${options.selection.totalSkillUpgradePoints.value}`
        )
        options.battleState.returnToMenu()
        options.game.destroyGame()
        options.selection.selectedBossId.value = null
        await options.travelOverlay.close()
        pageView.value = 'home'
        return
      }

      await options.travelOverlay.open(
        '대기소로 복귀',
        `${options.selection.selectedBoss.value.region} 전투를 정리하고 다음 준비 단계로 돌아갑니다.\n보상: 재화 +${reward.currency}, 강화 +${reward.skillUpgradePoints}`
      )
      options.battleState.returnToMenu()
      options.game.destroyGame()
      pageView.value = 'hub'
      await options.travelOverlay.close()
      return
    }

    options.battleState.setResult(result)
  }

  return {
    pageView,
    goHome,
    goCharacterSelect,
    goBossSelect,
    goHubSetup,
    goNextBossRoll,
    enterPractice,
    startBossBattle,
    restartBattle,
    goCharacterSelectFromResult,
    goHubFromPractice,
    handleBattleEnd
  }
}
