import { ARENA_HEIGHT, ARENA_WIDTH, PROJECTILE_LIMITS } from '~/game/core/constants'
import type { BattleRuntime } from '~/game/core/types'

export function updateProjectiles(runtime: BattleRuntime, deltaMs: number) {
  const deltaSeconds = deltaMs / 1000

  for (const projectile of runtime.projectiles) {
    projectile.x += projectile.vx * deltaSeconds
    projectile.y += projectile.vy * deltaSeconds
    projectile.elapsedMs += deltaMs

    if (
      projectile.elapsedMs >= Math.min(projectile.ttlMs, PROJECTILE_LIMITS.maxLifetimeMs) ||
      projectile.x < -40 ||
      projectile.y < -40 ||
      projectile.x > ARENA_WIDTH + 40 ||
      projectile.y > ARENA_HEIGHT + 40
    ) {
      projectile.alive = false
    }
  }

  for (const hazard of runtime.hazards) {
    hazard.elapsedMs += deltaMs

    if (!hazard.triggered && hazard.elapsedMs >= hazard.telegraphMs) {
      hazard.triggered = true
    }

    if (hazard.elapsedMs >= hazard.ttlMs) {
      hazard.alive = false
    }
  }
}
