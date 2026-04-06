import type { BattleRuntime, CombatEvent } from '~/game/core/types'

export function queueCombatEvent(runtime: BattleRuntime, event: CombatEvent) {
  runtime.combatEvents.push(event)
}
