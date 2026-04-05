<script setup lang="ts">
import type { Ref } from 'vue'
import type { BattleResult } from '~/game/core/types'
import BossIntroOverlay from '~/components/game/BossIntroOverlay.vue'
import BossSelectScreen from '~/components/game/BossSelectScreen.vue'
import CharacterSelectScreen from '~/components/game/CharacterSelectScreen.vue'
import CountdownOverlay from '~/components/game/CountdownOverlay.vue'
import GameStage from '~/components/game/GameStage.vue'
import HubSetupScreen from '~/components/game/HubSetupScreen.vue'
import HudLayer from '~/components/game/HudLayer.vue'
import LoadingOverlay from '~/components/game/LoadingOverlay.vue'
import ResultOverlay from '~/components/game/ResultOverlay.vue'
import { bossData } from '~/game/boss/bossData'
import { characterData } from '~/game/character/characterData'

const battleState = useBattleState()
const inputBindings = useInputBindings()
const selection = useBattleSelection()
const travelOverlay = useTravelOverlay()
const bossCutscene = useBossCutscene()
const {
  selectedCharacterId,
  selectedBossId,
  selectedSkillIds,
  selectedStatId,
  selectedPotionId,
  totalCurrency,
  totalSkillUpgradePoints,
  latestReward,
  clearedBossIds,
  runCompleted,
  selectedCharacter,
  availableSkills,
  selectedBoss,
  availableBosses,
  clearedBosses,
  createBattleSetup,
  resetHubSelections,
  resetRunProgress,
  selectCharacter,
  selectBoss,
  toggleSkill,
  applyRunReward
} = selection
const {
  overlay: travelOverlayState,
  open: openTravelOverlay,
  close: closeTravelOverlay,
  reset: resetTravelOverlay
} = travelOverlay
const {
  activeFrames: activeBossCutsceneFrames,
  activeIndex: activeBossCutsceneIndex,
  currentFrame: currentBossCutsceneFrame,
  play: playBossCutscene,
  advance: advanceBossCutscene,
  skip: skipBossCutscene,
  finish: finishBossCutscene
} = bossCutscene
let onBattleEnd: (result: BattleResult) => void | Promise<void> = (result) => {
  battleState.setResult(result)
}

const game = useGameBootstrap({
  battleState,
  onBattleEnd: (result) => onBattleEnd(result)
})
const flow = useBattleFlow({
  battleState,
  selection: {
    selectedBossId,
    totalCurrency,
    totalSkillUpgradePoints,
    clearedBossIds,
    runCompleted,
    selectedCharacter,
    selectedBoss,
    availableBosses,
    createBattleSetup,
    resetHubSelections,
    resetRunProgress,
    applyRunReward
  },
  travelOverlay: {
    open: openTravelOverlay,
    close: closeTravelOverlay,
    reset: resetTravelOverlay
  },
  bossCutscene: {
    play: playBossCutscene,
    finish: finishBossCutscene
  },
  game
})
const {
  pageView,
  goHome,
  goCharacterSelect,
  goBossSelect,
  goHubSetup,
  goNextBossRoll,
  enterPractice,
  startBossBattle,
  restartBattle,
  goCharacterSelectFromResult,
  goHubFromPractice,
} = flow
onBattleEnd = flow.handleBattleEnd

const toggleSingleSelect = (stateRef: Ref<string | null>, optionId: string) => {
  stateRef.value = stateRef.value === optionId ? null : optionId
}
</script>

<template>
  <main class="page">
    <Transition name="travel-fade">
      <div v-if="travelOverlayState.active" class="travel-overlay">
        <div class="travel-card">
          <p class="eyebrow">Transition</p>
          <strong>{{ travelOverlayState.title }}</strong>
          <p>{{ travelOverlayState.body }}</p>
        </div>
      </div>
    </Transition>

    <Transition name="flow-fade" mode="out-in">
      <section v-if="pageView === 'home'" key="home" class="home-screen">
        <div class="home-card">
          <p class="eyebrow">Random Boss Break</p>
          <h1>RBB</h1>
          <p class="lead">캐릭터와 스킬을 고르고 다양한 보스를 물리치는 게임</p>
          <p class="description">보스 종류에 따라 기믹, 지형, 패턴이 달라지는 보스 러시형 액션 게임을 목표로 하는 프로토타입입니다.</p>

          <div v-if="runCompleted" class="run-complete-banner">
            <strong>이번 런을 클리어했습니다.</strong>
            <p>총 획득: 재화 {{ totalCurrency }}, 강화 포인트 {{ totalSkillUpgradePoints }}</p>
          </div>

          <div class="home-actions">
            <button class="primary" @click="goCharacterSelect">시작하기</button>
            <p class="hint">캐릭터 선택 → 보스 결정 → 대기소 세팅 → 연습 공간 → 보스전 진입</p>
          </div>

          <div class="home-grid">
            <section class="info-panel">
              <h2>핵심 루프</h2>
              <p>캐릭터를 고르고, 다음 보스를 확인하고, 대기소에서 세팅한 뒤 연습 공간을 거쳐 보스전에 들어갑니다.</p>
            </section>

            <section class="info-panel">
              <h2>조작</h2>
              <ul class="binding-list">
                <li v-for="binding in inputBindings.bindings" :key="binding.key">
                  <strong>{{ binding.key }}</strong>
                  <span>{{ binding.label }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      <CharacterSelectScreen
        v-else-if="pageView === 'character'"
        key="character"
        :characters="characterData"
        :selected-character-id="selectedCharacterId"
        @select="selectCharacter"
        @next="goBossSelect"
        @back="goHome"
      />

      <BossSelectScreen
        v-else-if="pageView === 'boss'"
        key="boss"
        :bosses="availableBosses"
        :cleared-bosses="clearedBosses"
        :total-boss-count="bossData.length"
        :selected-boss-id="selectedBossId"
        @select="selectBoss"
        @next="goHubSetup"
        @back="pageView = 'character'"
      />

      <HubSetupScreen
        v-else-if="pageView === 'hub' && selectedCharacter && selectedBoss"
        key="hub"
        :character="selectedCharacter"
        :boss="selectedBoss"
        :skills="availableSkills"
        :selected-skill-ids="selectedSkillIds"
        :selected-stat-id="selectedStatId"
        :selected-potion-id="selectedPotionId"
        :reward-summary="latestReward"
        :total-currency="totalCurrency"
        :total-skill-upgrade-points="totalSkillUpgradePoints"
        :has-next-boss="availableBosses.length > 0"
        :cleared-bosses="clearedBosses"
        :total-boss-count="bossData.length"
        @toggle-skill="toggleSkill"
        @update-stat="toggleSingleSelect(selectedStatId, $event)"
        @update-potion="toggleSingleSelect(selectedPotionId, $event)"
        @back="pageView = 'boss'"
        @reroll-boss="goNextBossRoll"
        @confirm="enterPractice"
      />

      <section v-else key="stage" class="stage-page stage-enter">
        <header class="stage-header">
          <div class="stage-copy">
            <p class="eyebrow">Boss Arena</p>
            <h1>{{ battleState.state.playerName }} vs {{ battleState.state.bossName }}</h1>
            <p class="description">
              페이즈 전환과 패턴 템포를 읽으면서 우클릭 이동, 자동 평타, 선택 스킬 3개로 현재 보스를 공략합니다.
            </p>
          </div>

          <div class="stage-actions">
            <button class="ghost" @click="goHome">메인으로</button>
          </div>
        </header>

        <GameStage :container-id="game.containerId">
          <BossIntroOverlay
            v-if="currentBossCutsceneFrame"
            :frame="currentBossCutsceneFrame"
            :index="activeBossCutsceneIndex"
            :total="activeBossCutsceneFrames.length"
            :accent-color="selectedBoss?.accentColor"
            @next="advanceBossCutscene"
            @skip="skipBossCutscene"
          />

          <HudLayer
            v-if="battleState.state.phase === 'practice' || battleState.state.phase === 'running' || battleState.state.phase === 'result'"
            :state="battleState.state"
            :skill-order="battleState.currentSetup?.selectedSkillIds ?? []"
          />

          <div
            v-if="battleState.state.phase === 'practice'"
            class="practice-panel panel ui-clickable"
          >
            <div>
              <p class="eyebrow">Practice Arena</p>
              <strong>연습 공간</strong>
              <p class="practice-copy">지금은 보스 공격이 없는 연습 상태입니다. 대기소에서 고른 세팅을 시험한 뒤 실제 보스전에 들어가세요.</p>
            </div>
            <div class="practice-actions">
              <button class="ghost" @click="goHubFromPractice">대기소로</button>
              <button class="primary" @click="startBossBattle">보스전 시작</button>
            </div>
          </div>

          <LoadingOverlay
            v-if="battleState.state.phase === 'loading'"
            :message="battleState.state.message"
          />

          <CountdownOverlay
            v-if="battleState.state.phase === 'countdown'"
            :countdown="battleState.state.countdown"
          />

          <ResultOverlay
            v-if="battleState.state.phase === 'result'"
            :result="battleState.state.result"
            @restart="restartBattle"
            @title="goCharacterSelectFromResult"
          />
        </GameStage>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.page {
  width: 100%;
  min-height: 100dvh;
  padding: 24px;
}

.home-screen {
  display: grid;
  place-items: center;
  min-height: calc(100dvh - 48px);
}

.home-card {
  width: min(960px, 100%);
  padding: 40px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: rgba(8, 18, 28, 0.94);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page h1 {
  margin: 0 0 16px;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1.02;
}

.lead {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.description {
  max-width: 720px;
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.home-actions {
  margin-top: 28px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
}

.run-complete-banner {
  margin-top: 20px;
  padding: 18px 20px;
  border: 1px solid rgba(246, 196, 83, 0.24);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(246, 196, 83, 0.12), rgba(255, 143, 112, 0.08)),
    rgba(255, 255, 255, 0.03);
}

.run-complete-banner strong {
  display: block;
  margin-bottom: 6px;
  font-size: 20px;
}

.run-complete-banner p {
  margin: 0;
  color: var(--text);
}

.hint {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.info-panel {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.info-panel h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.info-panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.binding-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.binding-list li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--muted);
}

.stage-page {
  width: 100%;
  max-width: 1880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-enter {
  animation: stage-fade 420ms ease;
}

.stage-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding: 6px 4px 0;
}

.stage-copy h1 {
  margin: 0 0 10px;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.04;
}

.stage-actions {
  display: flex;
  gap: 10px;
}

.practice-panel {
  position: absolute;
  top: 26px;
  right: 26px;
  width: min(360px, calc(100% - 52px));
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(5, 12, 19, 0.88);
  backdrop-filter: blur(12px);
}

.practice-panel strong {
  display: block;
  font-size: 20px;
}

.practice-actions {
  display: flex;
  gap: 10px;
}

.practice-copy {
  margin: 8px 0 0;
  color: var(--muted);
  line-height: 1.6;
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

.travel-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at center, rgba(103, 232, 249, 0.1), transparent 36%),
    rgba(3, 9, 15, 0.78);
  backdrop-filter: blur(10px);
}

.travel-card {
  width: min(460px, calc(100% - 32px));
  padding: 26px 28px;
  border: 1px solid rgba(103, 232, 249, 0.22);
  border-radius: 24px;
  background: rgba(8, 18, 28, 0.94);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
  text-align: center;
}

.travel-card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 28px;
}

.travel-card p:last-child {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
  white-space: pre-line;
}

.flow-fade-enter-active,
.flow-fade-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.flow-fade-enter-from,
.flow-fade-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.travel-fade-enter-active,
.travel-fade-leave-active {
  transition: opacity 220ms ease;
}

.travel-fade-enter-from,
.travel-fade-leave-to {
  opacity: 0;
}

@keyframes stage-fade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .page {
    padding: 16px;
  }

  .home-screen {
    min-height: auto;
  }

  .home-card {
    padding: 24px;
  }

  .home-grid {
    grid-template-columns: 1fr;
  }

  .stage-header {
    flex-direction: column;
    align-items: start;
  }
}
</style>
