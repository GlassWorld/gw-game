import Phaser from 'phaser'
import type { BattleRuntime, BattleSetup, RuntimeCallbacks } from '~/game/core/types'
import { bossData, defaultBoss } from '~/game/boss/bossData'
import { buildLoadoutSummary } from '~/game/data/loadoutData'
import { updateBossAi } from '~/game/system/combat/bossAiSystem'
import { resolveCollisions } from '~/game/system/combat/collisionSystem'
import { updateProjectiles } from '~/game/system/combat/projectileSystem'
import { captureInput } from '~/game/system/input/inputSystem'
import { updateMovement } from '~/game/system/movement/movementSystem'
import { projectQuarterView, screenToWorld, syncDisplay, syncHazardDisplay } from '~/game/system/render/renderSyncSystem'
import { updateRuntimeTimers } from '~/game/system/time/runtimeTimerSystem'
import { createArenaHudPayload } from '~/game/scenes/arena/arenaHud'
import { handleArenaPlayerActions } from '~/game/scenes/arena/arenaPlayerActions'
import { createActorDisplay, createBossDisplay, createHazardDisplay, createProjectileDisplay, drawArenaFloor, syncActorSprite } from '~/game/scenes/arena/arenaDisplay'
import { createArenaRuntime, clampPointToArena } from '~/game/scenes/arena/arenaRuntime'
import { ArenaEffectManager } from '~/game/scenes/arena/arenaEffects'
import { drawPlayerSkillPreview, syncBossTelegraphs, syncPlayerSkillPreview } from '~/game/scenes/arena/arenaTelegraph'
import { COMBAT_TUNING } from '~/game/core/constants'

export class BossArenaScene extends Phaser.Scene {
  private readonly callbacks: RuntimeCallbacks
  private setup: BattleSetup

  private runtime: BattleRuntime
  private sceneReady = false

  private keys!: Record<'SPACE' | 'Q' | 'W' | 'E', Phaser.Input.Keyboard.Key>

  private arenaFloor?: Phaser.GameObjects.Graphics
  private patternMarker?: Phaser.GameObjects.Graphics
  private chargeTelegraph?: Phaser.GameObjects.Graphics
  private playerSkillPreview?: Phaser.GameObjects.Graphics
  private playerSkillPreviewUntil = 0
  private effectManager?: ArenaEffectManager

  private getBossDefinition() {
    return bossData.find((boss) => boss.id === this.runtime.setup.bossId) ?? defaultBoss
  }

  constructor(options: RuntimeCallbacks & { setup: BattleSetup }) {
    super('BossArenaScene')
    this.callbacks = options
    this.setup = options.setup
    this.runtime = createArenaRuntime(options.setup)
  }

  create() {
    this.sceneReady = true
    this.input.mouse?.disableContextMenu()
    this.keys = {
      SPACE: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      Q: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    }

    this.drawArena()
    this.patternMarker = this.add.graphics()
    this.chargeTelegraph = this.add.graphics()
    this.playerSkillPreview = this.add.graphics()
    this.effectManager = new ArenaEffectManager(this)
    this.createEntityDisplays()
    this.bindPointerInput()
    this.pushHudState()
  }

  startPractice() {
    this.resetBattle()
    this.runtime.running = true
    this.runtime.battleMessage = `연습 공간. ${buildLoadoutSummary(this.runtime.setup.loadout)} 세팅을 시험해보세요.`
    this.pushHudState()
  }

  startBattle() {
    this.resetBattle()
    this.runtime.running = true
    this.runtime.battleMessage = `보스가 패턴을 준비합니다. 현재 세팅: ${buildLoadoutSummary(this.runtime.setup.loadout)}`
    this.pushHudState()
  }

  restartBattle() {
    this.startBattle()
  }

  applySetup(setup: BattleSetup) {
    this.setup = setup
    this.runtime = createArenaRuntime(setup)

    if (!this.sceneReady) {
      return
    }

    this.resetBattle()
    this.pushHudState()
  }

  override update(_time: number, deltaMs: number) {
    this.updateAim()
    this.syncVisuals()

    if (!this.runtime.running || this.runtime.result) {
      return
    }

    captureInput(this.runtime, {
      aimWorld: this.runtime.input.aimWorld,
      attackHeld: false,
      dashPressed: Phaser.Input.Keyboard.JustDown(this.keys.SPACE),
      skillPressed: {
        q: Phaser.Input.Keyboard.JustDown(this.keys.Q),
        w: Phaser.Input.Keyboard.JustDown(this.keys.W),
        e: Phaser.Input.Keyboard.JustDown(this.keys.E)
      }
    })

    handleArenaPlayerActions({
      runtime: this.runtime,
      deltaMs,
      onShowSkillPreview: (skill) => this.showPlayerSkillPreview(skill)
    })
    updateRuntimeTimers(this.runtime, deltaMs)
    updateMovement(this.runtime, deltaMs)
    if (this.runtime.setup.mode === 'battle') {
      updateBossAi(this.runtime, deltaMs)
    }
    updateProjectiles(this.runtime, deltaMs)
    resolveCollisions(this.runtime, deltaMs)
    this.cleanupDestroyedEntities()
    this.effectManager?.playQueued(this.runtime)
    this.syncVisuals()
    this.pushHudState()

    if (this.runtime.result) {
      this.runtime.running = false
      this.callbacks.onBattleEnd(this.runtime.result)
    }
  }

  private resetBattle() {
    if (!this.sceneReady) {
      this.runtime = createArenaRuntime(this.setup)
      return
    }

    this.destroyEntityDisplays()
    this.runtime = createArenaRuntime(this.setup)
    this.createEntityDisplays()
  }

  private bindPointerInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.runtime.running || pointer.button !== 2) {
      return
    }

    this.runtime.player.moveTarget = clampPointToArena(screenToWorld({ x: pointer.x, y: pointer.y }))
  })
  }

  private updateAim() {
    const pointer = this.input.activePointer
    this.runtime.input.aimWorld = clampPointToArena(screenToWorld({ x: pointer.x, y: pointer.y }))
  }

  private createEntityDisplays() {
    this.runtime.player.display = createActorDisplay(
      this,
      this.runtime.setup.character.color,
      this.runtime.player.radius,
      this.runtime.setup.character.id
    )
    this.runtime.boss.display = createBossDisplay(this, this.getBossDefinition().accentColor, this.runtime.boss.radius)
  }

  private syncVisuals() {
    syncDisplay(this.runtime.player)
    syncActorSprite(this.runtime.player.display, this.runtime.player, this.time.now)
    syncDisplay(this.runtime.boss)
    syncBossTelegraphs({
      patternMarker: this.patternMarker,
      chargeTelegraph: this.chargeTelegraph,
      runtime: this.runtime,
      battleProfile: this.getBossDefinition().battleProfile,
      now: this.time.now
    })
    syncPlayerSkillPreview(this.playerSkillPreview, this.time.now, this.playerSkillPreviewUntil)
    this.effectManager?.sync(this.runtime, this.time.now)

    for (const projectile of this.runtime.projectiles) {
      if (!projectile.display) {
        projectile.display = createProjectileDisplay(this, projectile.color, projectile.radius)
      }
      syncDisplay(projectile)
    }

    for (const hazard of this.runtime.hazards) {
      if (hazard.showIndicator === false) {
        hazard.display?.destroy?.()
        hazard.display = null
        continue
      }

      if (!hazard.display) {
        hazard.display = createHazardDisplay(this, hazard.color, hazard.radius)
      }
      syncHazardDisplay(hazard)
    }
  }

  private showPlayerSkillPreview(skill: BattleRuntime['skills'][string]['definition']) {
    this.playerSkillPreviewUntil = this.time.now + COMBAT_TUNING.feedback.skillPreviewMs
    drawPlayerSkillPreview({
      preview: this.playerSkillPreview,
      runtime: this.runtime,
      skill
    })
  }

  private cleanupDestroyedEntities() {
    this.runtime.projectiles = this.runtime.projectiles.filter((projectile) => {
      if (projectile.alive) {
        return true
      }

      projectile.display?.destroy?.()
      return false
    })

    this.runtime.hazards = this.runtime.hazards.filter((hazard) => {
      if (hazard.alive) {
        return true
      }

      hazard.display?.destroy?.()
      return false
    })
  }

  private destroyEntityDisplays() {
    this.runtime.player.display?.destroy?.()
    this.runtime.boss.display?.destroy?.()
    this.patternMarker?.clear()
    this.chargeTelegraph?.clear()
    this.playerSkillPreview?.clear()

    for (const projectile of this.runtime.projectiles) {
      projectile.display?.destroy?.()
    }

    for (const hazard of this.runtime.hazards) {
      hazard.display?.destroy?.()
    }
  }

  private pushHudState() {
    this.callbacks.onHudUpdate(createArenaHudPayload(this.runtime))
  }

  private drawArena() {
    this.arenaFloor?.destroy()
    this.arenaFloor = this.add.graphics()
    drawArenaFloor(this, this.arenaFloor, this.getBossDefinition().battleProfile)
  }
}
