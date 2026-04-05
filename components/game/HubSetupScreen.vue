<script setup lang="ts">
import HubLoadoutSection from '~/components/game/hub/HubLoadoutSection.vue'
import HubSkillSection from '~/components/game/hub/HubSkillSection.vue'
import HubSummarySection from '~/components/game/hub/HubSummarySection.vue'
import type { BossDefinition, CharacterDefinition, RunRewardSummary, SkillDefinition } from '~/game/core/types'

const props = defineProps<{
  character: CharacterDefinition
  boss: BossDefinition
  skills: SkillDefinition[]
  selectedSkillIds: string[]
  selectedStatId: string | null
  selectedPotionId: string | null
  rewardSummary: RunRewardSummary | null
  totalCurrency: number
  totalSkillUpgradePoints: number
  hasNextBoss: boolean
  clearedBosses: BossDefinition[]
  totalBossCount: number
}>()

const emit = defineEmits<{
  toggleSkill: [skillId: string]
  updateStat: [optionId: string]
  updatePotion: [optionId: string]
  back: []
  rerollBoss: []
  confirm: []
}>()

</script>

<template>
  <section class="screen">
    <div class="shell">
      <header class="header">
        <div>
          <p class="eyebrow">3. Hub Setup</p>
          <h1>대기소 세팅</h1>
          <p class="description">
            {{ character.name }}로 {{ boss.region }}의 {{ boss.name }}에 도전합니다.
            현재는 스탯과 포션만 실제 세팅 항목이며, 유물과 장비는 준비중입니다.
          </p>
        </div>
        <button class="ghost" @click="$emit('back')">이전 단계</button>
      </header>

      <HubSummarySection
        :character="character"
        :boss="boss"
        :selected-stat-id="selectedStatId"
        :selected-potion-id="selectedPotionId"
        :reward-summary="rewardSummary"
        :total-currency="totalCurrency"
        :total-skill-upgrade-points="totalSkillUpgradePoints"
        :cleared-bosses="clearedBosses"
        :total-boss-count="totalBossCount"
      />

      <HubLoadoutSection
        :selected-stat-id="selectedStatId"
        :selected-potion-id="selectedPotionId"
        @update-stat="$emit('updateStat', $event)"
        @update-potion="$emit('updatePotion', $event)"
      />

      <HubSkillSection
        :skills="skills"
        :selected-skill-ids="selectedSkillIds"
        :selected-stat-id="selectedStatId"
        :selected-potion-id="selectedPotionId"
        :has-next-boss="hasNextBoss"
        @toggle-skill="$emit('toggleSkill', $event)"
        @reroll-boss="$emit('rerollBoss')"
        @confirm="$emit('confirm')"
      />
    </div>
  </section>
</template>

<style scoped>
.screen {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.shell {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: rgba(8, 18, 28, 0.94);
}

.header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--gold);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 10px;
  font-size: clamp(30px, 5vw, 46px);
}

h2 {
  margin: 0;
  font-size: 22px;
}

.description {
  margin: 0;
  color: var(--muted);
}

.ghost {
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 960px) {
  .shell {
    padding: 20px;
  }

  .header {
    flex-direction: column;
    align-items: start;
  }
}
</style>
