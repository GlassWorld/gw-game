import { BOSS_STATS } from '~/game/core/constants'
import type { BattleRuntime, BossPatternKey, Vec2 } from '~/game/core/types'
import { bossData, defaultBoss } from '~/game/boss/bossData'
import { bossPatternDefinitions, bossPhaseRotations } from '~/game/boss/bossPatterns'
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
  boss.patternStepMs = 900
  boss.velocity.x = 0
  boss.velocity.y = 0
  boss.chargeTarget = null

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

function spawnVolley(runtime: BattleRuntime) {
  const bossDefinition = getBossDefinition(runtime)
  const shots = runtime.boss.phase === 1 ? 5 : 7
  const spread = runtime.boss.phase === 1 ? 0.18 : 0.12
  const centerAngle = angleBetween(runtime.boss, runtime.player)
  const start = -((shots - 1) / 2)

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

function spawnHazard(runtime: BattleRuntime) {
  const bossDefinition = getBossDefinition(runtime)
  runtime.hazards.push(createHazard({
    id: `hazard-${runtime.nextId++}`,
    x: runtime.player.x,
    y: runtime.player.y,
    radius: runtime.boss.phase === 1 ? 58 : 78,
    faction: 'boss',
    damage: runtime.boss.phase === 1 ? 18 : 26,
    telegraphMs: runtime.boss.phase === 1 ? 1000 : 760,
    ttlMs: runtime.boss.phase === 1 ? 1500 : 1280,
    color: bossDefinition.battleProfile.slamColor
  }))
}

function startCharge(runtime: BattleRuntime) {
  const boss = runtime.boss
  const target = { x: runtime.player.x, y: runtime.player.y }
  const direction = normalize({ x: target.x - boss.x, y: target.y - boss.y })
  const speed = boss.phase === 1 ? BOSS_STATS.chargeSpeed : BOSS_STATS.chargeSpeed * 1.18

  boss.chargeTarget = target
  boss.velocity.x = direction.x * speed
  boss.velocity.y = direction.y * speed
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
  boss.actionElapsedMs += deltaMs
  boss.patternStepMs = Math.max(0, boss.patternStepMs - deltaMs)

  if (boss.actionElapsedMs >= intervalMs) {
    boss.actionElapsedMs = 0

    if (boss.pattern === 'volley') {
      spawnVolley(runtime)
    } else if (boss.pattern === 'slam') {
      spawnHazard(runtime)
    } else if (boss.pattern === 'charge') {
      startCharge(runtime)
    }
  }

  if (boss.patternElapsedMs >= durationMs) {
    advanceToNextPattern(runtime)
  }
}
