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
import MotionTestScreen from '~/components/game/MotionTestScreen.vue'
import ResultOverlay from '~/components/game/ResultOverlay.vue'
import { bossData } from '~/game/boss/bossData'
import { characterData } from '~/game/character/characterData'

const battleState = useBattleState()
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
  goTestPage,
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
        <div class="home-backdrop">
          <div class="backdrop-vignette" />
          <div class="backdrop-portal-glow" />
          <div class="backdrop-rock ridge-a" />
          <div class="backdrop-rock ridge-b" />
          <div class="backdrop-rock ridge-c" />
        </div>

        <div class="home-card">
          <div class="home-copy">
            <div class="home-title-wrap">
              <h1 class="home-title" data-text="Random Boss Break">Random Boss Break</h1>
            </div>
          </div>

          <div class="portal-scene" aria-hidden="true">
            <div class="portal-image-layer" />
            <div class="portal-core" />
            <div class="portal-mist mist-a" />
            <div class="portal-mist mist-b" />
            <div class="portal-floor" />
          </div>

          <div class="home-actions">
            <button class="home-enter" @click="goCharacterSelect">진입</button>
            <button class="home-test" @click="goTestPage">모션 테스트</button>
          </div>
        </div>
      </section>

      <MotionTestScreen
        v-else-if="pageView === 'test'"
        key="test"
        :characters="characterData"
        :bosses="bossData"
        @back="goHome"
      />

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
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  min-height: calc(100dvh - 48px);
}

.home-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.backdrop-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 44%, rgba(96, 180, 214, 0.16), transparent 18%),
    radial-gradient(circle at 50% 72%, rgba(31, 60, 87, 0.36), transparent 30%),
    radial-gradient(circle at 50% 0%, rgba(36, 31, 28, 0.42), transparent 36%),
    linear-gradient(180deg, #0a0b10 0%, #11131a 44%, #07080c 100%);
}

.backdrop-portal-glow {
  position: absolute;
  left: 50%;
  top: 52%;
  width: min(60vw, 720px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(127, 212, 239, 0.18) 0%, rgba(69, 122, 168, 0.1) 28%, rgba(4, 11, 18, 0) 68%);
  filter: blur(26px);
  animation: pulse-portal 5.4s ease-in-out infinite;
}

.backdrop-rock {
  position: absolute;
  background: linear-gradient(180deg, rgba(25, 20, 21, 0.92), rgba(7, 8, 12, 0.98));
  box-shadow: inset 0 1px 0 rgba(138, 109, 95, 0.08);
  filter: blur(1px);
}

.ridge-a {
  top: -6%;
  left: -8%;
  width: 42%;
  height: 44%;
  clip-path: polygon(0 0, 100% 0, 72% 100%, 12% 82%);
}

.ridge-b {
  top: -4%;
  right: -10%;
  width: 38%;
  height: 48%;
  clip-path: polygon(14% 0, 100% 0, 100% 82%, 34% 100%);
}

.ridge-c {
  bottom: -12%;
  left: -6%;
  width: 112%;
  height: 26%;
  clip-path: polygon(0 48%, 8% 36%, 18% 42%, 29% 18%, 42% 34%, 54% 10%, 68% 30%, 81% 12%, 100% 42%, 100% 100%, 0 100%);
}

.home-card {
  position: relative;
  z-index: 1;
  width: min(1080px, 100%);
  min-height: min(760px, calc(100dvh - 88px));
  padding: 48px;
  display: grid;
  align-content: space-between;
  gap: 28px;
}

.home-copy {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  text-align: center;
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
  font-size: clamp(42px, 7vw, 88px);
  line-height: 1;
}

.home-title-wrap {
  display: grid;
  justify-items: center;
}

.home-title {
  position: relative;
  margin: 0;
  color: #ff8c7f;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-shadow:
    0 2px 0 #2d0202,
    0 5px 0 #4a0606,
    0 10px 20px rgba(0, 0, 0, 0.45),
    0 0 26px rgba(184, 26, 26, 0.28);
}

.home-title::before,
.home-title::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.home-title::before {
  color: rgba(255, 208, 208, 0.2);
  transform: translate(-2px, -1px);
  clip-path: polygon(0 0, 100% 0, 100% 38%, 0 52%);
}

.home-title::after {
  color: rgba(102, 0, 0, 0.7);
  transform: translate(2px, 2px);
  clip-path: polygon(0 44%, 100% 30%, 100% 100%, 0 100%);
}

.home-actions {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

.portal-scene {
  position: absolute;
  left: 50%;
  top: 53%;
  width: min(54vw, 680px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.portal-image-layer,
.portal-core,
.portal-floor,
.portal-mist {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.portal-image-layer {
  background-image: var(--portal-image, url('/images/title/portal.png'));
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.98;
  filter: drop-shadow(0 0 26px rgba(94, 190, 231, 0.18));
}

.portal-core {
  left: 50%;
  top: 50%;
  width: 36%;
  height: 36%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle, rgba(202, 255, 255, 0.6) 0%, rgba(103, 232, 249, 0.38) 22%, rgba(27, 113, 170, 0.22) 46%, rgba(5, 14, 24, 0) 76%);
  filter: blur(2px);
  animation: pulse-portal 3.8s ease-in-out infinite;
}

.portal-mist {
  background: radial-gradient(circle, rgba(157, 223, 248, 0.14) 0%, rgba(157, 223, 248, 0.04) 48%, rgba(157, 223, 248, 0) 74%);
  filter: blur(16px);
}

.mist-a {
  transform: translate(-6%, 3%) scale(1.02);
  animation: drift-mist 8s ease-in-out infinite;
}

.mist-b {
  transform: translate(5%, -4%) scale(0.94);
  animation: drift-mist 10s ease-in-out infinite reverse;
}

.portal-floor {
  left: 50%;
  bottom: 12%;
  width: 56%;
  height: 12%;
  transform: translateX(-50%);
  background:
    radial-gradient(circle, rgba(104, 187, 228, 0.24) 0%, rgba(104, 187, 228, 0.08) 48%, rgba(104, 187, 228, 0) 78%);
  filter: blur(16px);
}

.home-enter {
  min-width: 0;
  padding: 8px 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #d7c2ac;
  font-family: "Times New Roman", "Georgia", "Nanum Myeongjo", serif;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-shadow:
    0 1px 0 rgba(28, 17, 12, 0.9),
    0 0 18px rgba(126, 96, 68, 0.18);
  transition: color 180ms ease, text-shadow 180ms ease, transform 180ms ease;
}

.home-enter:hover {
  color: #f0dfc9;
  text-shadow:
    0 1px 0 rgba(28, 17, 12, 0.9),
    0 0 24px rgba(173, 133, 86, 0.24);
  transform: translateY(-1px);
}

.home-test {
  min-width: 0;
  padding: 10px 18px;
  border: 1px solid rgba(126, 190, 212, 0.26);
  border-radius: 999px;
  background: rgba(6, 15, 24, 0.68);
  color: #d8edf9;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
  backdrop-filter: blur(8px);
  transition: border-color 180ms ease, transform 180ms ease, background 180ms ease;
}

.home-test:hover {
  border-color: rgba(126, 190, 212, 0.52);
  background: rgba(12, 27, 40, 0.84);
  transform: translateY(-1px);
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

@keyframes pulse-portal {
  0%,
  100% {
    opacity: 0.82;
    transform: translate(-50%, -50%) scale(0.96);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.04);
  }
}

@keyframes drift-mist {
  0%,
  100% {
    opacity: 0.36;
    transform: translate(-6%, 3%) scale(1.02);
  }

  50% {
    opacity: 0.68;
    transform: translate(4%, -2%) scale(1.06);
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
    min-height: calc(100dvh - 32px);
    padding: 28px 22px;
  }

  .page h1 {
    font-size: clamp(34px, 10vw, 56px);
    line-height: 1.06;
  }

  .home-title-wrap {
    width: 100%;
  }

  .portal-scene {
    top: 48%;
    width: min(88vw, 520px);
  }

  .home-actions {
    justify-content: stretch;
  }

  .home-enter {
    width: 100%;
    font-size: 28px;
  }

  .stage-header {
    flex-direction: column;
    align-items: start;
  }
}
</style>
