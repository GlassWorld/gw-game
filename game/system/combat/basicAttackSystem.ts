import { createHazard } from '~/game/effect/hazard'
import { createProjectile } from '~/game/effect/projectile'
import type { BasicAttackProfile, BattleRuntime, BossEntity, PlayerEntity, Vec2 } from '~/game/core/types'

function normalize(vector: Vec2) {
  const length = Math.hypot(vector.x, vector.y) || 1

  return {
    x: vector.x / length,
    y: vector.y / length
  }
}

function getDistance(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function isTargetInBasicAttackRange(
  attacker: { x: number, y: number, radius: number, basicAttack: BasicAttackProfile },
  target: { x: number, y: number, radius: number }
) {
  return getDistance(attacker, target) <= attacker.basicAttack.range + attacker.radius + target.radius
}

export function performPlayerBasicAttack(runtime: BattleRuntime, player: PlayerEntity, boss: BossEntity) {
  const profile = player.basicAttack
  const direction = normalize({
    x: boss.x - player.x,
    y: boss.y - player.y
  })

  if (profile.mode === 'ranged') {
    runtime.projectiles.push(createProjectile({
      id: `proj-${runtime.nextId++}`,
      x: player.x + direction.x * (player.radius + 4),
      y: player.y + direction.y * (player.radius + 4),
      radius: profile.projectileRadius ?? 8,
      faction: 'player',
      damage: profile.damage,
      vx: direction.x * (profile.projectileSpeed ?? 640),
      vy: direction.y * (profile.projectileSpeed ?? 640),
      ttlMs: profile.projectileLifetimeMs ?? 1600,
      color: profile.color
    }))
    return
  }

  runtime.hazards.push(createHazard({
    id: `hazard-${runtime.nextId++}`,
    x: player.x + direction.x * (profile.hitOffset ?? player.radius + 18),
    y: player.y + direction.y * (profile.hitOffset ?? player.radius + 18),
    radius: profile.hitRadius ?? 44,
    faction: 'player',
    damage: profile.damage,
    telegraphMs: 0,
    ttlMs: 120,
    color: profile.color
  }))
}
