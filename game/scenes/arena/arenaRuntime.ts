import { ARENA_HEIGHT, ARENA_WIDTH } from '~/game/core/constants'
import type { BattleRuntime, BattleSetup, Vec2 } from '~/game/core/types'
import { createBoss } from '~/game/boss/boss'
import { createPlayer } from '~/game/character/player'
import { buildLoadoutSummary } from '~/game/data/loadoutData'
import { createSkillStateMap } from '~/game/skill/skill'

export function createArenaRuntime(setup: BattleSetup): BattleRuntime {
  return {
    setup,
    player: createPlayer(setup.character, setup.loadout),
    boss: createBoss(),
    projectiles: [],
    hazards: [],
    skills: createSkillStateMap(setup.selectedSkillIds),
    input: {
      aimWorld: { x: 0, y: 0 },
      attackHeld: false,
      dashPressed: false,
      skillPressed: {}
    },
    result: null,
    running: false,
    nextId: 1,
    battleMessage: `전투 준비 완료 (${buildLoadoutSummary(setup.loadout)})`
  }
}

export function normalizeVector(vector: Vec2) {
  const length = Math.hypot(vector.x, vector.y) || 1

  return {
    x: vector.x / length,
    y: vector.y / length
  }
}

export function clampPointToArena(point: Vec2) {
  return {
    x: Math.min(ARENA_WIDTH, Math.max(0, point.x)),
    y: Math.min(ARENA_HEIGHT, Math.max(0, point.y))
  }
}
