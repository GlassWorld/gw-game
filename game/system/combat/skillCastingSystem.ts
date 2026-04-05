import { createHazard } from '~/game/effect/hazard'
import { createProjectile } from '~/game/effect/projectile'
import type { BattleRuntime, SkillDefinition, Vec2 } from '~/game/core/types'

function normalize(vector: Vec2) {
  const length = Math.hypot(vector.x, vector.y) || 1

  return {
    x: vector.x / length,
    y: vector.y / length
  }
}

export function castSelectedSkill(runtime: BattleRuntime, skill: SkillDefinition) {
  const player = runtime.player
  const aimTarget = runtime.input.aimWorld
  const fallbackTarget = runtime.boss
  const hasAim = Math.hypot(aimTarget.x - player.x, aimTarget.y - player.y) > 1
  const direction = normalize({
    x: (hasAim ? aimTarget.x : fallbackTarget.x) - player.x,
    y: (hasAim ? aimTarget.y : fallbackTarget.y) - player.y
  })

  if (skill.effect.type === 'projectile_fan') {
    const count = skill.effect.projectileCount ?? 3
    const spread = skill.effect.spread ?? 0.18
    const baseAngle = Math.atan2(direction.y, direction.x)
    const start = -((count - 1) / 2)

    for (let index = 0; index < count; index += 1) {
      const angle = baseAngle + (start + index) * spread
      runtime.projectiles.push(createProjectile({
        id: `proj-${runtime.nextId++}`,
        x: player.x + Math.cos(angle) * (player.radius + 8),
        y: player.y + Math.sin(angle) * (player.radius + 8),
        radius: skill.effect.projectileRadius ?? 8,
        faction: 'player',
        damage: skill.effect.damage,
        vx: Math.cos(angle) * (skill.effect.projectileSpeed ?? 760),
        vy: Math.sin(angle) * (skill.effect.projectileSpeed ?? 760),
        ttlMs: skill.effect.projectileLifetimeMs ?? 1000,
        color: skill.effect.color
      }))
    }
    return
  }

  if (skill.effect.type === 'projectile_shot') {
    runtime.projectiles.push(createProjectile({
      id: `proj-${runtime.nextId++}`,
      x: player.x + direction.x * (player.radius + 8),
      y: player.y + direction.y * (player.radius + 8),
      radius: skill.effect.projectileRadius ?? 10,
      faction: 'player',
      damage: skill.effect.damage,
      vx: direction.x * (skill.effect.projectileSpeed ?? 880),
      vy: direction.y * (skill.effect.projectileSpeed ?? 880),
      ttlMs: skill.effect.projectileLifetimeMs ?? 1200,
      color: skill.effect.color
    }))
    return
  }

  if (skill.effect.type === 'aoe_burst') {
    runtime.hazards.push(createHazard({
      id: `hazard-${runtime.nextId++}`,
      x: player.x,
      y: player.y,
      radius: skill.effect.radius ?? 88,
      faction: 'player',
      damage: skill.effect.damage,
      telegraphMs: 0,
      ttlMs: Math.max(skill.effect.ttlMs ?? 220, 420),
      color: skill.effect.color
    }))
    return
  }

  if (skill.effect.type === 'ground_burst') {
    runtime.hazards.push(createHazard({
      id: `hazard-${runtime.nextId++}`,
      x: hasAim ? aimTarget.x : fallbackTarget.x,
      y: hasAim ? aimTarget.y : fallbackTarget.y,
      radius: skill.effect.radius ?? 84,
      faction: 'player',
      damage: skill.effect.damage,
      telegraphMs: skill.effect.telegraphMs ?? 300,
      ttlMs: Math.max(skill.effect.ttlMs ?? 900, (skill.effect.telegraphMs ?? 300) + 420),
      color: skill.effect.color
    }))
    return
  }

  runtime.hazards.push(createHazard({
    id: `hazard-${runtime.nextId++}`,
    x: player.x + direction.x * (skill.effect.offset ?? 48),
    y: player.y + direction.y * (skill.effect.offset ?? 48),
    radius: skill.effect.radius ?? 56,
    faction: 'player',
    damage: skill.effect.damage,
    telegraphMs: 0,
    ttlMs: Math.max(skill.effect.ttlMs ?? 180, 360),
    color: skill.effect.color
  }))
}
