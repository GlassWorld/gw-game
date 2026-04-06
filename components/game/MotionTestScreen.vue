<script setup lang="ts">
import type { BattleSetup, BossDefinition, CharacterDefinition } from '~/game/core/types'
import { emptyBattleLoadout } from '~/game/data/loadoutData'
import { skillData } from '~/game/skill/skillData'

type TestCategory = 'character' | 'boss'

const props = defineProps<{
  characters: CharacterDefinition[]
  bosses: BossDefinition[]
}>()

const emit = defineEmits<{
  back: []
}>()

const category = ref<TestCategory>('character')
const activeCharacterId = ref(props.characters[0]?.id ?? '')
const activeBossId = ref(props.bosses[0]?.id ?? '')
const activeSkillId = ref('')
const testBattleState = useBattleState()
const testGame = useGameBootstrap({
  battleState: testBattleState
})

const activeItems = computed(() => (
  category.value === 'character'
    ? props.characters.map(character => ({
      id: character.id,
      name: character.name,
      title: character.title,
      description: character.description,
      accent: toCssColor(character.color),
      badge: character.code,
      type: 'character' as const
    }))
    : props.bosses.map(boss => ({
      id: boss.id,
      name: boss.name,
      title: boss.title,
      description: boss.description,
      accent: boss.accentColor,
      badge: boss.diceFace,
      type: 'boss' as const
    }))
))

const activeCharacter = computed(() => props.characters.find(character => character.id === activeCharacterId.value) ?? props.characters[0] ?? null)
const activeBoss = computed(() => props.bosses.find(boss => boss.id === activeBossId.value) ?? props.bosses[0] ?? null)
const visibleItems = computed(() => {
  if (category.value === 'character' && activeCharacter.value) {
    return [{
      id: activeCharacter.value.id,
      name: activeCharacter.value.name,
      title: activeCharacter.value.title,
      description: activeCharacter.value.description,
      accent: toCssColor(activeCharacter.value.color),
      badge: activeCharacter.value.code,
      type: 'character' as const
    }]
  }

  if (category.value === 'boss' && activeBoss.value) {
    return [{
      id: activeBoss.value.id,
      name: activeBoss.value.name,
      title: activeBoss.value.title,
      description: activeBoss.value.description,
      accent: activeBoss.value.accentColor,
      badge: activeBoss.value.diceFace,
      type: 'boss' as const
    }]
  }

  return []
})
const characterSkills = computed(() => {
  if (!activeCharacter.value) {
    return []
  }

  return skillData.filter(skill => skill.characterId === activeCharacter.value.id)
})
const selectedStageSkillIds = computed(() => characterSkills.value.slice(0, 3).map(skill => skill.id))
const activeSkill = computed(() => characterSkills.value.find(skill => skill.id === activeSkillId.value) ?? characterSkills.value[0] ?? null)
const testBattleSetup = computed<BattleSetup | null>(() => {
  if (!activeCharacter.value || !activeBoss.value || selectedStageSkillIds.value.length !== 3) {
    return null
  }

  return {
    mode: 'practice',
    character: activeCharacter.value,
    bossId: activeBoss.value.id,
    bossName: activeBoss.value.name,
    selectedSkillIds: [...selectedStageSkillIds.value],
    loadout: emptyBattleLoadout()
  }
})

function toCssColor(color: number) {
  return `#${color.toString(16).padStart(6, '0')}`
}

function setCategory(next: TestCategory) {
  category.value = next

  if (next === 'character' && !activeCharacterId.value) {
    activeCharacterId.value = props.characters[0]?.id ?? ''
  }

  if (next === 'boss' && !activeBossId.value) {
    activeBossId.value = props.bosses[0]?.id ?? ''
  }
}

function selectCharacter(characterId: string) {
  activeCharacterId.value = characterId
  activeSkillId.value = skillData.find(skill => skill.characterId === characterId)?.id ?? ''
}

function selectBoss(bossId: string) {
  activeBossId.value = bossId
}

function triggerSkill(skillId: string) {
  activeSkillId.value = skillId
}

function restartLivePreview() {
  if (!testBattleSetup.value) {
    return
  }

  testGame.startPractice(testBattleSetup.value)
}

watchEffect(() => {
  if (!activeCharacter.value) {
    activeSkillId.value = ''
    return
  }

  if (!characterSkills.value.some(skill => skill.id === activeSkillId.value)) {
    activeSkillId.value = characterSkills.value[0]?.id ?? ''
  }
})

watch(testBattleSetup, async (setup) => {
  if (!setup || !import.meta.client) {
    return
  }

  await nextTick()
  await testGame.mountGame(setup)
  testGame.startPractice(setup)
}, { immediate: true })
</script>

<template>
  <section class="test-shell">
    <header class="test-header">
      <div>
        <p class="eyebrow">Motion Lab</p>
        <h1>임시 모션 테스트 페이지</h1>
        <p class="test-copy">
          메인 흐름과 별도로 캐릭터와 보스 아티클별 연출을 빠르게 검수하는 공간입니다.
          각 카드에서 기본, 액션, 피격/텔레그래프 상태를 반복 확인할 수 있습니다.
        </p>
      </div>

      <div class="test-actions">
        <button class="tab-button" :class="{ active: category === 'character' }" @click="setCategory('character')">캐릭터</button>
        <button class="tab-button" :class="{ active: category === 'boss' }" @click="setCategory('boss')">보스</button>
        <button class="ghost-button" @click="emit('back')">메인으로</button>
      </div>
    </header>

    <div class="test-grid">
      <aside class="test-sidebar">
        <section class="side-panel">
          <p class="panel-label">{{ category === 'character' ? 'Character Select' : 'Boss Select' }}</p>
          <div class="picker-list">
            <button
              v-for="item in activeItems"
              :key="`picker-${item.id}`"
              class="picker-button"
              :class="{ active: category === 'character' ? activeCharacterId === item.id : activeBossId === item.id }"
              @click="category === 'character' ? selectCharacter(item.id) : selectBoss(item.id)"
            >
              <span class="picker-badge" :style="{ background: item.accent }">{{ item.badge }}</span>
              <span>{{ item.name }}</span>
            </button>
          </div>
        </section>

        <section v-if="category === 'character' && activeCharacter" class="side-panel">
          <p class="panel-label">Character Info</p>
          <strong class="panel-title">{{ activeCharacter.name }}</strong>
          <p class="panel-copy">{{ activeCharacter.title }}</p>
          <p class="character-detail-copy">{{ activeCharacter.description }}</p>
          <div class="character-meta">
            <span>HP {{ activeCharacter.maxHp }}</span>
            <span>MP {{ activeCharacter.maxMp }}</span>
            <span>{{ activeCharacter.basicAttack.mode === 'melee' ? '근접형' : '원거리형' }}</span>
          </div>
        </section>

        <section v-if="category === 'character' && activeCharacter" class="side-panel">
          <p class="panel-label">Skill Test</p>
          <strong class="panel-title">{{ activeCharacter.name }} 스킬 테스트</strong>
          <p class="panel-copy">선택한 3개 스킬이 실제 전투 캔버스에 장착됩니다. 우클릭 이동, 자동 평타, `Q/W/E` 입력으로 실제 화면 그대로 확인합니다.</p>

          <div class="skill-list">
            <button
              v-for="skill in characterSkills"
              :key="skill.id"
              class="skill-button"
              :class="{ active: activeSkill?.id === skill.id }"
              :style="{ '--skill-color': `#${skill.effect.color.toString(16).padStart(6, '0')}` }"
              @click="triggerSkill(skill.id)"
            >
              <strong>{{ skill.label }}</strong>
              <span>{{ skill.description }}</span>
            </button>
          </div>

          <div v-if="activeSkill" class="skill-detail">
            <p class="detail-label">Current Skill</p>
            <strong>{{ activeSkill.label }}</strong>
            <p>{{ activeSkill.description }}</p>
            <p>타입: {{ activeSkill.effect.type }} · 쿨다운: {{ activeSkill.cooldownMs }}ms · MP: {{ activeSkill.mpCost }}</p>
          </div>
        </section>

        <section v-else-if="category === 'boss' && activeBoss" class="side-panel">
          <p class="panel-label">Boss Test</p>
          <strong class="panel-title">{{ activeBoss.name }} 실제 화면 테스트</strong>
          <p class="panel-copy">선택한 보스가 실제 전투 씬에 그대로 배치됩니다. 위치, 시점, 크기, 바닥 투영을 게임 화면과 동일한 기준으로 확인할 수 있습니다.</p>
        </section>
      </aside>

      <div class="test-cards">
      <article
        v-for="item in visibleItems"
        :key="item.id"
        class="test-card"
        :style="{ '--item-accent': item.accent }"
      >
        <div class="test-stage-wrap">
          <GameStage :container-id="testGame.containerId">
            <HudLayer
              v-if="testBattleState.state.phase === 'practice' || testBattleState.state.phase === 'running' || testBattleState.state.phase === 'result'"
              :state="testBattleState.state"
              :skill-order="selectedStageSkillIds"
            />

            <div class="practice-panel panel ui-clickable test-stage-note">
              <div>
                <p class="eyebrow">Live Arena</p>
                <strong>실제 전투 화면 테스트</strong>
                <p class="practice-copy">우클릭 이동, 자동 평타, `Q/W/E` 스킬, `SPACE` 대쉬로 실제 전투 화면 그대로 확인합니다.</p>
              </div>
            </div>
          </GameStage>
        </div>

        <div class="card-copy">
          <p class="card-type">{{ item.type === 'character' ? 'Character' : 'Boss' }}</p>
          <h2>{{ item.name }}</h2>
          <strong>{{ item.title }}</strong>
          <p>{{ item.description }}</p>
        </div>

        <div class="mode-row">
          <button class="mode-button" @click="restartLivePreview()">연습 재시작</button>
        </div>
      </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.test-shell {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 48px 24px 64px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
}

.test-copy {
  width: min(760px, 100%);
  margin: 14px 0 0;
  color: var(--muted);
  line-height: 1.7;
}

.test-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tab-button,
.ghost-button,
.mode-button {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  cursor: pointer;
}

.tab-button,
.ghost-button {
  padding: 12px 18px;
  font-weight: 700;
}

.tab-button.active {
  background: linear-gradient(135deg, rgba(103, 232, 249, 0.24), rgba(103, 232, 249, 0.08));
  border-color: rgba(103, 232, 249, 0.42);
}

.test-grid {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 20px;
}

.test-sidebar {
  display: grid;
  gap: 16px;
  align-self: start;
  position: sticky;
  top: 24px;
}

.side-panel {
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: rgba(8, 18, 28, 0.88);
}

.panel-label,
.detail-label {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.panel-title {
  display: block;
  margin-bottom: 8px;
}

.panel-copy {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.character-detail-copy {
  margin: 10px 0 0;
  color: var(--text);
  line-height: 1.65;
}

.character-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.character-meta span {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--muted);
  font-size: 13px;
}

.picker-list,
.skill-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.picker-button,
.skill-button {
  display: grid;
  gap: 6px;
  justify-items: start;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.picker-button.active,
.skill-button.active {
  border-color: rgba(103, 232, 249, 0.44);
  background: rgba(103, 232, 249, 0.08);
}

.picker-button {
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
}

.picker-badge {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #08131d;
  font-weight: 800;
}

.skill-button {
  border-color: color-mix(in srgb, var(--skill-color, var(--line)) 22%, var(--line));
}

.skill-button span,
.picker-button span:last-child,
.skill-detail p:last-child {
  color: var(--muted);
}

.skill-detail {
  margin-top: 16px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.skill-detail strong {
  display: block;
  margin-bottom: 8px;
}

.skill-detail p {
  margin: 0 0 6px;
  line-height: 1.6;
}

.test-cards {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

.test-card {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background:
    radial-gradient(circle at top, color-mix(in srgb, var(--item-accent) 18%, transparent), transparent 42%),
    rgba(8, 18, 28, 0.92);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.28);
}

.test-stage-wrap {
  margin-bottom: 22px;
}

.test-stage-wrap :deep(.stage-shell) {
  width: 100%;
  max-width: none;
  max-height: none;
  aspect-ratio: 2560 / 1560;
}

.test-stage-wrap :deep(.stage-canvas) {
  transform: translate(-12%, 8%) scale(1.42);
  transform-origin: center center;
}

.test-stage-wrap :deep(.stage-overlay) {
  z-index: 2;
}

.test-stage-note {
  position: absolute;
  left: 18px;
  top: 18px;
  z-index: 2;
  max-width: 360px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(9, 18, 28, 0.78);
  backdrop-filter: blur(10px);
}

.test-stage-note strong {
  display: block;
  margin-bottom: 6px;
}

.practice-copy {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.preview-surface {
  position: relative;
  height: 480px;
  border-radius: 22px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(9, 21, 33, 0.88), rgba(6, 13, 22, 0.98)),
    rgba(0, 0, 0, 0.4);
}

.preview-grid,
.preview-core {
  position: absolute;
  inset: 0;
}

.preview-grid {
  background:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.4;
}

.preview-core {
  display: grid;
  place-items: center;
}

.preview-shadow {
  position: absolute;
  left: 104px;
  bottom: 86px;
  width: 168px;
  height: 58px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  filter: blur(8px);
}

.preview-body {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 32px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--item-accent) 82%, white 18%), color-mix(in srgb, var(--item-accent) 64%, black 18%));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
}

.preview-character {
  position: relative;
  width: 220px;
  height: 260px;
  margin-left: -360px;
  margin-top: 48px;
  transform-origin: 40% 72%;
}

.preview-character--a-swordsman {
  transform: translateX(-8px);
}

.stick-head,
.stick-body,
.stick-arm,
.stick-leg,
.stick-weapon,
.stick-shield {
  position: absolute;
}

.stick-head {
  left: 84px;
  top: 34px;
  width: 42px;
  height: 42px;
  border: 4px solid var(--char-cloth);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
}

.stick-body {
  left: 103px;
  top: 76px;
  width: 5px;
  height: 88px;
  border-radius: 999px;
  background: var(--char-cloth);
}

.stick-arm {
  top: 94px;
  width: 5px;
  height: 66px;
  border-radius: 999px;
  background: var(--char-cloth);
  transform-origin: top center;
}

.stick-arm-left {
  left: 84px;
  transform: rotate(30deg);
}

.stick-arm-right {
  left: 124px;
  transform: rotate(-28deg);
}

.stick-arm-right--a-swordsman {
  transform: rotate(-1deg);
}

.stick-arm-right--b-mage {
  transform: rotate(-18deg);
}

.stick-arm-right--c-paladin {
  transform: rotate(-20deg);
}

.stick-leg {
  top: 158px;
  width: 5px;
  height: 72px;
  border-radius: 999px;
  background: var(--char-cloth);
  transform-origin: top center;
}

.stick-leg-left {
  left: 92px;
  transform: rotate(18deg);
}

.stick-leg-right {
  left: 116px;
  transform: rotate(-14deg);
}

.stick-shield {
  left: 34px;
  top: 106px;
  width: 34px;
  height: 46px;
  border: 3px solid var(--char-metal);
  border-radius: 50% 50% 42% 42%;
  background: rgba(255, 255, 255, 0.04);
}

.stick-shield--b-mage {
  opacity: 0;
}

.stick-shield--c-paladin {
  left: 26px;
  width: 44px;
  height: 58px;
}

.shield-boss {
  position: absolute;
  left: 50%;
  top: 16px;
  width: 12px;
  height: 24px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
}

.stick-weapon {
  left: 124px;
  top: 78px;
  width: 48px;
  height: 118px;
  transform-origin: 16px 82px;
  transform: rotate(18deg);
}

.stick-weapon--a-swordsman {
  left: 120px;
  top: 62px;
  transform-origin: 24px 98px;
  transform: rotate(18deg);
}

.stick-weapon--b-mage {
  top: 62px;
  transform: rotate(8deg);
}

.stick-weapon--c-paladin {
  top: 96px;
  transform: rotate(28deg);
}

.weapon-blade {
  position: absolute;
  left: 50%;
  top: 0;
  width: 6px;
  height: 86px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: var(--char-metal);
}

.stick-weapon--b-mage .weapon-blade {
  width: 8px;
  height: 98px;
  background: var(--char-trim);
}

.stick-weapon--c-paladin .weapon-blade {
  width: 10px;
  height: 70px;
}

.weapon-guard {
  position: absolute;
  left: 50%;
  top: 82px;
  width: 18px;
  height: 5px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #efd086;
}

.stick-weapon--b-mage .weapon-guard {
  width: 12px;
  height: 12px;
  top: 92px;
  border-radius: 50%;
  background: #9adfff;
}

.weapon-grip {
  position: absolute;
  left: 50%;
  top: 86px;
  width: 6px;
  height: 24px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #7a562a;
}

.weapon-orb {
  position: absolute;
  left: 50%;
  top: -8px;
  width: 16px;
  height: 16px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle, #f4ffff, #9adfff 70%, rgba(154, 223, 255, 0.18) 100%);
  box-shadow: 0 0 18px rgba(154, 223, 255, 0.48);
}

.preview-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.72);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.36);
}

.preview-trail,
.preview-burst {
  position: absolute;
  opacity: 0;
}

.preview-trail {
  width: 220px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--item-accent) 88%, white 12%), transparent);
  filter: blur(4px);
  transform-origin: left center;
}

.trail-a {
  left: 246px;
  top: 214px;
  transform: rotate(-18deg);
}

.trail-b {
  left: 266px;
  top: 236px;
  transform: rotate(2deg);
}

.preview-burst {
  width: 190px;
  height: 190px;
  border: 3px solid color-mix(in srgb, var(--item-accent) 84%, white 12%);
  border-radius: 50%;
  left: 478px;
  top: 160px;
}

.skill-effect-lane {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.effect-line,
.effect-burst,
.effect-target,
.effect-projectile,
.effect-cone,
.effect-cone-hit,
.effect-ground,
.boss-telegraph,
.boss-strike {
  position: absolute;
  opacity: 0;
}

.effect-line {
  left: 244px;
  top: 236px;
  width: 250px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05), color-mix(in srgb, var(--item-accent) 84%, white 16%), transparent);
  filter: blur(2px);
  transform-origin: left center;
  transform: rotate(-12deg);
}

.effect-projectile {
  left: 246px;
  top: 228px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff, color-mix(in srgb, var(--item-accent) 82%, white 18%) 58%, transparent 72%);
  box-shadow: 0 0 22px color-mix(in srgb, var(--item-accent) 52%, transparent);
}

.effect-cone {
  left: 230px;
  top: 160px;
  width: 250px;
  height: 162px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--item-accent) 18%, transparent), color-mix(in srgb, var(--item-accent) 42%, transparent));
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
  filter: blur(2px);
  transform-origin: left center;
  transform: rotate(-10deg);
}

.effect-cone-hit {
  left: 418px;
  top: 150px;
  width: 124px;
  height: 124px;
  border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--item-accent) 78%, white 18%);
}

.effect-ground {
  border-radius: 50%;
}

.ground-telegraph {
  right: 100px;
  top: 170px;
  width: 176px;
  height: 176px;
  border: 2px solid color-mix(in srgb, var(--item-accent) 74%, white 12%);
  background: color-mix(in srgb, var(--item-accent) 12%, transparent);
}

.ground-impact {
  right: 78px;
  top: 148px;
  width: 220px;
  height: 220px;
  border: 4px solid color-mix(in srgb, var(--item-accent) 84%, white 18%);
}

.line-b {
  top: 214px;
}

.line-c {
  top: 258px;
}

.effect-target {
  right: 126px;
  top: 214px;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--item-accent) 78%, white 18%);
  background: color-mix(in srgb, var(--item-accent) 16%, transparent);
}

.effect-burst {
  right: 108px;
  top: 194px;
  width: 136px;
  height: 136px;
  border-radius: 50%;
  border: 2px dashed color-mix(in srgb, var(--item-accent) 62%, white 18%);
}

.skill-effect--shot .line-b,
.skill-effect--shot .line-c,
.skill-effect--basic-thrust .line-b,
.skill-effect--basic-thrust .line-c,
.skill-effect--cleave .line-b,
.skill-effect--cleave .line-c,
.skill-effect--basic-spin .line-a,
.skill-effect--basic-spin .line-b,
.skill-effect--basic-spin .line-c {
  opacity: 0;
}

.skill-effect--shot .effect-cone,
.skill-effect--shot .effect-cone-hit,
.skill-effect--shot .ground-telegraph,
.skill-effect--shot .ground-impact,
.skill-effect--fan .ground-telegraph,
.skill-effect--fan .ground-impact,
.skill-effect--cleave .ground-telegraph,
.skill-effect--cleave .ground-impact,
.skill-effect--burst .effect-projectile,
.skill-effect--burst .effect-cone,
.skill-effect--burst .effect-cone-hit,
.skill-effect--basic-spin .effect-line,
.skill-effect--basic-spin .effect-cone,
.skill-effect--basic-spin .effect-cone-hit,
.skill-effect--shot .projectile-b,
.skill-effect--shot .projectile-c,
.skill-effect--basic-thrust .projectile-b,
.skill-effect--basic-thrust .projectile-c,
.skill-effect--cleave .projectile-b,
.skill-effect--cleave .projectile-c,
.skill-effect--basic-spin .projectile-a,
.skill-effect--basic-spin .projectile-b,
.skill-effect--basic-spin .projectile-c {
  display: none;
}

.skill-effect--shot .effect-target {
  width: 54px;
  height: 54px;
  right: 148px;
  top: 226px;
}

.skill-effect--basic-thrust .effect-target {
  width: 58px;
  height: 58px;
  right: 146px;
  top: 224px;
}

.skill-effect--shot .effect-burst {
  opacity: 0;
}

.skill-effect--fan .line-a {
  transform: rotate(-24deg);
}

.skill-effect--fan .line-b {
  transform: rotate(-12deg);
}

.skill-effect--fan .line-c {
  transform: rotate(2deg);
}

.skill-effect--burst .effect-target {
  width: 140px;
  height: 140px;
  right: 108px;
  top: 190px;
}

.skill-effect--burst .effect-burst {
  width: 180px;
  height: 180px;
  right: 88px;
  top: 170px;
}

.skill-effect--burst .effect-line,
.skill-effect--cleave .line-c {
  opacity: 0.35;
}

.skill-effect--cleave .line-a {
  transform: rotate(-28deg);
  width: 160px;
}

.skill-effect--cleave .line-b {
  transform: rotate(-4deg);
  width: 148px;
  top: 228px;
}

.skill-effect--cleave .effect-target {
  width: 82px;
  height: 82px;
  right: 176px;
  top: 212px;
}

.skill-effect--cleave .effect-burst {
  opacity: 0;
}

.skill-effect--basic-spin .ground-telegraph {
  left: 56px;
  top: 210px;
  right: auto;
  width: 170px;
  height: 118px;
}

.skill-effect--basic-spin .ground-impact {
  left: 34px;
  top: 194px;
  right: auto;
  width: 214px;
  height: 148px;
}

.skill-effect--basic-spin .effect-target {
  left: 96px;
  top: 220px;
  right: auto;
  width: 80px;
  height: 80px;
}

.skill-effect--basic-spin .effect-burst {
  left: 74px;
  top: 202px;
  right: auto;
  width: 124px;
  height: 124px;
}

.boss-pattern-lane {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.boss-telegraph {
  border: 2px solid color-mix(in srgb, var(--item-accent) 74%, white 18%);
  background: color-mix(in srgb, var(--item-accent) 14%, transparent);
}

.boss-telegraph-cone {
  left: 220px;
  top: 152px;
  width: 260px;
  height: 180px;
  clip-path: polygon(0 50%, 100% 10%, 100% 90%);
}

.boss-telegraph-line {
  left: 240px;
  top: 198px;
  width: 320px;
  height: 56px;
  border-radius: 999px;
}

.boss-telegraph-circle {
  right: 90px;
  top: 136px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
}

.boss-strike {
  background: color-mix(in srgb, var(--item-accent) 74%, white 18%);
  box-shadow: 0 0 34px color-mix(in srgb, var(--item-accent) 42%, transparent);
}

.boss-strike-cone {
  left: 424px;
  top: 160px;
  width: 120px;
  height: 144px;
  clip-path: polygon(0 12%, 100% 50%, 0 88%);
}

.boss-strike-line {
  left: 518px;
  top: 186px;
  width: 60px;
  height: 80px;
  border-radius: 999px;
}

.boss-strike-circle {
  right: 58px;
  top: 104px;
  width: 224px;
  height: 224px;
  border-radius: 50%;
  border: 4px solid color-mix(in srgb, var(--item-accent) 84%, white 18%);
  background: transparent;
}

.boss-pattern--volley .boss-telegraph-line,
.boss-pattern--volley .boss-telegraph-circle,
.boss-pattern--volley .boss-strike-line,
.boss-pattern--volley .boss-strike-circle,
.boss-pattern--slam .boss-telegraph-cone,
.boss-pattern--slam .boss-telegraph-line,
.boss-pattern--slam .boss-strike-cone,
.boss-pattern--slam .boss-strike-line,
.boss-pattern--charge .boss-telegraph-cone,
.boss-pattern--charge .boss-telegraph-circle,
.boss-pattern--charge .boss-strike-cone,
.boss-pattern--charge .boss-strike-circle {
  display: none;
}

.character-idle .preview-body {
  animation: float-idle 2.2s ease-in-out infinite;
}

.character-idle .preview-character {
  animation: knight-idle 2.4s ease-in-out infinite;
}

.character-idle .preview-character--b-mage {
  animation: mage-idle 2.8s ease-in-out infinite;
}

.character-idle .preview-character--c-paladin {
  animation: paladin-idle 2.5s ease-in-out infinite;
}

.boss-idle .preview-body {
  border-radius: 42px;
  animation: boss-idle 2.6s ease-in-out infinite;
}

.character-action .preview-character {
  animation: knight-lunge 0.62s ease-out 1;
}

.character-action .preview-character--a-swordsman {
  animation: swordsman-strike 0.52s ease-out 1;
}

.character-action .preview-character--b-mage {
  animation: mage-cast 0.68s ease-out 1;
}

.character-action .preview-character--c-paladin {
  animation: paladin-smash 0.66s ease-out 1;
}

.character-action .stick-weapon {
  animation: sword-swing 0.62s ease-out 1;
}

.character-action .stick-weapon--a-swordsman {
  animation: swordsman-sword-swing 0.52s ease-out 1;
}

.character-action .stick-weapon--b-mage {
  animation: staff-cast 0.68s ease-out 1;
}

.character-action .stick-weapon--c-paladin {
  animation: hammer-swing 0.66s ease-out 1;
}

.character-action .stick-shield {
  animation: shield-brace 0.62s ease-out 1;
}

.character-action .stick-shield--c-paladin,
.character-impact .stick-shield--a-swordsman,
.character-impact .stick-shield--c-paladin {
  animation: guard-front 0.56s ease-out 1 forwards;
}

.character-action .stick-arm-right {
  animation: arm-swing 0.62s ease-out 1;
}

.character-action .stick-arm-right--a-swordsman {
  animation: swordsman-arm-swing 0.52s ease-out 1;
}

.character-action .stick-arm-right--b-mage {
  animation: mage-arm-cast 0.68s ease-out 1;
}

.character-action .stick-leg-left {
  animation: step-forward 0.62s ease-out 1;
}

.character-action .stick-leg-right {
  animation: step-back 0.62s ease-out 1;
}

.character-action .preview-trail {
  opacity: 0.86;
  animation: slash-flare 0.44s ease-out 1;
}

.character-action .skill-effect--shot .line-a {
  animation: effect-line-fire 0.18s ease-out forwards;
}

.character-action .skill-effect--shot .projectile-a {
  animation: projectile-flight 0.48s linear forwards;
}

.character-action .skill-effect--shot .effect-target {
  animation: target-ping 0.48s ease-out forwards;
}

.character-action .skill-effect--basic-thrust .line-a {
  animation: effect-line-fire 0.18s ease-out forwards;
}

.character-action .skill-effect--basic-thrust .projectile-a {
  animation: projectile-flight 0.34s linear forwards;
}

.character-action .skill-effect--basic-thrust .effect-target {
  animation: target-ping 0.34s ease-out forwards;
}

.character-action .skill-effect--fan .line-a,
.character-action .skill-effect--fan .line-b,
.character-action .skill-effect--fan .line-c {
  animation: fan-line-fire 0.22s ease-out forwards;
}

.character-action .skill-effect--fan .projectile-a {
  animation: projectile-flight-fan-a 0.5s linear forwards;
}

.character-action .skill-effect--fan .projectile-b {
  animation: projectile-flight 0.5s linear forwards;
}

.character-action .skill-effect--fan .projectile-c {
  animation: projectile-flight-fan-c 0.5s linear forwards;
}

.character-action .skill-effect--fan .effect-target {
  animation: target-wide-ping 0.54s ease-out forwards;
}

.character-action .skill-effect--burst .ground-telegraph {
  animation: ground-telegraph-grow 0.42s ease-out forwards;
}

.character-action .skill-effect--burst .ground-impact {
  animation: ground-impact-blast 0.42s ease-out 0.38s forwards;
}

.character-action .skill-effect--burst .effect-target {
  animation: target-burst-ping 0.36s ease-out 0.28s forwards;
}

.character-action .skill-effect--cleave .effect-cone {
  animation: cone-telegraph 0.26s ease-out forwards;
}

.character-action .skill-effect--cleave .effect-cone-hit {
  animation: cone-hit 0.16s ease-out 0.24s forwards;
}

.character-action .skill-effect--basic-fan .effect-cone {
  animation: cone-telegraph 0.24s ease-out forwards;
}

.character-action .skill-effect--basic-fan .effect-cone-hit {
  animation: cone-hit 0.14s ease-out 0.2s forwards;
}

.character-action .skill-effect--basic-spin .ground-telegraph {
  animation: spin-telegraph 0.24s ease-out forwards;
}

.character-action .skill-effect--basic-spin .ground-impact {
  animation: spin-impact 0.22s ease-out 0.18s forwards;
}

.character-action .skill-effect--basic-spin .effect-target {
  animation: spin-target-ping 0.28s ease-out 0.12s forwards;
}

.character-action .skill-effect--basic-spin .effect-burst {
  animation: spin-burst-ring 0.26s ease-out 0.16s forwards;
}

.boss-action .preview-body {
  animation: boss-cast 0.72s ease-out 1;
}

.boss-action .preview-burst {
  opacity: 0.78;
  animation: telegraph-burst 0.68s ease-out 1;
}

.character-impact .preview-character {
  animation: impact-pop 0.5s ease-out 1;
}

.character-impact .preview-burst {
  opacity: 0.9;
  animation: hit-ring 0.46s ease-out 1;
}

.boss-impact .boss-pattern--volley .boss-telegraph-cone {
  animation: boss-cone-telegraph 0.42s ease-out forwards;
}

.boss-impact .boss-pattern--volley .boss-strike-cone {
  animation: boss-cone-hit 0.16s ease-out 0.34s forwards;
}

.boss-impact .boss-pattern--charge .boss-telegraph-line {
  animation: boss-line-telegraph 0.4s ease-out forwards;
}

.boss-impact .boss-pattern--charge .boss-strike-line {
  animation: boss-line-hit 0.18s ease-out 0.36s forwards;
}

.boss-impact .boss-pattern--slam .boss-telegraph-circle {
  animation: boss-circle-telegraph 0.44s ease-out forwards;
}

.boss-impact .boss-pattern--slam .boss-strike-circle {
  animation: boss-circle-hit 0.18s ease-out 0.4s forwards;
}

.card-copy {
  margin-top: 18px;
}

.card-type {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.card-copy h2 {
  margin: 0;
  font-size: 34px;
}

.card-copy strong {
  display: block;
  margin-top: 8px;
  color: color-mix(in srgb, var(--item-accent) 72%, white 18%);
}

.card-copy p:last-child {
  margin: 10px 0 0;
  color: var(--muted);
  line-height: 1.65;
}

.mode-row {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.mode-button {
  padding: 10px 16px;
}

@keyframes float-idle {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.02); }
}

@keyframes knight-idle {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.015); }
}

@keyframes mage-idle {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.01); }
}

@keyframes paladin-idle {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.02); }
}

@keyframes boss-idle {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.04); }
}

@keyframes lunge {
  0% { transform: translateX(-16px) rotate(-8deg) scale(0.96); }
  55% { transform: translateX(26px) rotate(6deg) scale(1.04); }
  100% { transform: translateX(0) rotate(0) scale(1); }
}

@keyframes knight-lunge {
  0% { transform: translateX(-10px) rotate(-4deg) scale(0.98); }
  55% { transform: translateX(22px) rotate(3deg) scale(1.03); }
  100% { transform: translateX(0) rotate(0) scale(1); }
}

@keyframes swordsman-strike {
  0% { transform: translateX(-8px) rotate(-2deg) scale(0.99); }
  38% { transform: translateX(10px) rotate(2deg) scale(1.02); }
  100% { transform: translateX(-8px) rotate(0deg) scale(1); }
}

@keyframes mage-cast {
  0% { transform: translateY(0) scale(0.98); filter: brightness(0.94); }
  45% { transform: translateY(-8px) scale(1.04); filter: brightness(1.18); }
  100% { transform: translateY(0) scale(1); filter: brightness(1); }
}

@keyframes paladin-smash {
  0% { transform: translateX(-8px) scale(0.98); }
  50% { transform: translateX(16px) scale(1.04); }
  100% { transform: translateX(0) scale(1); }
}

@keyframes sword-swing {
  0% { transform: rotate(-18deg); }
  45% { transform: rotate(36deg); }
  100% { transform: rotate(8deg); }
}

@keyframes swordsman-sword-swing {
  0% { transform: rotate(18deg); }
  38% { transform: rotate(0deg); }
  100% { transform: rotate(16deg); }
}

@keyframes staff-cast {
  0% { transform: rotate(-8deg); }
  45% { transform: rotate(18deg) translateY(-6px); }
  100% { transform: rotate(0deg); }
}

@keyframes hammer-swing {
  0% { transform: rotate(-8deg); }
  45% { transform: rotate(28deg); }
  100% { transform: rotate(6deg); }
}

@keyframes shield-brace {
  0% { transform: rotate(-10deg) translateX(0); }
  45% { transform: rotate(-20deg) translateX(-6px); }
  100% { transform: rotate(-10deg) translateX(0); }
}

@keyframes guard-front {
  0% { transform: rotate(-10deg) translateX(0) scale(1); }
  100% { transform: rotate(-18deg) translateX(10px) scale(1.06); }
}

@keyframes arm-swing {
  0% { transform: rotate(8deg); }
  45% { transform: rotate(-26deg); }
  100% { transform: rotate(0deg); }
}

@keyframes swordsman-arm-swing {
  0% { transform: rotate(-1deg); }
  38% { transform: rotate(-13deg); }
  100% { transform: rotate(-3deg); }
}

@keyframes mage-arm-cast {
  0% { transform: rotate(8deg); }
  45% { transform: rotate(-10deg) translateY(-8px); }
  100% { transform: rotate(0deg); }
}

@keyframes step-forward {
  0% { transform: rotate(0deg); }
  45% { transform: rotate(18deg); }
  100% { transform: rotate(0deg); }
}

@keyframes step-back {
  0% { transform: rotate(0deg); }
  45% { transform: rotate(-14deg); }
  100% { transform: rotate(0deg); }
}

@keyframes boss-cast {
  0% { transform: scale(0.92); filter: brightness(0.9); }
  45% { transform: scale(1.12); filter: brightness(1.2); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes slash-flare {
  0% { transform: scaleX(0.4) rotate(-28deg); opacity: 0; }
  20% { opacity: 0.9; }
  100% { transform: scaleX(1.2) rotate(18deg); opacity: 0; }
}

@keyframes telegraph-burst {
  0% { transform: scale(0.3); opacity: 0; }
  25% { opacity: 0.8; }
  100% { transform: scale(1.2); opacity: 0; }
}

@keyframes effect-line-fire {
  0% { opacity: 0; transform: scaleX(0.18); }
  20% { opacity: 0.9; }
  100% { opacity: 0.3; transform: scaleX(1); }
}

@keyframes fan-line-fire {
  0% { opacity: 0; transform: scaleX(0.18); }
  30% { opacity: 0.78; }
  100% { opacity: 0.18; transform: scaleX(1); }
}

@keyframes projectile-flight {
  0% { opacity: 0; transform: translate(0, 0) scale(0.7); }
  10% { opacity: 1; }
  100% { opacity: 0.2; transform: translate(300px, 0) scale(1.1); }
}

@keyframes projectile-flight-fan-a {
  0% { opacity: 0; transform: translate(0, 0) scale(0.7); }
  10% { opacity: 1; }
  100% { opacity: 0.2; transform: translate(290px, -48px) scale(1.06); }
}

@keyframes projectile-flight-fan-c {
  0% { opacity: 0; transform: translate(0, 0) scale(0.7); }
  10% { opacity: 1; }
  100% { opacity: 0.2; transform: translate(290px, 48px) scale(1.06); }
}

@keyframes target-ping {
  0% { opacity: 0; transform: scale(0.5); }
  70% { opacity: 0; }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes target-wide-ping {
  0% { opacity: 0; transform: scale(0.6); }
  60% { opacity: 0.1; }
  100% { opacity: 0.72; transform: scale(1); }
}

@keyframes ground-telegraph-grow {
  0% { opacity: 0; transform: scale(0.42); }
  100% { opacity: 0.82; transform: scale(1); }
}

@keyframes ground-impact-blast {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.94; }
  100% { opacity: 0; transform: scale(1.18); }
}

@keyframes target-burst-ping {
  0% { opacity: 0; transform: scale(0.7); }
  100% { opacity: 0.78; transform: scale(1); }
}

@keyframes spin-telegraph {
  0% { opacity: 0; transform: scale(0.68); }
  55% { opacity: 0.46; transform: scale(1.02); }
  100% { opacity: 0.18; transform: scale(1.08); }
}

@keyframes spin-impact {
  0% { opacity: 0; transform: scale(0.72); }
  50% { opacity: 0.82; transform: scale(1.02); }
  100% { opacity: 0; transform: scale(1.18); }
}

@keyframes spin-target-ping {
  0% { opacity: 0; transform: scale(0.82); }
  45% { opacity: 0.74; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.14); }
}

@keyframes spin-burst-ring {
  0% { opacity: 0; transform: scale(0.74) rotate(0deg); }
  55% { opacity: 0.72; transform: scale(1.02) rotate(20deg); }
  100% { opacity: 0; transform: scale(1.16) rotate(42deg); }
}

@keyframes cone-telegraph {
  0% { opacity: 0; transform: scaleX(0.2); }
  100% { opacity: 0.7; transform: scaleX(1); }
}

@keyframes cone-hit {
  0% { opacity: 0; transform: scale(0.6); }
  40% { opacity: 0.92; }
  100% { opacity: 0; transform: scale(1.18); }
}

@keyframes boss-cone-telegraph {
  0% { opacity: 0; transform: scaleX(0.24); }
  100% { opacity: 0.74; transform: scaleX(1); }
}

@keyframes boss-cone-hit {
  0% { opacity: 0; transform: scale(0.72); }
  40% { opacity: 0.94; }
  100% { opacity: 0; transform: scale(1.14); }
}

@keyframes boss-line-telegraph {
  0% { opacity: 0; transform: scaleX(0.18); }
  100% { opacity: 0.82; transform: scaleX(1); }
}

@keyframes boss-line-hit {
  0% { opacity: 0; transform: translateX(-24px) scaleY(0.7); }
  30% { opacity: 0.96; }
  100% { opacity: 0; transform: translateX(18px) scaleY(1.06); }
}

@keyframes boss-circle-telegraph {
  0% { opacity: 0; transform: scale(0.42); }
  100% { opacity: 0.82; transform: scale(1); }
}

@keyframes boss-circle-hit {
  0% { opacity: 0; transform: scale(0.54); }
  40% { opacity: 0.94; }
  100% { opacity: 0; transform: scale(1.18); }
}

@keyframes impact-pop {
  0% { transform: scale(1); }
  28% { transform: scale(1.15); }
  55% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

@keyframes hit-ring {
  0% { transform: scale(0.35); opacity: 0; }
  40% { opacity: 0.9; }
  100% { transform: scale(1.18); opacity: 0; }
}

@media (max-width: 1080px) {
  .test-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .test-grid {
    grid-template-columns: 1fr;
  }

  .test-sidebar {
    position: static;
  }

  .test-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .test-shell {
    padding: 28px 16px 40px;
  }

  .preview-surface {
    height: 360px;
  }

  .mode-row {
    flex-wrap: wrap;
  }
}
</style>
