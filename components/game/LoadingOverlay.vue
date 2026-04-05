<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="overlay">
    <div class="card">
      <div class="spinner" />
      <p class="eyebrow">Loading Arena</p>
      <h2>전투 준비 중</h2>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 8, 14, 0.62);
}

.card {
  width: min(420px, calc(100% - 32px));
  padding: 30px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--panel-strong);
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 18px;
  border: 4px solid rgba(255, 255, 255, 0.08);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
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
  font-size: 32px;
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
