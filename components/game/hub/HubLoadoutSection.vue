<script setup lang="ts">
import { calculateSpentResources, potionOptions, statOptions, resourceBudget } from '~/game/data/loadoutData'

const props = defineProps<{
  selectedStatId: string | null
  selectedPotionId: string | null
}>()

defineEmits<{
  updateStat: [optionId: string]
  updatePotion: [optionId: string]
}>()

const remainingResources = computed(() => (
  resourceBudget - calculateSpentResources({
    statId: props.selectedStatId,
    potionId: props.selectedPotionId
  })
))

const isOptionDisabled = (targetCost: number, currentId: string | null, targetId: string) => {
  if (currentId === targetId) {
    return false
  }

  return remainingResources.value - targetCost < 0
}
</script>

<template>
  <section class="loadout-grid">
    <article class="setup-panel">
      <div class="panel-head">
        <div>
          <p class="panel-label">Relic</p>
          <h2>유물</h2>
        </div>
        <span class="cost-hint">준비중</span>
      </div>
      <div class="coming-card">
        <strong>준비중</strong>
        <p>유물은 보스 보상 루프와 묶어서 별도 설계 후 추가할 예정입니다.</p>
      </div>
    </article>

    <article class="setup-panel">
      <div class="panel-head">
        <div>
          <p class="panel-label">Stats</p>
          <h2>스탯 배분</h2>
        </div>
        <span class="cost-hint">1개 선택</span>
      </div>
      <div class="option-list">
        <button
          v-for="option in statOptions"
          :key="option.id"
          class="option-card"
          :class="{ active: selectedStatId === option.id }"
          :disabled="isOptionDisabled(option.cost, selectedStatId, option.id)"
          @click="$emit('updateStat', option.id)"
        >
          <strong>{{ option.label }}</strong>
          <small>비용 {{ option.cost }}</small>
          <p>{{ option.description }}</p>
        </button>
      </div>
    </article>

    <article class="setup-panel">
      <div class="panel-head">
        <div>
          <p class="panel-label">Potion</p>
          <h2>포션</h2>
        </div>
        <span class="cost-hint">1개 선택</span>
      </div>
      <div class="option-list">
        <button
          v-for="option in potionOptions"
          :key="option.id"
          class="option-card"
          :class="{ active: selectedPotionId === option.id }"
          :disabled="isOptionDisabled(option.cost, selectedPotionId, option.id)"
          @click="$emit('updatePotion', option.id)"
        >
          <strong>{{ option.label }}</strong>
          <small>비용 {{ option.cost }}</small>
          <p>{{ option.description }}</p>
        </button>
      </div>
    </article>

    <article class="setup-panel">
      <div class="panel-head">
        <div>
          <p class="panel-label">Equipment</p>
          <h2>장비</h2>
        </div>
        <span class="cost-hint">준비중</span>
      </div>
      <div class="coming-card">
        <strong>준비중</strong>
        <p>장비는 아이템 구조와 성장 규칙이 정리된 뒤 추가합니다.</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.loadout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.setup-panel {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
}

.panel-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.panel-label,
.cost-hint,
.option-card p,
.option-card small,
.coming-card p {
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

h2 {
  margin: 0;
  font-size: 22px;
}

.option-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.option-card {
  padding: 16px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.option-card.active {
  border-color: rgba(246, 196, 83, 0.72);
  box-shadow: inset 0 0 0 1px rgba(246, 196, 83, 0.24);
}

.option-card:disabled {
  opacity: 0.4;
  cursor: default;
}

.option-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 17px;
}

.option-card p {
  margin-top: 8px;
  line-height: 1.55;
}

.coming-card {
  margin-top: 16px;
  padding: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.coming-card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 17px;
}

@media (max-width: 1080px) {
  .loadout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .panel-head {
    flex-direction: column;
    align-items: start;
  }
}
</style>
