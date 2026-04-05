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

    <div class="bottom-ui">
      <section class="panel skill-panel">
        <div class="skill-card dash-card" :class="{ ready: state.dashCooldownMs === 0, cooling: state.dashCooldownMs > 0 }">
          <div class="skill-head">
            <div class="skill-key">Space</div>
            <div class="skill-icon dash-icon">DASH</div>
          </div>

          <div class="skill-meta">
            <strong>회피 대시</strong>
            <p>{{ state.dashCooldownMs > 0 ? 'Cooldown' : 'Ready' }}</p>
          </div>

          <div class="skill-cooldown">
            {{ state.dashCooldownMs > 0 ? `${(state.dashCooldownMs / 1000).toFixed(1)}s` : 'OK' }}
          </div>

          <div class="cooldown-bar">
            <div
              class="cooldown-fill"
              :style="{ width: `${100 - percent(state.dashCooldownMs, 1600)}%` }"
            />
          </div>
        </div>

        <div
          v-for="skillId in orderedSkillIds"
          :key="skillId"
          class="skill-card"
          :class="{ ready: state.skills[skillId]?.remainingMs === 0, cooling: (state.skills[skillId]?.remainingMs ?? 0) > 0 }"
        >
          <div class="skill-head">
            <div class="skill-key">{{ state.skills[skillId]?.key }}</div>
            <div class="skill-icon" :style="colorStyle(state.skills[skillId]?.color)">
              {{ state.skills[skillId]?.iconLabel }}
            </div>
          </div>

          <div class="skill-meta">
            <strong>{{ state.skills[skillId]?.label }}</strong>
            <p>{{ (state.skills[skillId]?.remainingMs ?? 0) > 0 ? 'Cooldown' : 'Ready' }}</p>
          </div>

          <div class="skill-cooldown">
            {{ (state.skills[skillId]?.remainingMs ?? 0) > 0 ? `${((state.skills[skillId]?.remainingMs ?? 0) / 1000).toFixed(1)}s` : 'OK' }}
          </div>

          <div class="cooldown-bar">
            <div
              class="cooldown-fill"
              :style="{ width: `${100 - percent(state.skills[skillId]?.remainingMs ?? 0, state.skills[skillId]?.cooldownMs ?? 1)}%` }"
            />
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
  min-width: 168px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.skill-card.ready {
  box-shadow: inset 0 0 0 1px rgba(103, 232, 249, 0.28);
}

.skill-card.cooling {
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
  display: grid;
  place-items: center;
  min-width: 48px;
  height: 36px;
  padding: 0 10px;
  border-radius: 12px;
  color: #04131d;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.dash-icon {
  background: linear-gradient(135deg, #9ed1ff, #dff5ff);
}

.skill-meta {
  min-width: 0;
}

.skill-meta strong {
  display: block;
  font-size: 13px;
}

.skill-meta p {
  margin: 4px 0 0;
}

.skill-cooldown {
  min-width: 48px;
  text-align: right;
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.cooldown-bar {
  grid-column: 1 / -1;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.cooldown-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #67e8f9, #8df7d6);
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
  .bottom-ui {
    grid-template-columns: 1fr;
  }
  .skill-panel {
    flex-wrap: wrap;
  }
}
</style>
