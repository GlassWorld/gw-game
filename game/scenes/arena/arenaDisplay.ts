import Phaser from 'phaser'
import { ARENA_HEIGHT, ARENA_WIDTH } from '~/game/core/constants'
import type { BossBattleProfile, PlayerEntity } from '~/game/core/types'
import { projectQuarterView } from '~/game/system/render/renderSyncSystem'

const LEON_IDLE_FRAME = 10
const LEON_ATTACK_FRAME = 15
const LEON_RUN_FRAMES = [6, 7, 8, 9]

export function createActorDisplay(
  scene: Phaser.Scene,
  color: number,
  radius: number,
  spriteKey?: string,
  spriteFrame?: number
) {
  const container = scene.add.container(0, 0)
  const shadow = scene.add.ellipse(0, radius * 0.6, radius * 1.7, radius * 0.9, 0x000000, 0.24)

  if (spriteKey && scene.textures.exists(spriteKey)) {
    const sprite = scene.add.sprite(0, -radius * 0.4, spriteKey, spriteFrame)
    sprite.setName('actor-sprite')
    const targetHeight = radius * 3.6
    const scale = targetHeight / sprite.height
    sprite.setScale(scale)
    container.add([shadow, sprite])
    return container
  }

  const body = scene.add.circle(0, 0, radius, color, 1)
  const highlight = scene.add.circle(-radius * 0.35, -radius * 0.35, radius * 0.32, 0xffffff, 0.16)
  container.add([shadow, body, highlight])
  return container
}

export function syncActorSprite(display: PlayerEntity['display'], player: PlayerEntity, now: number) {
  const container = display as Phaser.GameObjects.Container | null
  const sprite = container?.getByName?.('actor-sprite') as Phaser.GameObjects.Sprite | null

  if (!sprite) {
    return
  }

  if (player.attackAnimMs > 0) {
    sprite.setFrame(LEON_ATTACK_FRAME)
    return
  }

  if (player.dashMsRemaining > 0 || player.moveTarget) {
    const frameIndex = Math.floor(now / 90) % LEON_RUN_FRAMES.length
    sprite.setFrame(LEON_RUN_FRAMES[frameIndex]!)
    return
  }

  sprite.setFrame(LEON_IDLE_FRAME)
}

export function createBossDisplay(scene: Phaser.Scene, accentHex: string, radius: number) {
  const accentColor = Phaser.Display.Color.HexStringToColor(accentHex).color
  const ringColor = Phaser.Display.Color.ValueToColor(accentColor).clone().brighten(18).color
  const coreColor = Phaser.Display.Color.ValueToColor(accentColor).clone().brighten(60).color
  const container = scene.add.container(0, 0)
  const shadow = scene.add.ellipse(0, radius * 0.7, radius * 2.1, radius, 0x000000, 0.28)
  const ring = scene.add.ellipse(0, 0, radius * 2.1, radius * 1.3, ringColor, 0.22)
  const body = scene.add.circle(0, 0, radius, accentColor, 1)
  const core = scene.add.circle(0, -radius * 0.12, radius * 0.45, coreColor, 0.18)
  container.add([shadow, ring, body, core])
  return container
}

export function createProjectileDisplay(scene: Phaser.Scene, projectileColor: number, radius: number) {
  const container = scene.add.container(0, 0)
  const glow = scene.add.circle(0, 0, radius * 1.25, projectileColor, 0.18)
  const body = scene.add.circle(0, 0, radius, projectileColor, 1)
  container.add([glow, body])
  return container
}

export function createHazardDisplay(scene: Phaser.Scene, color: number, radius: number) {
  const container = scene.add.container(0, 0)
  const glow = scene.add.ellipse(0, 0, radius * 2.9, radius * 1.7, color, 0.14)
  const ellipse = scene.add.ellipse(0, 0, radius * 2.25, radius * 1.34, color, 0.42)
  ellipse.setStrokeStyle(4, 0xfff1d6, 0.92)
  const core = scene.add.ellipse(0, 0, radius * 1.5, radius * 0.86, 0xffffff, 0.14)
  container.add([glow, ellipse, core])
  return container
}

export function drawArenaFloor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, battleProfile: BossBattleProfile) {
  graphics.clear()
  graphics.fillStyle(battleProfile.floorColor, 1)
  graphics.lineStyle(2, battleProfile.gridColor, 0.18)

  const corners = [
    projectQuarterView({ x: 140, y: 140 }),
    projectQuarterView({ x: ARENA_WIDTH - 140, y: 140 }),
    projectQuarterView({ x: ARENA_WIDTH - 140, y: ARENA_HEIGHT - 140 }),
    projectQuarterView({ x: 140, y: ARENA_HEIGHT - 140 })
  ]

  graphics.beginPath()
  graphics.moveTo(corners[0].x, corners[0].y)
  for (const corner of corners.slice(1)) {
    graphics.lineTo(corner.x, corner.y)
  }
  graphics.closePath()
  graphics.fillPath()
  graphics.strokePath()

  graphics.lineStyle(1, 0xffffff, 0.06)
  for (let i = 260; i <= ARENA_WIDTH - 260; i += 180) {
    const a = projectQuarterView({ x: i, y: 140 })
    const b = projectQuarterView({ x: i, y: ARENA_HEIGHT - 140 })
    graphics.lineBetween(a.x, a.y, b.x, b.y)
  }

  for (let i = 260; i <= ARENA_HEIGHT - 260; i += 180) {
    const a = projectQuarterView({ x: 140, y: i })
    const b = projectQuarterView({ x: ARENA_WIDTH - 140, y: i })
    graphics.lineBetween(a.x, a.y, b.x, b.y)
  }

  const bossSpawn = projectQuarterView({ x: 1220, y: 520 })
  const playerSpawn = projectQuarterView({ x: 480, y: 1040 })

  scene.add.circle(bossSpawn.x, bossSpawn.y, 14, 0xffa18f, 0.25).setDepth(1)
  scene.add.circle(playerSpawn.x, playerSpawn.y, 12, 0x78f1c5, 0.25).setDepth(1)
}
