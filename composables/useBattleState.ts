import { BOSS_STATS } from '~/game/core/constants'
import type { BattleHudState, BattleResult, BattleSetup, SkillHudState } from '~/game/core/types'
import { buildLoadoutSummary, describeLoadoutEffects, emptyBattleLoadout } from '~/game/data/loadoutData'
import { defaultBossName } from '~/game/character/characterData'
import { createSkillStateMap, getSkillHudMeta } from '~/game/skill/skill'

function createSkillHudState(selectedSkillIds: string[]): Record<string, SkillHudState> {
  const skillStates = createSkillStateMap(selectedSkillIds)

  return Object.fromEntries(
    Object.values(skillStates).map((skill) => [
      skill.definition.id,
      {
        id: skill.definition.id,
        key: skill.key,
        label: skill.definition.label,
        iconLabel: getSkillHudMeta(skill.definition).iconLabel,
        color: getSkillHudMeta(skill.definition).color,
        remainingMs: 0,
        cooldownMs: skill.definition.cooldownMs
      }
    ])
  )
}

function createInitialState(setup?: BattleSetup): BattleHudState {
  const character = setup?.character
  const loadout = setup?.loadout ?? emptyBattleLoadout()

  return {
    phase: 'idle',
    result: null,
    playerName: character?.name ?? '준비 중',
    playerHp: character?.maxHp ?? 0,
    playerMaxHp: character?.maxHp ?? 0,
    playerMp: character?.maxMp ?? 0,
    playerMaxMp: character?.maxMp ?? 0,
    bossName: setup?.bossName ?? defaultBossName,
    bossHp: BOSS_STATS.maxHp,
    bossMaxHp: BOSS_STATS.maxHp,
    bossPhase: 1,
    bossPatternLabel: '대기',
    dashCooldownMs: 0,
    countdown: null,
    skills: createSkillHudState(setup?.selectedSkillIds ?? []),
    loadoutSummary: buildLoadoutSummary(loadout),
    loadoutEffects: describeLoadoutEffects(loadout),
    message: '전투 준비 중입니다.'
  }
}

export function useBattleState() {
  const currentSetup = shallowRef<BattleSetup | null>(null)
  const state = reactive<BattleHudState>(createInitialState())

  const replaceState = (next: BattleHudState) => {
    Object.assign(state, next)
  }

  const configureSetup = (setup: BattleSetup) => {
    currentSetup.value = setup
    replaceState({
      ...createInitialState(setup),
      message: `${setup.character.name} 준비 완료. 보스 ${setup.bossName} 토벌을 시작합니다. 현재 세팅: ${buildLoadoutSummary(setup.loadout)}`
    })
  }

  const startLoading = () => {
    replaceState({
      ...createInitialState(currentSetup.value ?? undefined),
      phase: 'loading',
      message: '전장을 불러오고 있습니다.'
    })
  }

  const startPractice = () => {
    replaceState({
      ...createInitialState(currentSetup.value ?? undefined),
      phase: 'practice',
      message: `연습 공간입니다. ${buildLoadoutSummary(currentSetup.value?.loadout ?? emptyBattleLoadout())} 세팅을 시험한 뒤 보스전에 진입할 수 있습니다.`
    })
  }

  const startCountdown = (countdown: number) => {
    state.phase = 'countdown'
    state.countdown = countdown
    state.message = countdown > 0 ? `${countdown}초 후 전투 시작` : '전투 시작'
  }

  const startRun = () => {
    replaceState({
      ...createInitialState(currentSetup.value ?? undefined),
      phase: 'running',
      message: `보스 사거리 안에 들어가면 자동으로 평타가 발동합니다. 현재 세팅: ${buildLoadoutSummary(currentSetup.value?.loadout ?? emptyBattleLoadout())}`,
      countdown: null
    })
  }

  const returnToMenu = () => {
    currentSetup.value = null
    replaceState(createInitialState())
  }

  const setResult = (result: BattleResult) => {
    state.phase = 'result'
    state.result = result
    state.message = result === 'victory'
      ? '보스를 쓰러뜨렸습니다. 패턴 속도와 기술 감각을 계속 조정해볼 수 있습니다.'
      : '플레이어가 쓰러졌습니다. 재시작 후 회피 타이밍을 다시 확인하세요.'
  }

  const sync = (payload: Partial<BattleHudState>) => {
    if (payload.skills) {
      state.skills = payload.skills
    }

    Object.assign(state, {
      ...payload,
      skills: state.skills
    })
  }

  return {
    state,
    currentSetup,
    configureSetup,
    startLoading,
    startCountdown,
    startPractice,
    startRun,
    returnToMenu,
    setResult,
    sync
  }
}
