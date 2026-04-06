import { BOSS_STATS, COMBAT_TUNING } from '~/game/core/constants'
import type { BattleRuntime, BossPatternKey, BossTelegraphState, Vec2 } from '~/game/core/types'
import { bossData, defaultBoss } from '~/game/boss/bossData'
import { bossPatternDefinitions, bossPhaseRotations } from '~/game/boss/bossPatterns'
import { queueCombatEvent } from '~/game/system/combat/combatFeedback'
import { createHazard } from '~/game/effect/hazard'
import { createProjectile } from '~/game/effect/projectile'

function normalize(vector: Vec2) {
  const length = Math.hypot(vector.x, vector.y) || 1

  return {
    x: vector.x / length,
    y: vector.y / length
  }
}

function angleBetween(from: Vec2, to: Vec2) {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

function getBossDefinition(runtime: BattleRuntime) {
  return bossData.find((boss) => boss.id === runtime.setup.bossId) ?? defaultBoss
}

function startPattern(runtime: BattleRuntime, pattern: BossPatternKey) {
  const boss = runtime.boss
  boss.pattern = pattern
  boss.patternElapsedMs = 0
  boss.actionElapsedMs = 0
  boss.patternStepMs = 0
  boss.velocity.x = 0
  boss.velocity.y = 0
  boss.chargeTarget = null
  boss.telegraph = null

  if (pattern !== 'idle') {
    runtime.battleMessage = `${bossPatternDefinitions[pattern as 'volley' | 'slam' | 'charge'].label} 시작`
  }
}

function advanceToNextPattern(runtime: BattleRuntime) {
  const boss = runtime.boss
  const rotation = bossPhaseRotations[boss.phase]
  const nextPattern = rotation[boss.patternIndex % rotation.length]
  boss.patternIndex += 1
  startPattern(runtime, nextPattern)
}

function spawnVolley(runtime: BattleRuntime, telegraph: BossTelegraphState) {
  const bossDefinition = getBossDefinition(runtime)
  const shots = runtime.boss.phase === 1 ? 5 : 7
  const spread = runtime.boss.phase === 1 ? 0.18 : 0.12
  const centerAngle = Math.atan2(telegraph.direction.y, telegraph.direction.x)
  const start = -((shots - 1) / 2)

  queueCombatEvent(runtime, {
    type: 'attack',
    actor: 'boss',
    position: { x: runtime.boss.x, y: runtime.boss.y },
    target: telegraph.target,
    color: bossDefinition.battleProfile.volleyColor,
    shape: 'burst'
  })

  for (let i = 0; i < shots; i += 1) {
    const angle = centerAngle + (start + i) * spread
    runtime.projectiles.push(createProjectile({
      id: `proj-${runtime.nextId++}`,
      x: runtime.boss.x,
      y: runtime.boss.y,
      radius: 12,
      faction: 'boss',
      damage: runtime.boss.phase === 1 ? 10 : 13,
      vx: Math.cos(angle) * (runtime.boss.phase === 1 ? 240 : 300),
      vy: Math.sin(angle) * (runtime.boss.phase === 1 ? 240 : 300),
      ttlMs: 3200,
      color: bossDefinition.battleProfile.volleyColor
    }))
  }
}

function spawnHazard(runtime: BattleRuntime, telegraph: BossTelegraphState) {
  const bossDefinition = getBossDefinition(runtime)
  queueCombatEvent(runtime, {
    type: 'attack',
    actor: 'boss',
    position: telegraph.target,
    target: telegraph.target,
    color: bossDefinition.battleProfile.slamColor,
    shape: 'burst'
  })
  runtime.hazards.push(createHazard({
    id: `hazard-${runtime.nextId++}`,
    x: telegraph.target.x,
    y: telegraph.target.y,
    radius: runtime.boss.phase === 1 ? 58 : 78,
    faction: 'boss',
    damage: runtime.boss.phase === 1 ? 18 : 26,
    telegraphMs: 0,
    ttlMs: runtime.boss.phase === 1 ? 420 : 520,
    color: bossDefinition.battleProfile.slamColor
  }))
}

function startCharge(runtime: BattleRuntime, telegraph: BossTelegraphState) {
  const boss = runtime.boss
  const target = telegraph.target
  const direction = normalize(telegraph.direction)
  const speed = boss.phase === 1 ? BOSS_STATS.chargeSpeed : BOSS_STATS.chargeSpeed * 1.18

  boss.chargeTarget = target
  boss.velocity.x = direction.x * speed
  boss.velocity.y = direction.y * speed
  queueCombatEvent(runtime, {
    type: 'attack',
    actor: 'boss',
    position: { x: boss.x, y: boss.y },
    target,
    color: getBossDefinition(runtime).battleProfile.chargeColor,
    shape: 'charge'
  })
}

function createPatternTelegraph(runtime: BattleRuntime, pattern: Exclude<BossPatternKey, 'idle'>): BossTelegraphState {
  const boss = runtime.boss
  const bossDefinition = getBossDefinition(runtime)
  const target = { x: runtime.player.x, y: runtime.player.y }
  const direction = normalize({ x: target.x - boss.x, y: target.y - boss.y })
  const distance = Math.hypot(target.x - boss.x, target.y - boss.y)

  if (pattern === 'volley') {
    return {
      pattern,
      shape: 'cone',
      durationMs: COMBAT_TUNING.boss.telegraphMs.volley,
      remainingMs: COMBAT_TUNING.boss.telegraphMs.volley,
      color: bossDefinition.battleProfile.volleyColor,
      origin: { x: boss.x, y: boss.y },
      target,
      direction,
      length: Math.max(320, Math.min(520, distance + 100)),
      angle: boss.phase === 1 ? 0.68 : 0.92
    }
  }

  if (pattern === 'slam') {
    return {
      pattern,
      shape: 'circle',
      durationMs: COMBAT_TUNING.boss.telegraphMs.slam,
      remainingMs: COMBAT_TUNING.boss.telegraphMs.slam,
      color: bossDefinition.battleProfile.slamColor,
      origin: { x: boss.x, y: boss.y },
      target,
      direction,
      radius: boss.phase === 1 ? 58 : 78
    }
  }

  return {
    pattern,
    shape: 'line',
    durationMs: COMBAT_TUNING.boss.telegraphMs.charge,
    remainingMs: COMBAT_TUNING.boss.telegraphMs.charge,
    color: bossDefinition.battleProfile.chargeColor,
    origin: { x: boss.x, y: boss.y },
    target,
    direction,
    length: Math.max(260, Math.min(760, distance + boss.radius * 2)),
    width: boss.radius * 1.3
  }
}

function beginTelegraph(runtime: BattleRuntime, pattern: Exclude<BossPatternKey, 'idle'>) {
  const telegraph = createPatternTelegraph(runtime, pattern)
  runtime.boss.telegraph = telegraph
  runtime.boss.patternStepMs = telegraph.durationMs
  runtime.boss.actionElapsedMs = 0
  queueCombatEvent(runtime, {
    type: 'cast',
    actor: 'boss',
    position: telegraph.origin,
    target: telegraph.target,
    color: telegraph.color,
    shape: telegraph.shape
  })
}

function executeTelegraphedAction(runtime: BattleRuntime, telegraph: BossTelegraphState) {
  if (telegraph.pattern === 'volley') {
    spawnVolley(runtime, telegraph)
  } else if (telegraph.pattern === 'slam') {
    spawnHazard(runtime, telegraph)
  } else {
    startCharge(runtime, telegraph)
  }

  runtime.boss.telegraph = null
  runtime.boss.patternStepMs = 0
}

export function updateBossAi(runtime: BattleRuntime, deltaMs: number) {
  const boss = runtime.boss
  const bossDefinition = getBossDefinition(runtime)

  if (!runtime.running || !boss.alive || runtime.result) {
    return
  }

  if (boss.phase === 1 && boss.hp <= boss.maxHp * BOSS_STATS.phaseTwoThreshold) {
    boss.phase = 2
    boss.patternIndex = 0
    startPattern(runtime, 'volley')
    boss.patternStepMs = 1400
    runtime.battleMessage = '2페이즈 진입. 패턴 속도가 빨라졌습니다.'
  }

  if (boss.pattern === 'idle') {
    advanceToNextPattern(runtime)
  }

  const pattern = bossPatternDefinitions[boss.pattern as 'volley' | 'slam' | 'charge']
  const pace = (boss.phase === 1 ? 1 : 0.78) / bossDefinition.battleProfile.speedMultiplier
  const durationMs = pattern.durationMs * pace
  const intervalMs = pattern.intervalMs * pace

  boss.patternElapsedMs += deltaMs
  if (boss.telegraph) {
    boss.patternStepMs = boss.telegraph.remainingMs

    if (boss.telegraph.remainingMs === 0) {
      executeTelegraphedAction(runtime, boss.telegraph)
    }
  } else {
    boss.actionElapsedMs += deltaMs
  }

  if (boss.actionElapsedMs >= intervalMs && !boss.telegraph && boss.pattern !== 'idle') {
    beginTelegraph(runtime, boss.pattern)
  }

  if (boss.patternElapsedMs >= durationMs && !boss.telegraph) {
    advanceToNextPattern(runtime)
  }
}
