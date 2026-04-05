<script setup lang="ts">
defineProps<{
  countdown: number | null
}>()
</script>

<template>
  <div class="overlay">
    <div class="card">
      <p class="eyebrow">Battle Countdown</p>
      <h2>{{ countdown && countdown > 0 ? countdown : 'START' }}</h2>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 8, 14, 0.26);
}

.card {
  min-width: 220px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: rgba(8, 18, 28, 0.92);
  text-align: center;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--gold);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 72px;
  line-height: 1;
}
</style>
