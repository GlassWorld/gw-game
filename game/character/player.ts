import type { BattleLoadout, CharacterDefinition, PlayerEntity } from '~/game/core/types'
import { applyLoadoutToCharacterStats } from '~/game/data/loadoutData'

export function createPlayer(character: CharacterDefinition, loadout: BattleLoadout): PlayerEntity {
  const adjustedStats = applyLoadoutToCharacterStats({
    maxHp: character.maxHp,
    maxMp: character.maxMp,
    mpRegenPerSecond: character.mpRegenPerSecond,
    basicAttack: character.basicAttack
  }, loadout)

  return {
    id: 'player',
    x: 480,
    y: 1040,
    radius: 22,
    characterId: character.id,
    name: character.name,
    hp: adjustedStats.maxHp,
    maxHp: adjustedStats.maxHp,
    mp: adjustedStats.maxMp,
    maxMp: adjustedStats.maxMp,
    mpRegenPerSecond: adjustedStats.mpRegenPerSecond,
    basicAttack: adjustedStats.basicAttack,
    alive: true,
    moveTarget: null,
    invulnerableMs: 0,
    basicAttackCooldownMs: 0,
    dashCooldownMs: 0,
    dashMsRemaining: 0,
    dashVector: { x: 0, y: 0 },
    display: null
  }
}
