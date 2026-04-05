<script setup lang="ts">
import { applyLoadoutToCharacterStats, buildLoadoutSummary, calculateSpentResources, resourceBudget } from '~/game/data/loadoutData'
import type { BossDefinition, CharacterDefinition, RunRewardSummary } from '~/game/core/types'

const props = defineProps<{
  character: CharacterDefinition
  boss: BossDefinition
  selectedStatId: string | null
  selectedPotionId: string | null
  rewardSummary: RunRewardSummary | null
  totalCurrency: number
  totalSkillUpgradePoints: number
  clearedBosses: BossDefinition[]
  totalBossCount: number
}>()

const spentResources = computed(() => (
  calculateSpentResources({
    statId: props.selectedStatId,
    potionId: props.selectedPotionId
  })
))

const remainingResources = computed(() => resourceBudget - spentResources.value)
const loadoutSummary = computed(() => buildLoadoutSummary({
  statId: props.selectedStatId,
  potionId: props.selectedPotionId
}))

const adjustedStats = computed(() => applyLoadoutToCharacterStats({
  maxHp: props.character.maxHp,
  maxMp: props.character.maxMp,
  mpRegenPerSecond: props.character.mpRegenPerSecond,
  basicAttack: props.character.basicAttack
}, {
  statId: props.selectedStatId,
  potionId: props.selectedPotionId
}))

const formatDeltaClass = (next: number, base: number, reverse = false) => {
  if (next === base) {
    return 'stat-value--neutral'
  }

  const improved = reverse ? next < base : next > base
  return improved ? 'stat-value--up' : 'stat-value--down'
}
</script>

<template>
  <section class="summary-section">
    <section class="summary-grid">
      <article class="summary-card">
        <p class="panel-label">Character</p>
        <strong>{{ character.name }}</strong>
        <span>{{ character.title }}</span>
        <p>{{ character.description }}</p>
        <div class="stat-preview">
          <div class="stat-row">
            <span>HP</span>
            <strong class="stat-value" :class="formatDeltaClass(adjustedStats.maxHp, character.maxHp)">{{ character.maxHp }} -> {{ adjustedStats.maxHp }}</strong>
          </div>
          <div class="stat-row">
            <span>MP</span>
            <strong class="stat-value" :class="formatDeltaClass(adjustedStats.maxMp, character.maxMp)">{{ character.maxMp }} -> {{ adjustedStats.maxMp }}</strong>
          </div>
          <div class="stat-row">
            <span>MP 재생</span>
            <strong class="stat-value" :class="formatDeltaClass(adjustedStats.mpRegenPerSecond, character.mpRegenPerSecond)">{{ character.mpRegenPerSecond }} -> {{ adjustedStats.mpRegenPerSecond }}</strong>
          </div>
          <div class="stat-row">
            <span>평타 피해</span>
            <strong class="stat-value" :class="formatDeltaClass(adjustedStats.basicAttack.damage, character.basicAttack.damage)">{{ character.basicAttack.damage }} -> {{ adjustedStats.basicAttack.damage }}</strong>
          </div>
          <div class="stat-row">
            <span>평타 쿨</span>
            <strong class="stat-value" :class="formatDeltaClass(adjustedStats.basicAttack.cooldownMs, character.basicAttack.cooldownMs, true)">{{ (character.basicAttack.cooldownMs / 1000).toFixed(2) }}s -> {{ (adjustedStats.basicAttack.cooldownMs / 1000).toFixed(2) }}s</strong>
          </div>
        </div>
      </article>

      <article class="summary-card">
        <p class="panel-label">Boss</p>
        <strong>{{ boss.name }}</strong>
        <span>{{ boss.region }}</span>
        <p>{{ boss.description }}</p>
      </article>

      <article class="summary-card summary-card--resource">
        <p class="panel-label">Resources</p>
        <strong>{{ remainingResources }}</strong>
        <span>/ {{ resourceBudget }} 남음</span>
        <p>현재 적용 세팅: {{ loadoutSummary }}</p>
      </article>

      <article class="summary-card summary-card--reward">
        <p class="panel-label">Run Reward</p>
        <strong>보유 재화 {{ totalCurrency }}</strong>
        <span>강화 포인트 {{ totalSkillUpgradePoints }}</span>
        <p v-if="rewardSummary">
          방금 {{ rewardSummary.bossName }} 처치 보상:
          재화 +{{ rewardSummary.currency }}, 강화 +{{ rewardSummary.skillUpgradePoints }}
        </p>
        <p v-else>
          아직 획득한 보상이 없습니다. 보스를 쓰러뜨리면 이곳에 복귀 보상이 표시됩니다.
        </p>
      </article>
    </section>

    <section v-if="rewardSummary" class="reward-banner">
      <p class="panel-label">Latest Reward</p>
      <strong>{{ rewardSummary.bossName }} 토벌 완료</strong>
      <p>재화 +{{ rewardSummary.currency }} / 스킬 강화 포인트 +{{ rewardSummary.skillUpgradePoints }}</p>
    </section>

    <section class="run-progress-banner">
      <div>
        <p class="panel-label">Run Progress</p>
        <strong>{{ clearedBosses.length }} / {{ totalBossCount }} 보스 클리어</strong>
      </div>
      <div v-if="clearedBosses.length > 0" class="cleared-list">
        <span v-for="clearedBoss in clearedBosses" :key="clearedBoss.id" class="cleared-chip">{{ clearedBoss.name }}</span>
      </div>
      <p v-else class="progress-copy">아직 클리어한 보스가 없습니다. 첫 보스를 쓰러뜨려 런을 시작하세요.</p>
    </section>
  </section>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0 18px;
}

.panel-label,
.summary-card span,
.summary-card p,
.progress-copy {
  margin: 0;
  color: var(--muted);
}

.panel-label {
  margin-bottom: 8px;
  color: var(--gold);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.summary-card {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
}

.summary-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 26px;
}

.summary-card--resource strong {
  font-size: 40px;
  color: var(--accent);
}

.summary-card--reward {
  border-color: rgba(246, 196, 83, 0.18);
  background:
    linear-gradient(180deg, rgba(246, 196, 83, 0.08), transparent),
    rgba(255, 255, 255, 0.03);
}

.stat-preview {
  display: grid;
  gap: 6px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--muted);
}

.stat-row strong {
  margin: 0;
  font-size: 13px;
  color: var(--text);
}

.stat-value--up {
  color: #8df7d6;
}

.stat-value--down {
  color: #ff8f84;
}

.stat-value--neutral {
  color: var(--text);
}

.reward-banner {
  margin: 0 0 18px;
  padding: 18px 20px;
  border: 1px solid rgba(246, 196, 83, 0.24);
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(246, 196, 83, 0.12), rgba(255, 143, 112, 0.08)),
    rgba(255, 255, 255, 0.03);
}

.reward-banner strong {
  display: block;
  margin-top: 4px;
  font-size: 22px;
}

.reward-banner p:last-child {
  margin-top: 8px;
  color: var(--text);
}

.run-progress-banner {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 18px;
  padding: 18px 20px;
  border: 1px solid rgba(103, 232, 249, 0.16);
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(103, 232, 249, 0.08), rgba(141, 247, 214, 0.05)),
    rgba(255, 255, 255, 0.03);
}

.run-progress-banner strong {
  display: block;
  margin-top: 4px;
  font-size: 22px;
}

.cleared-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.cleared-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid rgba(103, 232, 249, 0.18);
  border-radius: 999px;
  background: rgba(103, 232, 249, 0.1);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .run-progress-banner {
    flex-direction: column;
    align-items: start;
  }
}
</style>
