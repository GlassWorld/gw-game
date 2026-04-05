<script setup lang="ts">
defineProps<{
  result: 'victory' | 'defeat' | null
}>()

defineEmits<{
  restart: []
  title: []
}>()
</script>

<template>
  <div class="overlay">
    <div class="card ui-clickable">
      <p class="eyebrow">{{ result === 'victory' ? 'Boss Down' : 'Run Failed' }}</p>
      <h2>{{ result === 'victory' ? '클리어' : '게임 오버' }}</h2>
      <p>
        {{ result === 'victory' ? '패턴 파훼와 회피 루프가 정상적으로 작동했습니다.' : '재시작해서 패턴 대응과 회피 타이밍을 다시 확인해보세요.' }}
      </p>
      <div class="actions">
        <button class="ghost" @click="$emit('title')">타이틀로</button>
        <button @click="$emit('restart')">다시 시작</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(3, 8, 14, 0.56);
}

.card {
  width: min(460px, calc(100% - 32px));
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--panel-strong);
  text-align: center;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
}

h2 {
  margin: 0 0 12px;
  font-size: 34px;
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

button {
  margin-top: 20px;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #f6c453, #ff8f70);
  color: #2d1605;
  font-weight: 700;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.actions button {
  margin-top: 0;
}

.ghost {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
}
</style>
