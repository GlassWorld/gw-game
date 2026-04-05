<script setup lang="ts">
import { buildLoadoutSummary, calculateSpentResources, describeLoadoutEffects, resourceBudget } from '~/game/data/loadoutData'
import { getSkillPresentationMeta } from '~/game/skill/skillPresentation'
import { getSkillById } from '~/game/skill/skill'
import type { SkillDefinition } from '~/game/core/types'

const props = defineProps<{
  skills: SkillDefinition[]
  selectedSkillIds: string[]
  selectedStatId: string | null
  selectedPotionId: string | null
  hasNextBoss: boolean
}>()

defineEmits<{
  toggleSkill: [skillId: string]
  rerollBoss: []
  confirm: []
}>()

const selectedSkillDetails = computed(() => props.selectedSkillIds
  .map((skillId) => getSkillById(skillId))
  .filter((skill): skill is SkillDefinition => Boolean(skill)))

const remainingResources = computed(() => (
  resourceBudget - calculateSpentResources({
    statId: props.selectedStatId,
    potionId: props.selectedPotionId
  })
))

const loadoutSummary = computed(() => buildLoadoutSummary({
  statId: props.selectedStatId,
  potionId: props.selectedPotionId
}))

const loadoutEffects = computed(() => describeLoadoutEffects({
  statId: props.selectedStatId,
  potionId: props.selectedPotionId
}))

const canEnterPractice = computed(() => (
  props.selectedSkillIds.length === 3 && remainingResources.value >= 0
))

const formatDamage = (skill: SkillDefinition) => `${skill.effect.damage}`
const formatCooldown = (skill: SkillDefinition) => `${(skill.cooldownMs / 1000).toFixed(1)}s`
</script>

<template>
  <section class="skill-panel">
    <div class="panel-head">
      <div>
        <p class="panel-label">Skills</p>
        <h2>스킬 선택</h2>
      </div>
      <span class="cost-hint">{{ selectedSkillIds.length }} / 3 선택</span>
    </div>

    <div class="skill-grid">
      <button
        v-for="skill in skills"
        :key="skill.id"
        class="skill-card"
        :class="{ active: selectedSkillIds.includes(skill.id) }"
        @click="$emit('toggleSkill', skill.id)"
      >
        <div class="card-top">
          <div class="icon-badge">
            {{ getSkillPresentationMeta(skill.effect.type).iconLabel }}
          </div>
          <div>
            <strong>{{ skill.label }}</strong>
            <small>{{ getSkillPresentationMeta(skill.effect.type).previewDescription }}</small>
          </div>
        </div>

        <div class="preview" :class="getSkillPresentationMeta(skill.effect.type).previewClass">
          <div class="arena-ring" />
          <div class="player-mark">P</div>
          <div class="boss-mark">B</div>
          <div class="effect-mark" />
        </div>

        <p class="summary">{{ skill.description }}</p>

        <div class="meta-grid">
          <span>Damage {{ formatDamage(skill) }}</span>
          <span>Cooldown {{ formatCooldown(skill) }}</span>
          <span>MP {{ skill.mpCost }}</span>
          <span>{{ skill.effect.type }}</span>
        </div>
      </button>
    </div>
  </section>

  <section class="picked-panel">
    <div class="panel-head">
      <div>
        <p class="panel-label">Loadout</p>
        <h2>현재 선택</h2>
      </div>
      <span class="cost-hint">{{ loadoutSummary }}</span>
    </div>

    <div class="effect-chips">
      <span v-for="effect in loadoutEffects" :key="effect" class="effect-chip">{{ effect }}</span>
    </div>

    <div class="picked-list">
      <article v-for="skill in selectedSkillDetails" :key="skill.id" class="picked-card">
        <div class="picked-head">
          <span class="slot-chip">{{ selectedSkillIds.indexOf(skill.id) === 0 ? 'Q' : selectedSkillIds.indexOf(skill.id) === 1 ? 'W' : 'E' }}</span>
          <strong>{{ skill.label }}</strong>
        </div>
        <p>{{ skill.description }}</p>
      </article>
      <article v-if="selectedSkillDetails.length === 0" class="picked-card picked-card--empty">
        <p>아직 선택된 스킬이 없습니다. 3개를 골라 Q / W / E 슬롯을 채우세요.</p>
      </article>
    </div>
  </section>

  <footer class="footer">
    <p>선택한 세팅을 연습 공간에서 먼저 시험한 뒤 실제 보스전으로 넘어갑니다.</p>
    <div class="footer-actions">
      <button v-if="hasNextBoss" class="ghost" @click="$emit('rerollBoss')">다음 보스 선택</button>
      <button class="primary" :disabled="!canEnterPractice" @click="$emit('confirm')">연습 공간으로 이동</button>
    </div>
  </footer>
</template>

<style scoped>
.skill-panel,
.picked-panel {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
}

.skill-panel {
  margin-bottom: 18px;
}

.picked-panel {
  margin-bottom: 18px;
}

.panel-head,
.footer {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.panel-label,
.cost-hint,
.summary,
.meta-grid,
.picked-card p,
.footer p {
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

.skill-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.skill-card {
  padding: 18px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.skill-card.active {
  border-color: rgba(246, 196, 83, 0.72);
  box-shadow: inset 0 0 0 1px rgba(246, 196, 83, 0.24);
}

.card-top {
  display: flex;
  align-items: start;
  gap: 12px;
}

.icon-badge {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  min-width: 58px;
  height: 58px;
  padding: 0 10px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(246, 196, 83, 0.2), rgba(103, 232, 249, 0.18));
  color: var(--text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.preview {
  position: relative;
  height: 140px;
  margin: 16px 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.06), transparent 42%),
    linear-gradient(180deg, rgba(13, 23, 33, 0.95), rgba(8, 12, 20, 0.98));
}

.arena-ring {
  position: absolute;
  inset: auto 18px 18px;
  height: 44px;
  border: 1px solid rgba(103, 232, 249, 0.12);
  border-radius: 999px;
}

.player-mark,
.boss-mark,
.effect-mark {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 999px;
}

.player-mark {
  left: 20%;
  bottom: 28px;
  width: 24px;
  height: 24px;
  background: rgba(103, 232, 249, 0.28);
  color: #c5fbff;
  font-size: 11px;
  font-weight: 800;
}

.boss-mark {
  right: 20%;
  top: 30px;
  width: 28px;
  height: 28px;
  background: rgba(255, 127, 106, 0.28);
  color: #ffd7cf;
  font-size: 11px;
  font-weight: 800;
}

.effect-mark {
  background: rgba(246, 196, 83, 0.34);
  box-shadow: 0 0 0 1px rgba(246, 196, 83, 0.24);
}

.preview--fan .effect-mark {
  left: 36%;
  top: 48%;
  width: 92px;
  height: 24px;
  border-radius: 999px 999px 8px 8px;
  transform: rotate(-22deg);
}

.preview--shot .effect-mark {
  left: 34%;
  top: 50%;
  width: 118px;
  height: 10px;
  border-radius: 999px;
  transform: rotate(-18deg);
}

.preview--burst .effect-mark {
  left: 50%;
  top: 56%;
  width: 92px;
  height: 92px;
  transform: translate(-50%, -50%);
}

.preview--ground .effect-mark {
  right: 14%;
  top: 26px;
  width: 84px;
  height: 84px;
}

.preview--cleave .effect-mark {
  left: 34%;
  top: 42%;
  width: 96px;
  height: 56px;
  border-radius: 999px 999px 18px 18px;
  transform: rotate(-28deg);
}

.summary {
  line-height: 1.6;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  font-size: 13px;
}

.effect-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.effect-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid rgba(103, 232, 249, 0.18);
  border-radius: 999px;
  background: rgba(103, 232, 249, 0.08);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}

.picked-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.picked-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.picked-card--empty {
  grid-column: 1 / -1;
}

.picked-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.slot-chip {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(103, 232, 249, 0.14);
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.ghost,
.primary {
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.ghost {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
}

.primary {
  border: 0;
  background: linear-gradient(90deg, #67e8f9, #8df7d6);
  color: #052030;
}

.primary:disabled {
  opacity: 0.45;
  cursor: default;
}

@media (max-width: 1280px) {
  .skill-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1080px) {
  .picked-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .panel-head,
  .footer {
    flex-direction: column;
    align-items: start;
  }

  .footer-actions {
    width: 100%;
    flex-direction: column;
  }

  .skill-grid {
    grid-template-columns: 1fr;
  }
}
</style>
