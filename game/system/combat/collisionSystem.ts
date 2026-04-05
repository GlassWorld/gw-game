import { BOSS_STATS } from '~/game/core/constants'
import type { BattleRuntime, EntityBase } from '~/game/core/types'
import { applyDamageInvulnerability } from '~/game/system/time/runtimeTimerSystem'

function isColliding(a: EntityBase, b: EntityBase) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= a.radius + b.radius
}

function damagePlayer(runtime: BattleRuntime, amount: number) {
  if (runtime.player.invulnerableMs > 0 || runtime.result) {
    return
  }

  runtime.player.hp = Math.max(0, runtime.player.hp - amount)
  applyDamageInvulnerability(runtime)
  runtime.battleMessage = '피격. 짧은 무적 시간 동안 재정비할 수 있습니다.'

  if (runtime.player.hp <= 0) {
    runtime.player.alive = false
    runtime.result = 'defeat'
  }
}

function damageBoss(runtime: BattleRuntime, amount: number) {
  if (runtime.result) {
    return
  }

  if (runtime.setup.mode === 'practice') {
    runtime.boss.hp = Math.max(1, runtime.boss.hp - amount)

    if (runtime.boss.hp <= 1) {
      runtime.boss.hp = runtime.boss.maxHp
      runtime.battleMessage = '연습 표적이 복구되었습니다. 계속 스킬을 시험해볼 수 있습니다.'
    }
    return
  }

  runtime.boss.hp = Math.max(0, runtime.boss.hp - amount)

  if (runtime.boss.hp <= 0) {
    runtime.boss.alive = false
    runtime.result = 'victory'
  }
}

export function resolveCollisions(runtime: BattleRuntime, deltaMs: number) {
  for (const projectile of runtime.projectiles) {
    if (!projectile.alive) {
      continue
    }

    if (projectile.faction === 'boss' && isColliding(projectile, runtime.player)) {
      projectile.alive = false
      damagePlayer(runtime, projectile.damage)
      continue
    }

    if (projectile.faction === 'player' && isColliding(projectile, runtime.boss)) {
      projectile.alive = false
      damageBoss(runtime, projectile.damage)
    }
  }

  for (const hazard of runtime.hazards) {
    if (!hazard.alive || !hazard.triggered) {
      continue
    }

    if (hazard.faction === 'boss' && isColliding(hazard, runtime.player)) {
      hazard.alive = false
      damagePlayer(runtime, hazard.damage)
      continue
    }

    if (hazard.faction === 'player' && isColliding(hazard, runtime.boss)) {
      hazard.alive = false
      damageBoss(runtime, hazard.damage)
    }
  }

  if (Math.hypot(runtime.boss.velocity.x, runtime.boss.velocity.y) > BOSS_STATS.moveSpeed * 1.2 && isColliding(runtime.player, runtime.boss)) {
    damagePlayer(runtime, BOSS_STATS.contactDamage)
    runtime.boss.velocity.x = 0
    runtime.boss.velocity.y = 0
    runtime.boss.chargeTarget = null
  }
}
