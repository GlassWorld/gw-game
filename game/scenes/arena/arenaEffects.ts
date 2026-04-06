import Phaser from 'phaser'
import { COMBAT_TUNING } from '~/game/core/constants'
import type { BattleRuntime, CombatEvent, EntityBase, Vec2 } from '~/game/core/types'
import { projectQuarterView } from '~/game/system/render/renderSyncSystem'

function drawWorldLine(scene: Phaser.Scene, from: Vec2, to: Vec2, color: number, width: number, alpha: number) {
  const graphics = scene.add.graphics()
  const a = projectQuarterView(from)
  const b = projectQuarterView(to)
  graphics.setDepth(Math.max(a.y, b.y) + 12)
  graphics.lineStyle(width, color, alpha)
  graphics.lineBetween(a.x, a.y, b.x, b.y)
  return graphics
}

function drawWorldRing(scene: Phaser.Scene, center: Vec2, radius: number, color: number, alpha: number) {
  const graphics = scene.add.graphics()
  const projected = projectQuarterView(center)
  graphics.setDepth(projected.y + 8)
  graphics.lineStyle(4, color, alpha)
  graphics.strokeEllipse(projected.x, projected.y + 6, radius * 2.2, radius * 1.3)
  return graphics
}

export class ArenaEffectManager {
  private readonly scene: Phaser.Scene
  private nextDashGhostAt = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  playQueued(runtime: BattleRuntime) {
    for (const event of runtime.combatEvents.splice(0)) {
      this.play(event)
    }
  }

  sync(runtime: BattleRuntime, now: number) {
    this.syncActorFeedback(runtime.player, runtime.player.invulnerableMs > 0 ? 0.58 : 1)
    this.syncActorFeedback(runtime.boss, 1)

    if (runtime.player.dashMsRemaining > 0 && now >= this.nextDashGhostAt) {
      this.nextDashGhostAt = now + COMBAT_TUNING.feedback.dashGhostIntervalMs
      this.spawnDashGhost(runtime.player, runtime.setup.character.color)
    }
  }

  private play(event: CombatEvent) {
    if (event.type === 'dash') {
      this.spawnDashBurst(event.position, event.color)
      return
    }

    if (event.type === 'cast') {
      if (event.shape === 'circle') {
        this.spawnCastPulse(event.target, event.color, 44)
      } else if (event.shape === 'cone') {
        this.spawnSlashTrail(event.position, event.target, event.color, 8, 0.42)
      } else {
        this.spawnChargeLine(event.position, event.target, event.color, 0.28)
      }
      return
    }

    if (event.type === 'attack') {
      if (event.shape === 'slash') {
        this.spawnSlashTrail(event.position, event.target, event.color, 10, 0.6)
        return
      }

      if (event.shape === 'shot') {
        this.spawnShotMuzzle(event.position, event.target, event.color)
        return
      }

      if (event.shape === 'charge') {
        this.spawnChargeLine(event.position, event.target, event.color, 0.6)
        this.scene.cameras.main.shake(90, 0.0022)
        return
      }

      this.spawnBurst(event.target, event.color, 22)
      return
    }

    if (event.type === 'hit') {
      this.spawnHitImpact(event.position, event.color, Boolean(event.heavy))
      this.scene.cameras.main.shake(event.heavy ? 120 : 70, event.heavy ? 0.0032 : 0.0016)
      return
    }

    this.spawnDodgePulse(event.position, event.color)
  }

  private syncActorFeedback(entity: EntityBase & { hitFlashMs?: number, display?: EntityBase['display'] }, baseAlpha: number) {
    const display = entity.display as Phaser.GameObjects.Container | null
    if (!display) {
      return
    }

    const hitWeight = Math.min(1, (entity.hitFlashMs ?? 0) / Math.max(COMBAT_TUNING.feedback.hitFlashMs, 1))
    const scale = 1 + hitWeight * 0.06
    display.setScale(scale)
    display.setAlpha(Math.max(0.46, baseAlpha - hitWeight * 0.12))
  }

  private spawnDashGhost(entity: EntityBase, color: number) {
    const projected = projectQuarterView(entity)
    const ellipse = this.scene.add.ellipse(projected.x, projected.y + 6, entity.radius * 2.4, entity.radius * 1.26, color, 0.18)
    ellipse.setDepth(projected.y - 1)
    this.scene.tweens.add({
      targets: ellipse,
      alpha: 0,
      scaleX: 1.28,
      scaleY: 1.22,
      duration: 120,
      onComplete: () => ellipse.destroy()
    })
  }

  private spawnDashBurst(position: Vec2, color: number) {
    const slash = drawWorldLine(
      this.scene,
      { x: position.x - 28, y: position.y + 16 },
      { x: position.x + 28, y: position.y - 16 },
      color,
      8,
      0.42
    )
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.18,
      scaleY: 1.06,
      duration: 120,
      onComplete: () => slash.destroy()
    })
  }

  private spawnCastPulse(position: Vec2, color: number, radius: number) {
    const ring = drawWorldRing(this.scene, position, radius, color, 0.5)
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.14,
      scaleY: 1.08,
      duration: 220,
      onComplete: () => ring.destroy()
    })
  }

  private spawnBurst(position: Vec2, color: number, radius: number) {
    const ring = drawWorldRing(this.scene, position, radius, color, 0.72)
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.36,
      scaleY: 1.22,
      duration: 200,
      onComplete: () => ring.destroy()
    })
  }

  private spawnSlashTrail(from: Vec2, to: Vec2, color: number, width: number, alpha: number) {
    const line = drawWorldLine(this.scene, from, to, color, width, alpha)
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 120,
      onComplete: () => line.destroy()
    })
  }

  private spawnShotMuzzle(from: Vec2, to: Vec2, color: number) {
    this.spawnSlashTrail(from, to, color, 5, 0.38)
    this.spawnBurst(from, color, 12)
  }

  private spawnChargeLine(from: Vec2, to: Vec2, color: number, alpha: number) {
    const line = drawWorldLine(this.scene, from, to, color, 14, alpha)
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 160,
      onComplete: () => line.destroy()
    })
  }

  private spawnHitImpact(position: Vec2, color: number, heavy: boolean) {
    const projected = projectQuarterView(position)
    const star = this.scene.add.star(projected.x, projected.y, heavy ? 8 : 6, 10, heavy ? 24 : 18, 0xffffff, 0.95)
    star.setDepth(projected.y + 16)
    const ring = drawWorldRing(this.scene, position, heavy ? 28 : 18, color, heavy ? 0.86 : 0.62)
    this.scene.tweens.add({
      targets: star,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: heavy ? 180 : 130,
      onComplete: () => star.destroy()
    })
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.34,
      scaleY: 1.18,
      duration: heavy ? 220 : 160,
      onComplete: () => ring.destroy()
    })
  }

  private spawnDodgePulse(position: Vec2, color: number) {
    const ring = drawWorldRing(this.scene, position, 18, color, 0.66)
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.18,
      duration: 180,
      onComplete: () => ring.destroy()
    })
  }
}
