import { GAME_WIDTH } from '~/game/core/constants'
import type { EntityBase, HazardEntity, Vec2 } from '~/game/core/types'

const ORIGIN = {
  x: GAME_WIDTH / 2,
  y: 220
}

export function projectQuarterView(point: Vec2) {
  return {
    x: ORIGIN.x + (point.x - point.y),
    y: ORIGIN.y + (point.x + point.y) * 0.5
  }
}

export function screenToWorld(point: Vec2) {
  const dx = point.x - ORIGIN.x
  const dy = 2 * (point.y - ORIGIN.y)

  return {
    x: (dx + dy) * 0.5,
    y: (dy - dx) * 0.5
  }
}

export function syncDisplay(entity: EntityBase) {
  if (!entity.display?.setPosition || !entity.display?.setDepth) {
    return
  }

  const screen = projectQuarterView(entity)
  entity.display.setPosition(screen.x, screen.y)
  entity.display.setDepth(screen.y)
}

export function syncHazardDisplay(hazard: HazardEntity) {
  if (!hazard.display?.setPosition || !hazard.display?.setDepth || !hazard.display?.setAlpha) {
    return
  }

  const screen = projectQuarterView(hazard)
  hazard.display.setPosition(screen.x, screen.y + 6)
  hazard.display.setDepth(screen.y - 2)
  hazard.display.setAlpha(hazard.triggered ? 0.78 : 0.34)
}
