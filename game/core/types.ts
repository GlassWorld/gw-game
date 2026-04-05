export type BattlePhase = 'idle' | 'loading' | 'countdown' | 'practice' | 'running' | 'result'
export type BattleResult = 'victory' | 'defeat'
export type Faction = 'player' | 'boss'
export type BossPatternKey = 'idle' | 'volley' | 'slam' | 'charge'
export type BasicAttackMode = 'melee' | 'ranged'
export type CharacterId = 'a-swordsman' | 'b-mage' | 'c-paladin'
export type SkillEffectType = 'projectile_fan' | 'projectile_shot' | 'aoe_burst' | 'ground_burst' | 'frontal_cleave'
export type BattleMode = 'practice' | 'battle'

export interface Vec2 {
  x: number
  y: number
}

export interface SkillDefinition {
  id: string
  characterId: CharacterId
  label: string
  cooldownMs: number
  description: string
  mpCost: number
  effect: SkillEffect
}

export interface SkillEffect {
  type: SkillEffectType
  damage: number
  color: number
  projectileCount?: number
  projectileSpeed?: number
  projectileRadius?: number
  projectileLifetimeMs?: number
  spread?: number
  radius?: number
  telegraphMs?: number
  ttlMs?: number
  offset?: number
}

export interface CharacterDefinition {
  id: CharacterId
  code: 'A' | 'B' | 'C'
  name: string
  title: string
  description: string
  unlocked: boolean
  color: number
  maxHp: number
  maxMp: number
  mpRegenPerSecond: number
  basicAttack: BasicAttackProfile
  skillPool: string[]
}

export interface BossCutsceneFrame {
  stageLabel: string
  title: string
  text: string
  speaker?: string
}

export interface BossBattleProfile {
  floorColor: number
  gridColor: number
  volleyColor: number
  slamColor: number
  chargeColor: number
  speedMultiplier: number
}

export interface BossDefinition {
  id: string
  name: string
  region: string
  title: string
  description: string
  introLine: string
  encounterText: string
  introCutscene: BossCutsceneFrame[]
  deathCutscene: BossCutsceneFrame[]
  battleProfile: BossBattleProfile
  diceFace: string
  accentColor: string
}

export interface BattleLoadout {
  statId: string | null
  potionId: string | null
}

export interface RunRewardSummary {
  bossName: string
  currency: number
  skillUpgradePoints: number
}

export interface BattleSetup {
  mode: BattleMode
  character: CharacterDefinition
  bossId: string
  bossName: string
  selectedSkillIds: string[]
  loadout: BattleLoadout
}

export interface BasicAttackProfile {
  mode: BasicAttackMode
  range: number
  damage: number
  cooldownMs: number
  color: number
  projectileSpeed?: number
  projectileRadius?: number
  projectileLifetimeMs?: number
  hitRadius?: number
  hitOffset?: number
}

export interface SkillHudState {
  id: string
  key: string
  label: string
  iconLabel: string
  color: number
  cooldownMs: number
  remainingMs: number
}

export interface BattleHudState {
  phase: BattlePhase
  result: BattleResult | null
  playerName: string
  playerHp: number
  playerMaxHp: number
  playerMp: number
  playerMaxMp: number
  bossName: string
  bossHp: number
  bossMaxHp: number
  bossPhase: number
  bossPatternLabel: string
  dashCooldownMs: number
  countdown: number | null
  skills: Record<string, SkillHudState>
  loadoutSummary: string
  loadoutEffects: string[]
  message: string
}

export interface EntityBase {
  id: string
  x: number
  y: number
  radius: number
  alive: boolean
  display?: {
    setPosition: (x: number, y: number) => void
    setDepth: (depth: number) => void
    setAlpha?: (alpha: number) => void
    destroy: () => void
  } | null
}

export interface PlayerEntity extends EntityBase {
  characterId: CharacterId
  name: string
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  mpRegenPerSecond: number
  basicAttack: BasicAttackProfile
  moveTarget: Vec2 | null
  invulnerableMs: number
  basicAttackCooldownMs: number
  attackAnimMs: number
  dashCooldownMs: number
  dashMsRemaining: number
  dashVector: Vec2
}

export interface BossEntity extends EntityBase {
  hp: number
  maxHp: number
  basicAttack: BasicAttackProfile
  phase: 1 | 2
  pattern: BossPatternKey
  patternIndex: number
  patternElapsedMs: number
  patternStepMs: number
  actionElapsedMs: number
  velocity: Vec2
  chargeTarget: Vec2 | null
  phaseAnnounced: boolean
}

export interface ProjectileEntity extends EntityBase {
  faction: Faction
  damage: number
  vx: number
  vy: number
  ttlMs: number
  elapsedMs: number
  color: number
}

export interface HazardEntity extends EntityBase {
  faction: Faction
  damage: number
  ttlMs: number
  elapsedMs: number
  telegraphMs: number
  triggered: boolean
  color: number
}

export interface SkillState {
  definition: SkillDefinition
  key: string
  remainingMs: number
}

export interface BossPatternDefinition {
  key: BossPatternKey
  label: string
  durationMs: number
  intervalMs: number
}

export interface RuntimeInputState {
  aimWorld: Vec2
  attackHeld: boolean
  dashPressed: boolean
  skillPressed: Record<string, boolean>
}

export interface BattleRuntime {
  setup: BattleSetup
  player: PlayerEntity
  boss: BossEntity
  projectiles: ProjectileEntity[]
  hazards: HazardEntity[]
  skills: Record<string, SkillState>
  input: RuntimeInputState
  result: BattleResult | null
  running: boolean
  nextId: number
  battleMessage: string
}

export interface RuntimeCallbacks {
  onHudUpdate: (payload: Partial<BattleHudState>) => void
  onBattleEnd: (result: BattleResult) => void
}
