import { createGameConfig } from '~/game/core/config'
import type { BattleHudState, BattleResult, BattleSetup } from '~/game/core/types'
import type { Game } from 'phaser'
import type { BossArenaScene } from '~/game/scenes/BossArenaScene'

type BattleStateComposable = {
  configureSetup: (setup: BattleSetup) => void
  sync: (payload: Partial<BattleHudState>) => void
  startLoading: () => void
  startCountdown: (countdown: number) => void
  startPractice: () => void
  startRun: () => void
  setResult: (result: BattleResult) => void
}

export function useGameBootstrap(options: {
  battleState: BattleStateComposable
  onBattleEnd?: (result: BattleResult) => void | Promise<void>
}) {
  const containerId = 'boss-stage'
  let phaserGame: Game | null = null
  let sceneRef: BossArenaScene | null = null
  let pendingAction: 'practice' | 'start' | 'restart' | null = null
  let loadingTimer: ReturnType<typeof setTimeout> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let initializing = false
  let currentSetup: BattleSetup | null = null

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const resolveContainer = async () => {
    if (!import.meta.client) {
      return null
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const element = document.getElementById(containerId)
      if (element) {
        return element
      }

      await nextTick()
      await wait(25)
    }

    return null
  }

  const mountGame = async (setup: BattleSetup) => {
    if (phaserGame && sceneRef) {
      currentSetup = setup
      sceneRef.applySetup(setup)
      return
    }

    if (initializing || !import.meta.client) {
      return
    }

    initializing = true
    currentSetup = setup
    const parentElement = await resolveContainer()
    if (!parentElement) {
      initializing = false
      return
    }

    const [{ default: Phaser }, { BossArenaScene }] = await Promise.all([
      import('phaser'),
      import('~/game/scenes/BossArenaScene')
    ])

    const scene = new BossArenaScene({
      setup,
      onHudUpdate: (payload: Partial<BattleHudState>) => options.battleState.sync(payload),
      onBattleEnd: (result) => {
        if (options.onBattleEnd) {
          void options.onBattleEnd(result)
          return
        }

        options.battleState.setResult(result)
      }
    })

    phaserGame = new Phaser.Game(createGameConfig(Phaser, { parent: parentElement, scene }))
    sceneRef = scene
    initializing = false

    if (pendingAction === 'practice') {
      sceneRef.startPractice()
    } else if (pendingAction === 'start') {
      sceneRef.startBattle()
    } else if (pendingAction === 'restart') {
      sceneRef.restartBattle()
    }

    pendingAction = null
  }

  const destroyGame = () => {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }

    phaserGame?.destroy(true)
    phaserGame = null
    sceneRef = null
    pendingAction = null
    initializing = false
    currentSetup = null
  }

  onBeforeUnmount(() => {
    destroyGame()
  })

  const runAfterLoading = (action: 'start' | 'restart', setup?: BattleSetup) => {
    const activeSetup = setup ?? currentSetup
    if (!activeSetup) {
      return
    }

    currentSetup = activeSetup
    sceneRef?.applySetup(activeSetup)
    options.battleState.configureSetup(activeSetup)

    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }

    options.battleState.startLoading()
    loadingTimer = setTimeout(() => {
      let countdown = 3
      options.battleState.startCountdown(countdown)
      countdownTimer = setInterval(() => {
        countdown -= 1
        options.battleState.startCountdown(countdown)

        if (countdown <= 0) {
          if (countdownTimer) {
            clearInterval(countdownTimer)
            countdownTimer = null
          }

          options.battleState.startRun()

          if (sceneRef) {
            if (action === 'start') {
              sceneRef.startBattle()
            } else {
              sceneRef.restartBattle()
            }
          } else {
            pendingAction = action
          }
        }
      }, 1000)
      loadingTimer = null
    }, 500)
  }

  const startPractice = (setup: BattleSetup) => {
    currentSetup = setup
    sceneRef?.applySetup(setup)
    options.battleState.configureSetup(setup)
    options.battleState.startPractice()

    if (sceneRef) {
      sceneRef.startPractice()
    } else {
      pendingAction = 'practice'
    }
  }

  return {
    containerId,
    mountGame,
    destroyGame,
    startPractice,
    startGame: (setup: BattleSetup) => runAfterLoading('start', setup),
    restartGame: () => runAfterLoading('restart')
  }
}
