import { BOSS_STATS, COMBAT_TUNING } from '~/game/core/constants'
import type { BattleRuntime, EntityBase } from '~/game/core/types'
import { queueCombatEvent } from '~/game/system/combat/combatFeedback'
import { applyDamageInvulnerability } from '~/game/system/time/runtimeTimerSystem'

function isColliding(a: EntityBase, b: EntityBase, aScale = 1, bScale = 1) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= a.radius * aScale + b.radius * bScale
}

function damagePlayer(runtime: BattleRuntime, amount: number, hitPosition: { x: number, y: number }, color: number) {
  if (runtime.player.invulnerableMs > 0 || runtime.result) {
    queueCombatEvent(runtime, {
      type: 'dodge',
      actor: 'player',
      position: hitPosition,
      color
    })
    return false
  }

  runtime.player.hp = Math.max(0, runtime.player.hp - amount)
  runtime.player.hitFlashMs = COMBAT_TUNING.feedback.hitFlashMs
  applyDamageInvulnerability(runtime)
  queueCombatEvent(runtime, {
    type: 'hit',
    actor: 'player',
    position: hitPosition,
    color,
    heavy: amount >= 20
  })
  runtime.battleMessage = '피격. 짧은 무적 시간 동안 재정비할 수 있습니다.'

  if (runtime.player.hp <= 0) {
    runtime.player.alive = false
    runtime.result = 'defeat'
  }

  return true
}

function damageBoss(runtime: BattleRuntime, amount: number, hitPosition: { x: number, y: number }, color: number) {
  if (runtime.result) {
    return false
  }

  if (runtime.setup.mode === 'practice') {
    runtime.boss.hp = Math.max(1, runtime.boss.hp - amount)
    runtime.boss.hitFlashMs = COMBAT_TUNING.feedback.hitFlashMs
    queueCombatEvent(runtime, {
      type: 'hit',
      actor: 'boss',
      position: hitPosition,
      color,
      heavy: amount >= 28
    })

    if (runtime.boss.hp <= 1) {
      runtime.boss.hp = runtime.boss.maxHp
      runtime.battleMessage = '연습 표적이 복구되었습니다. 계속 스킬을 시험해볼 수 있습니다.'
    }
    return true
  }

  runtime.boss.hp = Math.max(0, runtime.boss.hp - amount)
  runtime.boss.hitFlashMs = COMBAT_TUNING.feedback.hitFlashMs
  queueCombatEvent(runtime, {
    type: 'hit',
    actor: 'boss',
    position: hitPosition,
    color,
    heavy: amount >= 28
  })

  if (runtime.boss.hp <= 0) {
    runtime.boss.alive = false
    runtime.result = 'victory'
  }

  return true
}

export function resolveCollisions(runtime: BattleRuntime, deltaMs: number) {
  for (const projectile of runtime.projectiles) {
    if (!projectile.alive) {
      continue
    }

    if (projectile.faction === 'boss' && isColliding(projectile, runtime.player, COMBAT_TUNING.boss.projectileHitboxScale, COMBAT_TUNING.player.hurtboxScale)) {
      projectile.alive = false
      damagePlayer(runtime, projectile.damage, { x: projectile.x, y: projectile.y }, projectile.color)
      continue
    }

    if (projectile.faction === 'player' && isColliding(projectile, runtime.boss, 1, COMBAT_TUNING.boss.hurtboxScale)) {
      projectile.alive = false
      damageBoss(runtime, projectile.damage, { x: projectile.x, y: projectile.y }, projectile.color)
    }
  }

  for (const hazard of runtime.hazards) {
    if (!hazard.alive || !hazard.triggered) {
      continue
    }

    if (hazard.faction === 'boss' && isColliding(hazard, runtime.player, COMBAT_TUNING.boss.hazardHitboxScale, COMBAT_TUNING.player.hurtboxScale)) {
      hazard.alive = false
      damagePlayer(runtime, hazard.damage, { x: hazard.x, y: hazard.y }, hazard.color)
      continue
    }

    if (hazard.faction === 'player' && isColliding(hazard, runtime.boss, 1, COMBAT_TUNING.boss.hurtboxScale)) {
      hazard.alive = false
      damageBoss(runtime, hazard.damage, { x: hazard.x, y: hazard.y }, hazard.color)
    }
  }

  if (
    Math.hypot(runtime.boss.velocity.x, runtime.boss.velocity.y) > BOSS_STATS.moveSpeed * 1.2
    && isColliding(runtime.player, runtime.boss, COMBAT_TUNING.player.hurtboxScale, COMBAT_TUNING.boss.contactHitboxScale)
  ) {
    damagePlayer(runtime, BOSS_STATS.contactDamage, { x: runtime.boss.x, y: runtime.boss.y }, 0xffd3a1)
    runtime.boss.velocity.x = 0
    runtime.boss.velocity.y = 0
    runtime.boss.chargeTarget = null
  }
}
