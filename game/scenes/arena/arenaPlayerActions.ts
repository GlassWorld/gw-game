import { BOSS_STATS, PLAYER_STATS } from '~/game/core/constants'
import type { BattleRuntime, SkillDefinition } from '~/game/core/types'
import { bossPatternDefinitions } from '~/game/boss/bossPatterns'
import { isTargetInBasicAttackRange, performPlayerBasicAttack } from '~/game/system/combat/basicAttackSystem'
import { castSelectedSkill } from '~/game/system/combat/skillCastingSystem'
import { normalizeVector } from '~/game/scenes/arena/arenaRuntime'

export function handleArenaPlayerActions(options: {
  runtime: BattleRuntime
  deltaMs: number
  onShowSkillPreview: (skill: SkillDefinition) => void
}) {
  const { runtime, deltaMs, onShowSkillPreview } = options
  const player = runtime.player
  const boss = runtime.boss
  const aim = normalizeVector({
    x: runtime.input.aimWorld.x - player.x,
    y: runtime.input.aimWorld.y - player.y
  })

  if (runtime.input.dashPressed && player.dashCooldownMs === 0) {
    player.dashVector = aim
    player.dashMsRemaining = PLAYER_STATS.dashDurationMs
    player.dashCooldownMs = 1600
    player.invulnerableMs = Math.max(player.invulnerableMs, 180)
    player.moveTarget = null
  }

  player.mp = Math.min(player.maxMp, player.mp + (player.mpRegenPerSecond * deltaMs) / 1000)

  if (player.basicAttackCooldownMs === 0 && isTargetInBasicAttackRange(player, boss)) {
    performPlayerBasicAttack(runtime, player, boss)
    player.basicAttackCooldownMs = player.basicAttack.cooldownMs
    player.attackAnimMs = 220
  }

  const slotOrder = ['q', 'w', 'e'] as const
  for (const [index, skillId] of runtime.setup.selectedSkillIds.entries()) {
    const skillState = runtime.skills[skillId]
    if (!skillState) {
      continue
    }

    const slotKey = slotOrder[index]
    if (!slotKey || !runtime.input.skillPressed[slotKey]) {
      continue
    }

    if (skillState.remainingMs > 0 || player.mp < skillState.definition.mpCost) {
      continue
    }

    onShowSkillPreview(skillState.definition)
    castSelectedSkill(runtime, skillState.definition)
    player.mp = Math.max(0, player.mp - skillState.definition.mpCost)
    skillState.remainingMs = skillState.definition.cooldownMs
    player.attackAnimMs = 260
    runtime.battleMessage = `${skillState.definition.label} 시전`
    break
  }

  if (boss.hp <= boss.maxHp * BOSS_STATS.phaseTwoThreshold && boss.phase === 2) {
    runtime.battleMessage = '2페이즈. 투사체 수와 패턴 속도가 강화되었습니다.'
  } else if (boss.pattern !== 'idle' && boss.patternStepMs === 0) {
    runtime.battleMessage = `${bossPatternDefinitions[boss.pattern as 'volley' | 'slam' | 'charge'].label} 대응 중`
  }
}
