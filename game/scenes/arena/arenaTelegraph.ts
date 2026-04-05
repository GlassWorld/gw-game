import type Phaser from 'phaser'
import type { BattleRuntime, SkillDefinition } from '~/game/core/types'
import type { BossBattleProfile } from '~/game/core/types'
import { projectQuarterView } from '~/game/system/render/renderSyncSystem'
import { normalizeVector } from '~/game/scenes/arena/arenaRuntime'

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
  const elapsedWave = Math.sin(now / 180) * 0.5 + 0.5
  const patternColor = boss.pattern === 'volley'
    ? battleProfile.volleyColor
    : boss.pattern === 'slam'
      ? battleProfile.slamColor
      : battleProfile.chargeColor

  patternMarker.lineStyle(3, patternColor, 0.8)
  patternMarker.fillStyle(patternColor, 0.12 + elapsedWave * 0.08)
  patternMarker.setDepth(screen.y - 3)
  patternMarker.fillEllipse(screen.x, screen.y + 10, 150 + elapsedWave * 14, 84 + elapsedWave * 10)
  patternMarker.strokeEllipse(screen.x, screen.y + 10, 150 + elapsedWave * 14, 84 + elapsedWave * 10)

  if (boss.pattern === 'charge' && !boss.chargeTarget && Math.hypot(boss.velocity.x, boss.velocity.y) < 1) {
    const target = projectQuarterView(runtime.player)
    chargeTelegraph.setDepth(screen.y + 1)
    chargeTelegraph.lineStyle(5, 0xffefb0, 0.95)
    chargeTelegraph.lineBetween(screen.x, screen.y - 4, target.x, target.y)
    chargeTelegraph.fillStyle(0xffefb0, 0.9)
    chargeTelegraph.fillCircle(target.x, target.y, 8)
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
