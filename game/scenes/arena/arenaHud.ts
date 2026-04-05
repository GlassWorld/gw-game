import type { BattleHudState, BattleRuntime } from '~/game/core/types'
import { bossPatternDefinitions } from '~/game/boss/bossPatterns'
import { getSkillHudMeta } from '~/game/skill/skill'

export function createArenaHudPayload(runtime: BattleRuntime): Partial<BattleHudState> {
  return {
    playerHp: runtime.player.hp,
    playerMaxHp: runtime.player.maxHp,
    playerName: runtime.player.name,
    playerMp: Math.round(runtime.player.mp),
    playerMaxMp: runtime.player.maxMp,
    bossName: runtime.setup.bossName,
    bossHp: runtime.boss.hp,
    bossMaxHp: runtime.boss.maxHp,
    bossPhase: runtime.boss.phase,
    countdown: null,
    bossPatternLabel: runtime.boss.pattern === 'idle'
      ? '대기'
      : bossPatternDefinitions[runtime.boss.pattern as 'volley' | 'slam' | 'charge'].label,
    dashCooldownMs: runtime.player.dashCooldownMs,
    message: runtime.battleMessage,
    skills: Object.fromEntries(
      Object.values(runtime.skills).map((skill) => [
        skill.definition.id,
        {
          id: skill.definition.id,
          key: skill.key,
          label: skill.definition.label,
          iconLabel: getSkillHudMeta(skill.definition).iconLabel,
          color: getSkillHudMeta(skill.definition).color,
          cooldownMs: skill.definition.cooldownMs,
          remainingMs: skill.remainingMs
        }
      ])
    )
  }
}
