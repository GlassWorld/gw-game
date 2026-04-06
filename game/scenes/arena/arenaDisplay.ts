import Phaser from 'phaser'
import { ARENA_HEIGHT, ARENA_WIDTH } from '~/game/core/constants'
import type { BossBattleProfile, CharacterId, PlayerEntity } from '~/game/core/types'
import { projectQuarterView } from '~/game/system/render/renderSyncSystem'

const LEON_IDLE_FRAME = 10
const LEON_ATTACK_FRAME = 15
const LEON_RUN_FRAMES = [6, 7, 8, 9]

function getCharacterVisualProfile(characterId: CharacterId | undefined, color: number) {
  const accent = Phaser.Display.Color.ValueToColor(color)

  if (characterId === 'b-mage') {
    return {
      build: 'mage' as const,
      torsoWidth: 0.92,
      torsoHeight: 1.58,
      shoulderWidth: 1.04,
      legWidth: 0.28,
      legHeight: 0.96,
      mainMetal: 0xc9d8f7,
      clothDark: 0x16253a,
      clothMid: accent.clone().darken(12).color,
      clothLight: accent.clone().brighten(16).color
    }
  }

  if (characterId === 'c-paladin') {
    return {
      build: 'paladin' as const,
      torsoWidth: 1.34,
      torsoHeight: 1.6,
      shoulderWidth: 1.48,
      legWidth: 0.42,
      legHeight: 1.16,
      mainMetal: 0xe3d2a2,
      clothDark: 0x263246,
      clothMid: accent.clone().darken(8).color,
      clothLight: accent.clone().brighten(10).color
    }
  }

  return {
    build: 'swordsman' as const,
    torsoWidth: 1.18,
    torsoHeight: 1.48,
    shoulderWidth: 1.3,
    legWidth: 0.38,
    legHeight: 1.1,
    mainMetal: 0xcfd8e3,
    clothDark: 0x183043,
    clothMid: accent.clone().darken(6).color,
    clothLight: accent.clone().brighten(10).color
  }
}

function createHumanoidDisplay(scene: Phaser.Scene, color: number, radius: number, characterId?: CharacterId) {
  const profile = getCharacterVisualProfile(characterId, color)
  const lineColor = Phaser.Display.Color.ValueToColor(color).clone().brighten(18).color
  const container = scene.add.container(0, 0)
  const shadow = scene.add.ellipse(0, radius * 0.92, radius * 1.7, radius * 0.82, 0x000000, 0.22)
  const head = scene.add.circle(0, -radius * 1.08, radius * 0.5, 0xf1dfc9, 1)
  const body = scene.add.rectangle(0, radius * 0.02, radius * 0.18, radius * 1.58, lineColor, 1)
  const armLeft = scene.add.rectangle(-radius * 0.42, -radius * 0.02, radius * 0.12, radius * 1.02, lineColor, 1)
  const armRight = scene.add.rectangle(radius * 0.46, -radius * 0.08, radius * 0.12, radius * 1.12, lineColor, 1)
  const legLeft = scene.add.rectangle(-radius * 0.2, radius * 1.08, radius * 0.12, radius * 1.08, lineColor, 1)
  const legRight = scene.add.rectangle(radius * 0.2, radius * 1.08, radius * 0.12, radius * 1.08, lineColor, 1)
  const weaponBlade = scene.add.rectangle(radius * 0.84, -radius * 0.56, radius * (profile.build === 'paladin' ? 0.22 : 0.14), radius * (profile.build === 'mage' ? 1.56 : 1.3), profile.build === 'mage' ? 0x9de3ff : profile.mainMetal, 1)
  const weaponGuard = scene.add.rectangle(radius * 0.82, radius * 0.08, radius * (profile.build === 'mage' ? 0.22 : 0.42), radius * 0.1, profile.build === 'mage' ? 0x9adfff : 0xe6c788, 1)
  const weaponHilt = scene.add.rectangle(radius * 0.82, radius * 0.26, radius * 0.1, radius * 0.42, 0x7a562a, 1)
  const weaponOrb = scene.add.circle(radius * 0.84, -radius * 1.3, radius * 0.2, 0xd6f6ff, profile.build === 'mage' ? 0.96 : 0)
  const shield = scene.add.ellipse(-radius * 0.68, radius * 0.22, radius * (profile.build === 'paladin' ? 0.84 : 0.62), radius * (profile.build === 'paladin' ? 1.02 : 0.72), profile.mainMetal, profile.build === 'mage' ? 0 : 0.96)

  body.setName('actor-body')
  head.setName('actor-head')
  armRight.setName('actor-front-arm')
  shield.setName('actor-shield')
  weaponBlade.setName('actor-weapon-blade')
  weaponGuard.setName('actor-weapon-guard')
  weaponHilt.setName('actor-weapon-hilt')
  weaponOrb.setName('actor-weapon-orb')
  armLeft.setName('actor-back-arm')
  legLeft.setName('actor-front-leg-left')
  legRight.setName('actor-front-leg-right')

  for (const limb of [body, armLeft, armRight, legLeft, legRight, weaponBlade, weaponGuard, weaponHilt]) {
    limb.setOrigin(0.5, 0.08)
  }
  shield.setOrigin(0.5, 0.45)

  container.add([
    shadow,
    legLeft,
    legRight,
    body,
    armLeft,
    shield,
    head,
    armRight,
    weaponBlade,
    weaponGuard,
    weaponHilt,
    weaponOrb
  ])

  return container
}

export function createActorDisplay(
  scene: Phaser.Scene,
  color: number,
  radius: number,
  characterId?: CharacterId,
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

  shadow.destroy()
  container.destroy()
  return createHumanoidDisplay(scene, color, radius, characterId)
}

export function syncActorSprite(display: PlayerEntity['display'], player: PlayerEntity, now: number) {
  const container = display as Phaser.GameObjects.Container | null
  const sprite = container?.getByName?.('actor-sprite') as Phaser.GameObjects.Sprite | null

  if (!container) {
    return
  }

  if (!sprite) {
    const body = container.getByName('actor-body') as Phaser.GameObjects.Shape | null
    const head = container.getByName('actor-head') as Phaser.GameObjects.Shape | null
    const frontArm = container.getByName('actor-front-arm') as Phaser.GameObjects.Rectangle | null
    const shield = container.getByName('actor-shield') as Phaser.GameObjects.Ellipse | null
    const weaponBlade = container.getByName('actor-weapon-blade') as Phaser.GameObjects.Rectangle | null
    const weaponGuard = container.getByName('actor-weapon-guard') as Phaser.GameObjects.Rectangle | null
    const weaponHilt = container.getByName('actor-weapon-hilt') as Phaser.GameObjects.Rectangle | null
    const weaponOrb = container.getByName('actor-weapon-orb') as Phaser.GameObjects.Arc | null
    const frontLegLeft = container.getByName('actor-front-leg-left') as Phaser.GameObjects.Rectangle | null
    const frontLegRight = container.getByName('actor-front-leg-right') as Phaser.GameObjects.Rectangle | null
    const gait = Math.sin(now / 90)
    const bob = player.dashMsRemaining > 0 ? -6 : player.moveTarget ? Math.sin(now / 120) * -3 : Math.sin(now / 420) * -1.5
    const isSwordsman = player.characterId === 'a-swordsman'
    const isMage = player.characterId === 'b-mage'
    const isPaladin = player.characterId === 'c-paladin'
    const swordsmanStep = isSwordsman && player.attackAnimMs > 0 ? player.basicAttackVisualStep : 0
    const swordsmanSlash = swordsmanStep === 1
    const swordsmanThrust = swordsmanStep === 2
    const swordsmanSpin = swordsmanStep === 3

    if (body) {
      const bodyRotation = player.attackAnimMs > 0
        ? (swordsmanSlash ? 0.28 : swordsmanThrust ? 0.06 : swordsmanSpin ? -0.34 : isPaladin ? 0.12 : isMage ? 0.08 : 0.18)
        : 0
      const bodyY = player.radius * 0.02 + bob * 0.2 + (swordsmanThrust ? -player.radius * 0.06 : 0)
      body.setRotation(bodyRotation)
      body.setY(bodyY)
    }

    if (head) {
      head.setY(-player.radius * 1.02 + bob * 0.12 + (swordsmanSpin ? -player.radius * 0.05 : 0))
    }

    if (frontArm) {
      const idleRotation = isSwordsman ? 0.22 : isMage ? 0.06 : 0.14
      const attackRotation = swordsmanSlash ? -0.42 : swordsmanThrust ? -0.08 : swordsmanSpin ? 0.3 : isSwordsman ? -0.18 : isMage ? -0.14 : -0.3
      const attackX = swordsmanSlash ? player.radius * 0.56 : swordsmanThrust ? player.radius * 0.66 : swordsmanSpin ? player.radius * 0.24 : isSwordsman ? player.radius * 0.52 : player.radius * 0.56
      const attackY = swordsmanSlash ? -player.radius * 0.18 : swordsmanThrust ? -player.radius * 0.24 : swordsmanSpin ? player.radius * 0.04 : player.radius * -0.02
      frontArm.setRotation(player.attackAnimMs > 0 ? attackRotation : player.moveTarget ? idleRotation + gait * 0.12 : idleRotation)
      frontArm.setX(player.attackAnimMs > 0 ? attackX : player.radius * 0.46)
      frontArm.setY((player.attackAnimMs > 0 ? attackY : player.radius * -0.08) + bob * 0.18)
    }

    if (shield) {
      shield.setAlpha(isMage ? 0 : 1)
      const shieldRotation = swordsmanSlash ? -0.18 : swordsmanThrust ? -0.34 : swordsmanSpin ? 0.08 : isPaladin ? -0.26 : -0.12
      const shieldX = swordsmanSlash ? -player.radius * 0.72 : swordsmanThrust ? -player.radius * 0.42 : swordsmanSpin ? -player.radius * 0.82 : isPaladin ? -player.radius * 0.5 : -player.radius * 0.62
      const shieldY = swordsmanThrust ? -player.radius * 0.08 : player.radius * 0.22
      shield.setRotation(player.attackAnimMs > 0 ? shieldRotation : -0.06)
      shield.setX(player.attackAnimMs > 0 ? shieldX : -player.radius * 0.68)
      shield.setY((player.attackAnimMs > 0 ? shieldY : player.radius * 0.22) + bob * 0.12)
    }

    if (weaponBlade && weaponGuard && weaponHilt) {
      const weaponRotation = player.attackAnimMs > 0
        ? (swordsmanSlash ? -0.56 : swordsmanThrust ? 0.06 : swordsmanSpin ? 0.88 : isSwordsman ? 0.1 : isMage ? -0.06 : 0.32)
        : player.moveTarget ? (isMage ? -0.12 : 0.18 + gait * 0.06) : (isMage ? -0.16 : 0.18)
      const weaponX = player.attackAnimMs > 0
        ? (swordsmanSlash ? player.radius * 0.44 : swordsmanThrust ? player.radius * 0.96 : swordsmanSpin ? player.radius * 0.08 : isSwordsman ? player.radius * 0.62 : isMage ? player.radius * 0.82 : player.radius * 0.72)
        : player.radius * 0.78
      const weaponY = player.attackAnimMs > 0
        ? (swordsmanSlash ? -player.radius * 0.28 : swordsmanThrust ? -player.radius * 0.92 : swordsmanSpin ? -player.radius * 0.22 : isSwordsman ? -player.radius * 0.66 : isMage ? -player.radius * 0.98 : -player.radius * 0.56)
        : -player.radius * 0.84

      weaponBlade.setRotation(weaponRotation)
      weaponGuard.setRotation(weaponRotation)
      weaponHilt.setRotation(weaponRotation)

      weaponBlade.setPosition(weaponX, weaponY)
      weaponGuard.setPosition(weaponX - player.radius * 0.02, weaponY + player.radius * 0.78)
      weaponHilt.setPosition(weaponX, weaponY + player.radius * 0.98)
    }

    if (weaponOrb) {
      weaponOrb.setAlpha(isMage ? 1 : 0)
      weaponOrb.setPosition(
        player.attackAnimMs > 0 ? player.radius * 1.04 : player.radius * 0.96,
        player.attackAnimMs > 0 ? -player.radius * 1.6 : -player.radius * 1.46 + Math.sin(now / 160) * 2
      )
      weaponOrb.setScale(player.attackAnimMs > 0 ? 1.18 : 1)
    }

    if (frontLegLeft) {
      frontLegLeft.setY(player.radius * 1.08 + bob * 0.08)
      frontLegLeft.setRotation(
        swordsmanThrust
          ? 0.26
          : swordsmanSpin
            ? -0.14
            : player.moveTarget
              ? gait * 0.18
              : 0.04
      )
    }

    if (frontLegRight) {
      frontLegRight.setY(player.radius * 1.08 + bob * 0.08)
      frontLegRight.setRotation(
        swordsmanThrust
          ? -0.18
          : swordsmanSpin
            ? 0.28
            : player.moveTarget
              ? -gait * 0.18
              : -0.04
      )
    }
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
