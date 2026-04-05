<script setup lang="ts">
import type { CharacterDefinition, CharacterId } from '~/game/core/types'

defineProps<{
  characters: CharacterDefinition[]
  selectedCharacterId: CharacterId | null
}>()

defineEmits<{
  select: [characterId: CharacterId]
  next: []
  back: []
}>()
</script>

<template>
  <section class="screen">
    <div class="shell">
      <header class="header">
        <div>
          <p class="eyebrow">1. Character Select</p>
          <h1>캐릭터를 고르세요</h1>
          <p class="description">A 검사, B 마법사, C 성기사 중 하나를 선택하고 다음 단계로 진행합니다.</p>
        </div>
        <button class="ghost" @click="$emit('back')">메인으로</button>
      </header>

      <div class="grid">
        <button
          v-for="character in characters"
          :key="character.id"
          class="card"
          :class="{ active: selectedCharacterId === character.id }"
          @click="$emit('select', character.id)"
        >
          <span class="code">{{ character.code }}</span>
          <strong>{{ character.name }}</strong>
          <small>{{ character.title }}</small>
          <p>{{ character.description }}</p>
          <div class="stats">
            <span>HP {{ character.maxHp }}</span>
            <span>MP {{ character.maxMp }}</span>
          </div>
        </button>
      </div>

      <footer class="footer">
        <p>{{ selectedCharacterId ? '캐릭터 선택 완료. 다음 단계에서 스킬 5개 중 3개를 고릅니다.' : '캐릭터를 먼저 선택하세요.' }}</p>
        <button class="primary" :disabled="!selectedCharacterId" @click="$emit('next')">다음: 스킬 선택</button>
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
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 10px;
  font-size: clamp(32px, 5vw, 48px);
}

.description,
.footer p {
  margin: 0;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.card {
  text-align: left;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  cursor: pointer;
}

.card.active {
  border-color: rgba(103, 232, 249, 0.6);
  box-shadow: inset 0 0 0 1px rgba(103, 232, 249, 0.32);
}

.code {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: rgba(103, 232, 249, 0.14);
  color: var(--accent);
  font-weight: 800;
}

.card strong {
  display: block;
  font-size: 24px;
}

.card small,
.card p,
.stats {
  color: var(--muted);
}

.card p {
  min-height: 48px;
  line-height: 1.6;
}

.stats {
  display: flex;
  gap: 12px;
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
