import type { BossCutsceneFrame } from '~/game/core/types'

export function useBossCutscene() {
  const activeFrames = ref<BossCutsceneFrame[]>([])
  const activeIndex = ref(0)
  let resolveCutscene: (() => void) | null = null

  const currentFrame = computed(() => activeFrames.value[activeIndex.value] ?? null)

  const clear = () => {
    activeFrames.value = []
    activeIndex.value = 0
  }

  const finish = () => {
    clear()
    if (resolveCutscene) {
      resolveCutscene()
      resolveCutscene = null
    }
  }

  const play = (frames: BossCutsceneFrame[]) => {
    if (frames.length === 0) {
      return Promise.resolve()
    }

    activeFrames.value = frames
    activeIndex.value = 0

    return new Promise<void>((resolve) => {
      resolveCutscene = resolve
    })
  }

  const advance = () => {
    if (activeIndex.value < activeFrames.value.length - 1) {
      activeIndex.value += 1
      return
    }

    finish()
  }

  const skip = () => {
    finish()
  }

  return {
    activeFrames,
    activeIndex,
    currentFrame,
    clear,
    finish,
    play,
    advance,
    skip
  }
}
