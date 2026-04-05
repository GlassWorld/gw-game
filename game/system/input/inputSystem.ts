import type { BattleRuntime, Vec2 } from '~/game/core/types'

export function captureInput(
  runtime: BattleRuntime,
  options: {
    aimWorld: Vec2
    attackHeld: boolean
    dashPressed: boolean
    skillPressed: Record<string, boolean>
  }
) {
  runtime.input.aimWorld = options.aimWorld
  runtime.input.attackHeld = options.attackHeld
  runtime.input.dashPressed = options.dashPressed
  runtime.input.skillPressed = options.skillPressed
}
