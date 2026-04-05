<script setup lang="ts">
defineProps<{
  bindings: { key: string, label: string }[]
}>()

defineEmits<{
  enter: []
}>()
</script>

<template>
  <section class="menu-shell">
    <div class="menu-card">
      <p class="eyebrow">Boss Arena Prototype</p>
      <h1>쿼터뷰 보스전 프로토타입</h1>

      <p class="lead">
        단일 플레이어가 단일 보스를 상대하는 웹 보스전 프로토타입입니다.
      </p>
      <p class="desc">
        핵심은 보스 패턴을 읽고 피하면서, 자동 평타와 스킬 타이밍으로 빈틈을 공략하는 전투입니다.
        아래 버튼을 누르면 전투 준비 화면으로 이동합니다.
      </p>

      <div class="cta">
        <button class="primary" @click="$emit('enter')">게임 시작 화면으로 이동</button>
        <p class="hint">버튼 클릭 → 로딩 → 보스전 시작</p>
      </div>

      <div class="info-grid">
        <section class="panel">
          <h2>이 게임은</h2>
          <p>탐험형이 아니라 바로 보스와 맞붙는 아레나 전투형 프로토타입입니다.</p>
        </section>

        <section class="panel">
          <h2>조작</h2>
          <ul class="key-list">
            <li v-for="binding in bindings" :key="binding.key">
              <strong>{{ binding.key }}</strong>
              <span>{{ binding.label }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.menu-shell {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
}

.menu-card {
  width: min(960px, 100%);
  padding: 40px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: rgba(8, 18, 28, 0.94);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(36px, 6vw, 64px);
  line-height: 1.02;
}

.lead {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.desc {
  margin: 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.7;
}

.cta {
  margin-top: 28px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
}

.primary {
  padding: 16px 24px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #67e8f9, #b6f4de);
  color: #052030;
  font-weight: 800;
  cursor: pointer;
}

.hint {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.panel {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.key-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.key-list li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--muted);
}

.key-list strong {
  color: var(--text);
}

@media (max-width: 960px) {
  .menu-shell {
    padding: 16px;
  }

  .menu-card {
    padding: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
