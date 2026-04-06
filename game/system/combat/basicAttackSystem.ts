import { createHazard } from '~/game/effect/hazard'
import { createProjectile } from '~/game/effect/projectile'
import type { BasicAttackProfile, BattleRuntime, BossEntity, PlayerEntity, Vec2 } from '~/game/core/types'
import { COMBAT_TUNING } from '~/game/core/constants'
import { queueCombatEvent } from '~/game/system/combat/combatFeedback'

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
    queueCombatEvent(runtime, {
      type: 'attack',
      actor: 'player',
      position: { x: player.x, y: player.y },
      target: { x: boss.x, y: boss.y },
      color: profile.color,
      shape: 'shot'
    })
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

  queueCombatEvent(runtime, {
    type: 'attack',
    actor: 'player',
    position: { x: player.x, y: player.y },
    target: {
      x: player.x + direction.x * (profile.hitOffset ?? player.radius + 18),
      y: player.y + direction.y * (profile.hitOffset ?? player.radius + 18)
    },
    color: profile.color,
    shape: 'slash'
  })
  runtime.hazards.push(createHazard({
    id: `hazard-${runtime.nextId++}`,
    x: player.x + direction.x * (profile.hitOffset ?? player.radius + 18),
    y: player.y + direction.y * (profile.hitOffset ?? player.radius + 18),
    radius: profile.hitRadius ?? 44,
    faction: 'player',
    damage: profile.damage,
    telegraphMs: 0,
    ttlMs: 120,
    color: profile.color,
    showIndicator: false
  }))
}

export function startSwordsmanBasicAttackSequence(player: PlayerEntity) {
  player.basicAttackCooldownMs = COMBAT_TUNING.player.basicAttackComboCycleMs
  player.basicAttackSequenceStep = 1
  player.basicAttackSequenceDelayMs = 0
}

export function performSwordsmanBasicAttackSequence(runtime: BattleRuntime, player: PlayerEntity, boss: BossEntity) {
  const step = player.basicAttackSequenceStep
  if (step < 1 || step > 3) {
    return
  }

  const direction = normalize({
    x: boss.x - player.x,
    y: boss.y - player.y
  })
  const profile = player.basicAttack
  const color = profile.color
  player.basicAttackVisualStep = step

  if (step === 1) {
    const target = {
      x: player.x + direction.x * 62,
      y: player.y + direction.y * 62
    }
    queueCombatEvent(runtime, {
      type: 'attack',
      actor: 'player',
      position: { x: player.x, y: player.y },
      target,
      color,
      shape: 'slash'
    })
    runtime.hazards.push(createHazard({
      id: `hazard-${runtime.nextId++}`,
      x: target.x,
      y: target.y,
      radius: 58,
      faction: 'player',
      damage: profile.damage,
      telegraphMs: 0,
      ttlMs: 170,
      color,
      showIndicator: false
    }))
  } else if (step === 2) {
    const target = {
      x: player.x + direction.x * 104,
      y: player.y + direction.y * 104
    }
    queueCombatEvent(runtime, {
      type: 'attack',
      actor: 'player',
      position: { x: player.x, y: player.y },
      target,
      color,
      shape: 'charge'
    })
    runtime.hazards.push(createHazard({
      id: `hazard-${runtime.nextId++}`,
      x: target.x,
      y: target.y,
      radius: 30,
      faction: 'player',
      damage: profile.damage + 2,
      telegraphMs: 0,
      ttlMs: 110,
      color,
      showIndicator: false
    }))
  } else {
    queueCombatEvent(runtime, {
      type: 'attack',
      actor: 'player',
      position: { x: player.x, y: player.y },
      target: { x: player.x, y: player.y },
      color,
      shape: 'burst'
    })
    runtime.hazards.push(createHazard({
      id: `hazard-${runtime.nextId++}`,
      x: player.x,
      y: player.y,
      radius: 88,
      faction: 'player',
      damage: profile.damage + 4,
      telegraphMs: 0,
      ttlMs: 200,
      color,
      showIndicator: false
    }))
  }

  player.attackAnimMs = COMBAT_TUNING.player.basicAttackComboAnimMs
  if (step < 3) {
    player.basicAttackSequenceStep += 1
    player.basicAttackSequenceDelayMs = COMBAT_TUNING.player.basicAttackComboStepGapMs
  } else {
    player.basicAttackSequenceStep = 0
    player.basicAttackSequenceDelayMs = 0
  }
}
