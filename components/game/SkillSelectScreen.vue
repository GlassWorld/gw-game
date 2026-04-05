<script setup lang="ts">
import { getSkillPresentationMeta } from '~/game/skill/skillPresentation'
import { getSkillById } from '~/game/skill/skill'
import type { CharacterDefinition, SkillDefinition } from '~/game/core/types'

const props = defineProps<{
  character: CharacterDefinition
  bossName: string
  skills: SkillDefinition[]
  selectedSkillIds: string[]
}>()

defineEmits<{
  toggle: [skillId: string]
  back: []
  confirm: []
}>()

const formatDamage = (skill: SkillDefinition) => `${skill.effect.damage}`
const formatCooldown = (skill: SkillDefinition) => `${(skill.cooldownMs / 1000).toFixed(1)}s`
const formatRadius = (skill: SkillDefinition) => skill.effect.radius ? `${skill.effect.radius}` : '-'

const selectedSkillDetails = computed(() => props.selectedSkillIds
  .map((skillId) => getSkillById(skillId))
  .filter((skill): skill is SkillDefinition => Boolean(skill)))
</script>

<template>
  <section class="screen">
    <div class="shell">
      <header class="header">
        <div>
          <p class="eyebrow">2. Boss Fixed / 3. Skill Draft</p>
          <h1>{{ character.name }} 스킬 선택</h1>
          <p class="description">보스는 `{{ bossName }}` 로 고정됩니다. 5개 중 3개를 선택해 `Q / W / E` 슬롯에 배치합니다.</p>
        </div>
        <button class="ghost" @click="$emit('back')">이전 단계</button>
      </header>

      <div class="boss-card">
        <strong>보스 확정</strong>
        <p>{{ bossName }}</p>
      </div>

      <div class="grid">
        <button
          v-for="skill in skills"
          :key="skill.id"
          class="card"
          :class="{ active: selectedSkillIds.includes(skill.id) }"
          @click="$emit('toggle', skill.id)"
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
            <span>Range {{ formatRadius(skill) }}</span>
          </div>
        </button>
      </div>

      <section class="picked-panel">
        <h2>선택한 스킬</h2>
        <div class="picked-list">
          <article v-for="skill in selectedSkillDetails" :key="skill.id" class="picked-card">
            <div class="picked-head">
              <span class="slot-chip">{{ selectedSkillIds.indexOf(skill.id) === 0 ? 'Q' : selectedSkillIds.indexOf(skill.id) === 1 ? 'W' : 'E' }}</span>
              <strong>{{ skill.label }}</strong>
            </div>
            <p>{{ skill.description }}</p>
            <small>Damage {{ formatDamage(skill) }} / Cooldown {{ formatCooldown(skill) }} / MP {{ skill.mpCost }}</small>
          </article>
          <article v-if="selectedSkillDetails.length === 0" class="picked-card picked-card--empty">
            <p>아직 선택된 스킬이 없습니다. 카드 5개 중 3개를 고르면 Q / W / E 슬롯으로 들어갑니다.</p>
          </article>
        </div>
      </section>

      <footer class="footer">
        <p>선택된 스킬: {{ selectedSkillIds.length }} / 3</p>
        <button class="primary" :disabled="selectedSkillIds.length !== 3" @click="$emit('confirm')">전투 진입</button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.screen {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}

.shell {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: rgba(8, 18, 28, 0.94);
}

.header,
.footer {
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

.description,
.footer p,
.boss-card p {
  margin: 0;
  color: var(--muted);
}

.boss-card {
  margin: 22px 0 18px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
}

.boss-card strong {
  display: block;
  margin-bottom: 6px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.card {
  text-align: left;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  cursor: pointer;
}

.card.active {
  border-color: rgba(246, 196, 83, 0.75);
  box-shadow: inset 0 0 0 1px rgba(246, 196, 83, 0.28);
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

.card strong,
.card small,
.summary {
  display: block;
}

.card small,
.summary,
.picked-card p,
.picked-card small {
  color: var(--muted);
}

.summary {
  line-height: 1.6;
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

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}

.picked-panel {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.picked-panel h2 {
  margin: 0 0 14px;
  font-size: 18px;
}

.picked-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
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

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .picked-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .shell {
    padding: 20px;
  }

  .header,
  .footer {
    flex-direction: column;
    align-items: start;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
