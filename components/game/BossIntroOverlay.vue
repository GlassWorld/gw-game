<script setup lang="ts">
import type { BossCutsceneFrame } from '~/game/core/types'

defineProps<{
  frame: BossCutsceneFrame
  index: number
  total: number
  accentColor?: string
}>()

defineEmits<{
  next: []
  skip: []
}>()
</script>

<template>
  <div class="overlay">
    <div
      class="card"
      :style="{
        '--boss-accent': accentColor ?? '#ff7f6a',
        '--boss-accent-soft': accentColor ? `color-mix(in srgb, ${accentColor} 24%, transparent)` : 'rgba(255, 127, 106, 0.2)'
      }"
    >
      <p class="eyebrow">{{ frame.stageLabel }}</p>
      <p class="progress">Scene {{ index + 1 }} / {{ total }}</p>
      <strong>{{ frame.title }}</strong>
      <p v-if="frame.speaker" class="speaker">{{ frame.speaker }}</p>
      <p class="text">{{ frame.text }}</p>

      <div class="actions">
        <button class="ghost" @click="$emit('skip')">건너뛰기</button>
        <button class="primary" @click="$emit('next')">
          {{ index + 1 >= total ? '전투 준비' : '다음 컷' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  z-index: 32;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at center, rgba(255, 127, 106, 0.12), transparent 40%),
    rgba(2, 8, 14, 0.82);
  backdrop-filter: blur(12px);
}

.card {
  width: min(620px, calc(100% - 32px));
  padding: 28px 30px;
  border: 1px solid var(--boss-accent-soft);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(8, 18, 28, 0.96);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
}

.eyebrow,
.progress {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--boss-accent);
}

.progress {
  margin-top: 8px;
  color: var(--muted);
}

strong {
  display: block;
  margin-top: 18px;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.08;
}

.speaker {
  margin: 16px 0 0;
  color: var(--gold);
  font-weight: 700;
}

.text {
  margin: 12px 0 0;
  color: var(--text);
  line-height: 1.8;
  white-space: pre-line;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
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
  background: linear-gradient(90deg, var(--boss-accent), #ffd29f);
  color: #1a1010;
}
</style>
