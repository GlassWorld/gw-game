<script setup lang="ts">
defineProps<{
  message: string
  bindings: { key: string, label: string }[]
}>()

defineEmits<{
  start: []
}>()
</script>

<template>
  <div class="overlay">
    <div class="card ui-clickable">
      <div class="hero">
        <p class="eyebrow">Quarter View Boss Arena</p>
        <h2>보스전 프로토타입</h2>
        <p class="summary">{{ message }}</p>
      </div>

      <div class="grid">
        <section class="panel">
          <h3>게임 소개</h3>
          <p>
            탐험 없이 바로 보스와 맞붙는 아레나 전투입니다. 핵심은 패턴을 읽고,
            장판과 탄막을 피하면서 공격 타이밍을 잡는 것입니다.
          </p>
        </section>

        <section class="panel">
          <h3>조작 키</h3>
          <ul>
            <li v-for="binding in bindings" :key="binding.key">
              <strong>{{ binding.key }}</strong>
              <span>{{ binding.label }}</span>
            </li>
          </ul>
        </section>
      </div>

      <button @click="$emit('start')">게임 시작</button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(3, 8, 14, 0.42);
}

.card {
  width: min(760px, calc(100% - 32px));
  padding: 30px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--panel-strong);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
}

h2 {
  margin: 0 0 12px;
  font-size: clamp(34px, 6vw, 52px);
}

.summary,
.panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.hero {
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.panel {
  min-height: 188px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
}

.panel h3 {
  margin: 0 0 12px;
  font-size: 17px;
}

.panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.panel li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--muted);
}

.panel strong {
  color: var(--text);
}

button {
  margin-top: 20px;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #67e8f9, #8df7d6);
  color: #052030;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
