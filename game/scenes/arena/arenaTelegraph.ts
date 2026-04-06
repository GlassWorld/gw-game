import type Phaser from 'phaser'
import type { BattleRuntime, BossTelegraphState, SkillDefinition, Vec2 } from '~/game/core/types'
import type { BossBattleProfile } from '~/game/core/types'
import { projectQuarterView } from '~/game/system/render/renderSyncSystem'
import { normalizeVector } from '~/game/scenes/arena/arenaRuntime'

function sampleCirclePoints(center: Vec2, radius: number, scale: number) {
  const points: Vec2[] = []
  const steps = 36

  for (let index = 0; index <= steps; index += 1) {
    const angle = (Math.PI * 2 * index) / steps
    points.push({
      x: center.x + Math.cos(angle) * radius * scale,
      y: center.y + Math.sin(angle) * radius * scale
    })
  }

  return points
}

function sampleConePoints(telegraph: BossTelegraphState, scale: number) {
  const length = (telegraph.length ?? 320) * scale
  const halfAngle = (telegraph.angle ?? 0.7) * 0.5
  const baseAngle = Math.atan2(telegraph.direction.y, telegraph.direction.x)
  const points: Vec2[] = [{ ...telegraph.origin }]
  const steps = 18

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps
    const angle = baseAngle - halfAngle + ((halfAngle * 2) * t)
    points.push({
      x: telegraph.origin.x + Math.cos(angle) * length,
      y: telegraph.origin.y + Math.sin(angle) * length
    })
  }

  return points
}

function sampleLinePoints(telegraph: BossTelegraphState, scale: number) {
  const length = (telegraph.length ?? 300) * scale
  const width = (telegraph.width ?? 48) * (0.88 + scale * 0.12)
  const direction = normalizeVector(telegraph.direction)
  const normal = { x: -direction.y, y: direction.x }
  const end = {
    x: telegraph.origin.x + direction.x * length,
    y: telegraph.origin.y + direction.y * length
  }

  return [
    {
      x: telegraph.origin.x + normal.x * width,
      y: telegraph.origin.y + normal.y * width
    },
    {
      x: telegraph.origin.x - normal.x * width,
      y: telegraph.origin.y - normal.y * width
    },
    {
      x: end.x - normal.x * width,
      y: end.y - normal.y * width
    },
    {
      x: end.x + normal.x * width,
      y: end.y + normal.y * width
    }
  ]
}

function drawWorldPolygon(graphics: Phaser.GameObjects.Graphics, points: Vec2[]) {
  if (points.length === 0) {
    return
  }

  const first = projectQuarterView(points[0]!)
  graphics.beginPath()
  graphics.moveTo(first.x, first.y + 6)

  for (const point of points.slice(1)) {
    const projected = projectQuarterView(point)
    graphics.lineTo(projected.x, projected.y + 6)
  }

  graphics.closePath()
  graphics.fillPath()
  graphics.strokePath()
}

function drawTelegraphShape(graphics: Phaser.GameObjects.Graphics, telegraph: BossTelegraphState, scale: number) {
  if (telegraph.shape === 'circle') {
    drawWorldPolygon(graphics, sampleCirclePoints(telegraph.target, telegraph.radius ?? 64, scale))
    return
  }

  if (telegraph.shape === 'cone') {
    drawWorldPolygon(graphics, sampleConePoints(telegraph, scale))
    return
  }

  drawWorldPolygon(graphics, sampleLinePoints(telegraph, scale))
}

export function syncBossTelegraphs(options: {
  patternMarker?: Phaser.GameObjects.Graphics
  chargeTelegraph?: Phaser.GameObjects.Graphics
  runtime: BattleRuntime
  battleProfile: BossBattleProfile
  now: number
}) {
  const { patternMarker, chargeTelegraph, runtime, battleProfile, now } = options
  patternMarker?.clear()
  chargeTelegraph?.clear()

  const boss = runtime.boss
  if (!patternMarker || !chargeTelegraph || boss.pattern === 'idle') {
    return
  }

  const screen = projectQuarterView(boss)
  const telegraph = boss.telegraph
  const elapsedWave = Math.sin(now / 180) * 0.5 + 0.5

  if (!telegraph) {
    const patternColor = boss.pattern === 'volley'
      ? battleProfile.volleyColor
      : boss.pattern === 'slam'
        ? battleProfile.slamColor
        : battleProfile.chargeColor

    patternMarker.lineStyle(3, patternColor, 0.8)
    patternMarker.fillStyle(patternColor, 0.1 + elapsedWave * 0.08)
    patternMarker.setDepth(screen.y - 3)
    patternMarker.fillEllipse(screen.x, screen.y + 10, 150 + elapsedWave * 14, 84 + elapsedWave * 10)
    patternMarker.strokeEllipse(screen.x, screen.y + 10, 150 + elapsedWave * 14, 84 + elapsedWave * 10)
    return
  }

  const progress = 1 - (telegraph.remainingMs / Math.max(telegraph.durationMs, 1))
  const blink = progress > 0.55 ? (Math.sin(now / 38) * 0.5 + 0.5) : progress
  const scale = 0.92 + progress * 0.08
  const fillAlpha = 0.1 + progress * 0.14 + blink * 0.08
  const lineAlpha = Math.min(1, 0.42 + progress * 0.38 + blink * 0.2)
  const lineWidth = telegraph.shape === 'line' ? 5 : 4

  patternMarker.setDepth(projectQuarterView(telegraph.target).y - 4)
  patternMarker.lineStyle(lineWidth, telegraph.color, lineAlpha)
  patternMarker.fillStyle(telegraph.color, fillAlpha)
  drawTelegraphShape(patternMarker, telegraph, scale)

  if (telegraph.shape === 'line') {
    const target = projectQuarterView({
      x: telegraph.origin.x + telegraph.direction.x * (telegraph.length ?? 260),
      y: telegraph.origin.y + telegraph.direction.y * (telegraph.length ?? 260)
    })
    chargeTelegraph.setDepth(target.y + 2)
    chargeTelegraph.lineStyle(3, 0xfff1c9, 0.6 + blink * 0.35)
    chargeTelegraph.strokeCircle(target.x, target.y, 10 + blink * 5)
    chargeTelegraph.lineBetween(screen.x, screen.y - 4, target.x, target.y)
  }
}

export function drawPlayerSkillPreview(options: {
  preview?: Phaser.GameObjects.Graphics
  runtime: BattleRuntime
  skill: SkillDefinition
}) {
  const { preview, runtime, skill } = options
  if (!preview) {
    return
  }

  preview.clear()

  const player = runtime.player
  const aimTarget = runtime.input.aimWorld
  const hasAim = Math.hypot(aimTarget.x - player.x, aimTarget.y - player.y) > 1
  const fallbackTarget = runtime.boss
  const direction = normalizeVector({
    x: (hasAim ? aimTarget.x : fallbackTarget.x) - player.x,
    y: (hasAim ? aimTarget.y : fallbackTarget.y) - player.y
  })
  const playerScreen = projectQuarterView(player)
  const targetWorld = hasAim ? aimTarget : fallbackTarget
  const targetScreen = projectQuarterView(targetWorld)
  const previewColor = skill.effect.color

  preview.setDepth(playerScreen.y + 4)
  preview.lineStyle(4, previewColor, 0.92)
  preview.fillStyle(previewColor, 0.2)

  if (skill.effect.type === 'projectile_shot') {
    preview.lineBetween(playerScreen.x, playerScreen.y, targetScreen.x, targetScreen.y)
    preview.fillCircle(targetScreen.x, targetScreen.y, 8)
    return
  }

  if (skill.effect.type === 'projectile_fan') {
    const count = skill.effect.projectileCount ?? 3
    const spread = skill.effect.spread ?? 0.18
    const baseAngle = Math.atan2(direction.y, direction.x)
    const start = -((count - 1) / 2)

    for (let index = 0; index < count; index += 1) {
      const angle = baseAngle + (start + index) * spread
      const worldPoint = {
        x: player.x + Math.cos(angle) * 260,
        y: player.y + Math.sin(angle) * 260
      }
      const screenPoint = projectQuarterView(worldPoint)
      preview.lineBetween(playerScreen.x, playerScreen.y, screenPoint.x, screenPoint.y)
    }
    return
  }

  if (skill.effect.type === 'aoe_burst') {
    preview.strokeEllipse(playerScreen.x, playerScreen.y + 6, (skill.effect.radius ?? 88) * 2.2, (skill.effect.radius ?? 88) * 1.3)
    preview.fillEllipse(playerScreen.x, playerScreen.y + 6, (skill.effect.radius ?? 88) * 2.2, (skill.effect.radius ?? 88) * 1.3)
    return
  }

  if (skill.effect.type === 'ground_burst') {
    preview.strokeEllipse(targetScreen.x, targetScreen.y + 6, (skill.effect.radius ?? 84) * 2.2, (skill.effect.radius ?? 84) * 1.3)
    preview.fillEllipse(targetScreen.x, targetScreen.y + 6, (skill.effect.radius ?? 84) * 2.2, (skill.effect.radius ?? 84) * 1.3)
    return
  }

  const cleavePoint = {
    x: player.x + direction.x * (skill.effect.offset ?? 48),
    y: player.y + direction.y * (skill.effect.offset ?? 48)
  }
  const cleaveScreen = projectQuarterView(cleavePoint)
  preview.strokeEllipse(cleaveScreen.x, cleaveScreen.y + 6, (skill.effect.radius ?? 56) * 2.15, (skill.effect.radius ?? 56) * 1.22)
  preview.fillEllipse(cleaveScreen.x, cleaveScreen.y + 6, (skill.effect.radius ?? 56) * 2.15, (skill.effect.radius ?? 56) * 1.22)
}

export function syncPlayerSkillPreview(preview: Phaser.GameObjects.Graphics | undefined, now: number, until: number) {
  if (!preview) {
    return
  }

  if (now > until) {
    preview.clear()
  }
}
