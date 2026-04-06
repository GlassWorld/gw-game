import { ARENA_HEIGHT, ARENA_WIDTH, BOSS_STATS, COMBAT_TUNING, PLAYER_STATS, WORLD_PADDING } from '~/game/core/constants'
import type { BattleRuntime, Vec2 } from '~/game/core/types'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalize(vector: Vec2) {
  const length = Math.hypot(vector.x, vector.y) || 1

  return {
    x: vector.x / length,
    y: vector.y / length
  }
}

function moveToward(current: Vec2, target: Vec2, distance: number) {
  const dx = target.x - current.x
  const dy = target.y - current.y
  const length = Math.hypot(dx, dy)

  if (length === 0 || length <= distance) {
    return { ...target }
  }

  const direction = normalize({ x: dx, y: dy })

  return {
    x: current.x + direction.x * distance,
    y: current.y + direction.y * distance
  }
}

function clampActorPosition(position: Vec2, radius: number) {
  return {
    x: clamp(position.x, WORLD_PADDING + radius, ARENA_WIDTH - WORLD_PADDING - radius),
    y: clamp(position.y, WORLD_PADDING + radius, ARENA_HEIGHT - WORLD_PADDING - radius)
  }
}

export function updateMovement(runtime: BattleRuntime, deltaMs: number) {
  const deltaSeconds = deltaMs / 1000
  const player = runtime.player
  const boss = runtime.boss

  if (player.dashMsRemaining > 0) {
    const dashSpeed = PLAYER_STATS.dashDistance / (PLAYER_STATS.dashDurationMs / 1000)
    const next = {
      x: player.x + player.dashVector.x * dashSpeed * deltaSeconds,
      y: player.y + player.dashVector.y * dashSpeed * deltaSeconds
    }
    const clamped = clampActorPosition(next, player.radius)
    player.x = clamped.x
    player.y = clamped.y
    player.dashMsRemaining = Math.max(0, player.dashMsRemaining - deltaMs)
  } else if (player.moveTarget) {
    const next = moveToward(player, player.moveTarget, PLAYER_STATS.speed * deltaSeconds)
    const clamped = clampActorPosition(next, player.radius)
    player.x = clamped.x
    player.y = clamped.y

    if (Math.hypot(player.moveTarget.x - player.x, player.moveTarget.y - player.y) < 8) {
      player.moveTarget = null
    }
  }

  const bossNext = {
    x: boss.x + boss.velocity.x * deltaSeconds,
    y: boss.y + boss.velocity.y * deltaSeconds
  }
  const bossClamped = clampActorPosition(bossNext, boss.radius)
  boss.x = bossClamped.x
  boss.y = bossClamped.y

  if (boss.chargeTarget && Math.hypot(boss.chargeTarget.x - boss.x, boss.chargeTarget.y - boss.y) < COMBAT_TUNING.boss.chargeStopDistance) {
    boss.velocity.x = 0
    boss.velocity.y = 0
    boss.chargeTarget = null
  }

  if (!boss.chargeTarget && Math.hypot(boss.velocity.x, boss.velocity.y) > 0) {
    const friction = Math.max(0, 1 - 5.2 * deltaSeconds)
    boss.velocity.x *= friction
    boss.velocity.y *= friction

    if (Math.hypot(boss.velocity.x, boss.velocity.y) < BOSS_STATS.moveSpeed * 0.2) {
      boss.velocity.x = 0
      boss.velocity.y = 0
    }
  }
}
