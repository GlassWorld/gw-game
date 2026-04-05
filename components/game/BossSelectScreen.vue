<script setup lang="ts">
import type { BossDefinition } from '~/game/core/types'

const props = defineProps<{
  bosses: BossDefinition[]
  clearedBosses: BossDefinition[]
  totalBossCount: number
  selectedBossId: string | null
}>()

const emit = defineEmits<{
  select: [bossId: string]
  next: []
  back: []
}>()

const rolling = ref(false)
const displayFace = ref('?')
const rollingMessage = ref('`주사위 굴리기`를 눌러 윗면의 보스를 확정합니다.')
const bossRevealKey = ref(0)
let rollingTimer: ReturnType<typeof setInterval> | null = null
let finishTimer: ReturnType<typeof setTimeout> | null = null
let autoNextTimer: ReturnType<typeof setTimeout> | null = null

const diceFaces = computed(() => {
  if (props.bosses.length > 0) {
    return props.bosses.map((boss) => boss.diceFace)
  }

  return ['I', 'II', 'III', 'IV', 'V', 'VI']
})

const rolledBoss = computed(() => (
  props.bosses.find((boss) => boss.id === props.selectedBossId) ?? null
))

const hasRemainingBoss = computed(() => props.bosses.length > 0)

watch(rolledBoss, (boss) => {
  if (!rolling.value) {
    displayFace.value = boss?.diceFace ?? '?'
  }
}, { immediate: true })

const clearRollingTimers = () => {
  if (rollingTimer) {
    clearInterval(rollingTimer)
    rollingTimer = null
  }

  if (finishTimer) {
    clearTimeout(finishTimer)
    finishTimer = null
  }

  if (autoNextTimer) {
    clearTimeout(autoNextTimer)
    autoNextTimer = null
  }
}

const rollBoss = () => {
  if (rolling.value || props.bosses.length === 0) {
    return
  }

  clearRollingTimers()
  rolling.value = true
  rollingMessage.value = '주사위가 굴러가는 중... 윗면이 고정될 때까지 기다리세요.'

  let faceIndex = 0
  const faceSequence = props.bosses.length > 1
    ? [...diceFaces.value, ...diceFaces.value]
    : ['II', 'V', 'III', 'I', 'IV', props.bosses[0].diceFace]

  displayFace.value = faceSequence[0] ?? '?'

  rollingTimer = setInterval(() => {
    faceIndex = (faceIndex + 1) % faceSequence.length
    displayFace.value = faceSequence[faceIndex] ?? '?'
  }, 120)

  finishTimer = setTimeout(() => {
    clearRollingTimers()
    const nextBoss = props.bosses[Math.floor(Math.random() * props.bosses.length)]
    emit('select', nextBoss.id)
    displayFace.value = nextBoss.diceFace
    bossRevealKey.value += 1
    rolling.value = false
    rollingMessage.value = `${nextBoss.name} 이(가) 선택되었습니다. 잠시 후 다음 단계로 이동합니다.`
    autoNextTimer = setTimeout(() => {
      autoNextTimer = null
      emit('next')
    }, 700)
  }, 1080)
}

onBeforeUnmount(() => {
  clearRollingTimers()
})
</script>

<template>
  <section class="screen">
    <div class="shell">
      <header class="header">
        <div>
          <p class="eyebrow">2. Boss Roll</p>
          <h1>다음 보스를 결정하세요</h1>
          <p class="description">
            정식 버전에서는 주사위를 굴려 남은 보스 중 하나가 선택됩니다.
            현재 남은 보스는 {{ bosses.length }} / {{ totalBossCount }} 입니다.
          </p>
        </div>
        <button class="ghost" @click="$emit('back')">이전 단계</button>
      </header>

      <div class="roll-layout">
        <section class="dice-panel">
          <p class="panel-label">Boss Dice</p>
          <div class="dice-wrap">
            <button class="dice" :class="{ 'dice--rolling': rolling }" type="button" @click="rollBoss">
              <span>{{ displayFace }}</span>
            </button>
          </div>
          <p class="dice-copy">{{ rollingMessage }}</p>
          <button class="primary" type="button" :disabled="rolling || !hasRemainingBoss" @click="rollBoss">
            {{ !hasRemainingBoss ? '남은 보스 없음' : rolling ? '굴리는 중...' : '주사위 굴리기' }}
          </button>
        </section>

        <section
          class="boss-panel"
          :class="{ 'boss-panel--active': rolledBoss }"
          :style="{
            '--boss-accent': rolledBoss?.accentColor ?? '#ff7f6a',
            '--boss-accent-soft': rolledBoss ? `color-mix(in srgb, ${rolledBoss.accentColor} 24%, transparent)` : 'transparent'
          }"
        >
          <p class="panel-label">Selected Boss</p>
          <div v-if="rolledBoss" :key="bossRevealKey" class="boss-card boss-card--reveal">
            <div class="portrait">
              <div class="portrait-core" />
            </div>
            <div class="boss-copy">
              <p class="region">{{ rolledBoss.region }}</p>
              <strong>{{ rolledBoss.name }}</strong>
              <span>{{ rolledBoss.title }}</span>
              <p>{{ rolledBoss.description }}</p>
            </div>
          </div>
          <div v-else class="boss-empty">
            <p>{{ hasRemainingBoss ? '아직 선택된 보스가 없습니다. 주사위를 굴려 보스를 확정하세요.' : '이번 런에서 남은 보스가 없습니다. 모든 면이 정리되었습니다.' }}</p>
          </div>
        </section>
      </div>

      <section class="progress-panel">
        <div>
          <p class="panel-label">Run Progress</p>
          <strong>{{ clearedBosses.length }} / {{ totalBossCount }} 처치 완료</strong>
        </div>
        <div v-if="clearedBosses.length > 0" class="cleared-list">
          <span v-for="boss in clearedBosses" :key="boss.id" class="cleared-chip">{{ boss.name }}</span>
        </div>
        <p v-else class="progress-copy">아직 클리어한 보스가 없습니다.</p>
      </section>

      <footer class="footer">
        <p>
          {{ !hasRemainingBoss
            ? '이번 런의 모든 보스를 이미 돌파했습니다.'
            : rolledBoss
            ? `이번 전투 지역은 ${rolledBoss.region} 입니다. 다음 단계에서 현재 구조상 대기소 세팅으로 이동합니다.`
            : '보스를 먼저 확정하세요.' }}
        </p>
        <button class="primary" :disabled="!rolledBoss || rolling || !hasRemainingBoss" @click="$emit('next')">다음: 대기소 세팅</button>
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

.eyebrow,
.panel-label {
  margin: 0 0 8px;
  color: var(--gold);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 10px;
  font-size: clamp(32px, 5vw, 48px);
}

.description,
.footer p,
.dice-copy,
.boss-copy span,
.boss-copy p,
.boss-empty p {
  margin: 0;
  color: var(--muted);
}

.roll-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 18px;
  margin: 24px 0;
}

.dice-panel,
.boss-panel {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
}

.progress-panel {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
}

.progress-panel strong {
  display: block;
  margin-top: 6px;
  font-size: 22px;
}

.progress-copy {
  margin: 0;
  color: var(--muted);
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
  border: 1px solid rgba(246, 196, 83, 0.18);
  border-radius: 999px;
  background: rgba(246, 196, 83, 0.1);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}

.dice-wrap {
  display: grid;
  place-items: center;
  min-height: 280px;
}

.dice {
  display: grid;
  place-items: center;
  width: 180px;
  height: 180px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 32px;
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.16), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  color: var(--text);
  cursor: pointer;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
}

.dice--rolling {
  animation: dice-spin 0.24s linear infinite;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.4);
}

.dice span {
  font-size: 64px;
  font-weight: 800;
}

.boss-panel {
  min-height: 420px;
  background:
    radial-gradient(circle at top right, var(--boss-accent-soft, transparent), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
  transition: border-color 180ms ease, box-shadow 180ms ease, background 220ms ease;
}

.boss-panel--active {
  border-color: color-mix(in srgb, var(--boss-accent) 50%, white 10%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--boss-accent) 38%, transparent);
}

.boss-card {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
}

.boss-card--reveal {
  animation: boss-reveal 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.portrait {
  position: relative;
  min-height: 320px;
  border-radius: 30px;
  background:
    radial-gradient(circle at 50% 32%, color-mix(in srgb, var(--boss-accent) 58%, white 8%), transparent 24%),
    radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.08), transparent 40%),
    linear-gradient(180deg, rgba(21, 24, 34, 0.94), rgba(8, 12, 18, 0.98));
  overflow: hidden;
}

.portrait-core {
  position: absolute;
  inset: auto 18% 18% 18%;
  height: 62%;
  border-radius: 999px 999px 34px 34px;
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.32), transparent 20%),
    linear-gradient(180deg, color-mix(in srgb, var(--boss-accent) 60%, #220c0c), #14090b);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 18px 44px rgba(0, 0, 0, 0.35);
}

.region {
  margin-bottom: 10px;
  color: var(--gold);
  font-size: 14px;
  font-weight: 700;
}

.boss-copy strong {
  display: block;
  margin-bottom: 8px;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1;
}

.boss-copy span {
  display: block;
  margin-bottom: 18px;
}

.boss-copy p {
  line-height: 1.7;
}

.boss-copy strong,
.region {
  text-shadow: 0 8px 24px color-mix(in srgb, var(--boss-accent) 24%, transparent);
}

.boss-empty {
  display: grid;
  place-items: center;
  min-height: 320px;
  border-radius: 24px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
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

@keyframes dice-spin {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(10deg) scale(1.04);
  }

  100% {
    transform: rotate(0deg) scale(1);
  }
}

@keyframes boss-reveal {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 1100px) {
  .roll-layout,
  .boss-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .shell {
    padding: 20px;
  }

  .progress-panel,
  .header,
  .footer {
    flex-direction: column;
    align-items: start;
  }

  .dice-wrap {
    min-height: 220px;
  }

  .dice {
    width: 148px;
    height: 148px;
  }
}
</style>
