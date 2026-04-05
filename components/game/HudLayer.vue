<script setup lang="ts">
import type { BattleHudState } from '~/game/core/types'

const props = defineProps<{
  state: BattleHudState
  skillOrder: string[]
}>()

const percent = (value: number, max: number) => Math.max(0, (value / max) * 100)
const colorStyle = (color?: number) => ({ background: `#${(color ?? 0).toString(16).padStart(6, '0')}` })
const orderedSkillIds = computed(() => {
  const explicitOrder = props.skillOrder.filter((skillId) => props.state.skills[skillId])
  if (explicitOrder.length > 0) {
    return explicitOrder
  }

  return Object.values(props.state.skills)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((skill) => skill.id)
})
</script>

<template>
  <div class="hud">
    <section class="panel boss-bar">
      <div class="label-row">
        <span>{{ state.bossName }} / Phase {{ state.bossPhase }}</span>
        <strong>{{ state.bossHp }} / {{ state.bossMaxHp }}</strong>
      </div>
      <div class="bar">
        <div class="fill boss" :style="{ width: `${percent(state.bossHp, state.bossMaxHp)}%` }" />
      </div>
      <p class="pattern">현재 패턴: {{ state.bossPatternLabel }}</p>
    </section>

    <div
      v-if="state.dashCooldownMs > 0"
      class="dash-indicator panel cooling"
    >
      <span class="dash-label">대시</span>
      <strong>Space</strong>
      <p>{{ `${(state.dashCooldownMs / 1000).toFixed(1)}s` }}</p>
    </div>

    <div class="bottom-ui">
      <section class="panel skill-panel">
        <div
          v-for="skillId in orderedSkillIds"
          :key="skillId"
          class="skill-card"
          :class="{ ready: state.skills[skillId]?.remainingMs === 0, cooling: (state.skills[skillId]?.remainingMs ?? 0) > 0 }"
        >
          <div class="skill-head">
            <div class="skill-key">{{ state.skills[skillId]?.key }}</div>
            <div class="skill-icon" :style="colorStyle(state.skills[skillId]?.color)" />
          </div>

          <div class="skill-meta">
            <strong>{{ state.skills[skillId]?.label }}</strong>
            <p>{{ (state.skills[skillId]?.remainingMs ?? 0) > 0 ? 'Cooldown' : '준비됨' }}</p>
          </div>

          <div class="skill-cooldown">
            {{ (state.skills[skillId]?.remainingMs ?? 0) > 0 ? `${((state.skills[skillId]?.remainingMs ?? 0) / 1000).toFixed(1)}s` : '' }}
          </div>
        </div>
      </section>

      <section class="panel player-status">
        <div class="label-row">
          <span>{{ state.playerName }}</span>
          <strong>{{ state.playerHp }} / {{ state.playerMaxHp }}</strong>
        </div>
        <div class="bar">
          <div class="fill player" :style="{ width: `${percent(state.playerHp, state.playerMaxHp)}%` }" />
        </div>

        <div class="label-row mp-row">
          <span>MP</span>
          <strong>{{ state.playerMp }} / {{ state.playerMaxMp }}</strong>
        </div>
        <div class="bar mp">
          <div class="fill mp-fill" :style="{ width: `${percent(state.playerMp, state.playerMaxMp)}%` }" />
        </div>
      </section>

      <section class="panel info-panel">
        <p>{{ state.message }}</p>
        <div class="loadout-box">
          <strong>현재 세팅: {{ state.loadoutSummary }}</strong>
          <ul class="loadout-list">
            <li v-for="effect in state.loadoutEffects" :key="effect">{{ effect }}</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 18px;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--panel);
  padding: 14px 16px;
  backdrop-filter: blur(12px);
}

.dash-indicator {
  position: absolute;
  left: 50%;
  bottom: 112px;
  transform: translateX(-50%);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  pointer-events: none;
}

.dash-indicator.cooling {
  box-shadow: inset 0 0 0 1px rgba(246, 196, 83, 0.18);
}

.dash-indicator strong,
.dash-indicator p,
.dash-label {
  margin: 0;
}

.dash-label {
  color: var(--muted);
  font-size: 12px;
}

.dash-indicator strong {
  font-size: 13px;
}

.dash-indicator p {
  color: var(--text);
  font-size: 14px;
  font-weight: 800;
}

.boss-bar {
  width: min(980px, 100%);
  margin: 0 auto;
  padding: 18px 22px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--muted);
}

.boss-bar .label-row {
  font-size: 15px;
}

.boss-bar .label-row strong {
  font-size: 18px;
  color: var(--text);
}

.bar {
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.boss-bar .bar {
  height: 18px;
}

.fill {
  height: 100%;
  border-radius: 999px;
}

.fill.player {
  background: linear-gradient(90deg, #2dc774, #76f2b6);
}

.fill.boss {
  background: linear-gradient(90deg, #ff765e, #ffb06a);
}

.mp {
  margin-top: 8px;
}

.mp-fill {
  background: linear-gradient(90deg, #57a7ff, #8ed3ff);
}

.pattern,
.info-panel p,
.skill-card p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.boss-bar .pattern {
  font-size: 14px;
}

.bottom-ui {
  display: grid;
  grid-template-columns: minmax(320px, auto) 260px minmax(220px, 1fr);
  align-items: end;
  gap: 16px;
}

.player-status {
  align-self: end;
}

.mp-row {
  margin-top: 10px;
}

.skill-panel {
  display: flex;
  gap: 10px;
  justify-self: start;
  align-self: end;
}

.skill-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px 12px;
  min-width: 148px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.skill-card.ready {
  background: linear-gradient(180deg, rgba(103, 232, 249, 0.2), rgba(103, 232, 249, 0.08));
  box-shadow: inset 0 0 0 1px rgba(103, 232, 249, 0.28);
}

.skill-card.cooling {
  background: linear-gradient(180deg, rgba(246, 196, 83, 0.18), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 0 0 1px rgba(246, 196, 83, 0.18);
}

.skill-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-key {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
}

.skill-icon {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08);
}

.skill-meta {
  min-width: 0;
}

.skill-meta strong {
  display: block;
  font-size: 13px;
}

.skill-meta p {
  display: none;
}

.skill-cooldown {
  min-width: 40px;
  text-align: right;
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
}

.info-panel {
  min-height: 92px;
}

.loadout-box {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.loadout-box strong {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
}

.loadout-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 960px) {
  .dash-indicator {
    bottom: 168px;
    width: calc(100% - 32px);
    justify-content: center;
  }

  .bottom-ui {
    grid-template-columns: 1fr;
  }
  .skill-panel {
    flex-wrap: wrap;
  }
}
</style>
