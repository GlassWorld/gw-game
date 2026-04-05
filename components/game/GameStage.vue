<script setup lang="ts">
defineProps<{
  containerId: string
}>()
</script>

<template>
  <section class="stage-shell" @contextmenu.prevent>
    <div :id="containerId" class="stage-canvas" />
    <div class="stage-overlay">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.stage-shell {
  position: relative;
  width: min(100%, 1680px);
  aspect-ratio: 2560 / 1560;
  max-height: calc(100dvh - 180px);
  margin: 0 auto;
  border: 1px solid var(--line);
  border-radius: 32px;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(79, 209, 197, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(8, 20, 31, 0.9), rgba(10, 15, 23, 0.98));
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.stage-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.stage-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.stage-canvas > * {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
}

.stage-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.stage-overlay :deep(.ui-clickable) {
  pointer-events: auto;
}

@media (max-width: 960px) {
  .stage-shell {
    max-height: calc(100dvh - 140px);
  }
}
</style>
