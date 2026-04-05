import { PLAYER_STATS } from '~/game/core/constants'
import type { BattleRuntime } from '~/game/core/types'

export function updateRuntimeTimers(runtime: BattleRuntime, deltaMs: number) {
  runtime.player.invulnerableMs = Math.max(0, runtime.player.invulnerableMs - deltaMs)
  runtime.player.basicAttackCooldownMs = Math.max(0, runtime.player.basicAttackCooldownMs - deltaMs)
  runtime.player.attackAnimMs = Math.max(0, runtime.player.attackAnimMs - deltaMs)
  runtime.player.dashCooldownMs = Math.max(0, runtime.player.dashCooldownMs - deltaMs)

  for (const skill of Object.values(runtime.skills)) {
    skill.remainingMs = Math.max(0, skill.remainingMs - deltaMs)
  }
}

export function applyDamageInvulnerability(runtime: BattleRuntime) {
  runtime.player.invulnerableMs = PLAYER_STATS.invulnerableMs
}
