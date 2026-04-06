import { COMBAT_TUNING } from '~/game/core/constants'
import type { BattleRuntime } from '~/game/core/types'

export function updateRuntimeTimers(runtime: BattleRuntime, deltaMs: number) {
  runtime.player.invulnerableMs = Math.max(0, runtime.player.invulnerableMs - deltaMs)
  runtime.player.basicAttackCooldownMs = Math.max(0, runtime.player.basicAttackCooldownMs - deltaMs)
  runtime.player.basicAttackSequenceDelayMs = Math.max(0, runtime.player.basicAttackSequenceDelayMs - deltaMs)
  runtime.player.attackAnimMs = Math.max(0, runtime.player.attackAnimMs - deltaMs)
  if (runtime.player.attackAnimMs === 0) {
    runtime.player.basicAttackVisualStep = 0
  }
  runtime.player.dashCooldownMs = Math.max(0, runtime.player.dashCooldownMs - deltaMs)
  runtime.player.hitFlashMs = Math.max(0, runtime.player.hitFlashMs - deltaMs)
  runtime.boss.hitFlashMs = Math.max(0, runtime.boss.hitFlashMs - deltaMs)

  if (runtime.boss.telegraph) {
    runtime.boss.telegraph.remainingMs = Math.max(0, runtime.boss.telegraph.remainingMs - deltaMs)
  }

  for (const skill of Object.values(runtime.skills)) {
    skill.remainingMs = Math.max(0, skill.remainingMs - deltaMs)
  }
}

export function applyDamageInvulnerability(runtime: BattleRuntime) {
  runtime.player.invulnerableMs = COMBAT_TUNING.player.damageInvulnerabilityMs
}
