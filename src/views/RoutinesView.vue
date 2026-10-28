<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { useAppStore } from '../stores/app';
import type { AchievementKey } from '../stores/app';
import { getPeriodName } from '../data/routines';

const store = useAppStore();

const periods = [
  { id: 'morning' as const, name: '🌅 Manhã', color: '#FF6B35', achievement: 'morningRoutine' as AchievementKey },
  { id: 'afternoon' as const, name: '☀️ Tarde', color: '#FFC107', achievement: 'afternoonRoutine' as AchievementKey },
  { id: 'night' as const, name: '🌙 Noite', color: '#7B68EE', achievement: 'nightRoutine' as AchievementKey },
];

const confettiItems = [
  { id: 0, color: '#FF6B35', left: 12.5, delay: 0.3, duration: 1.8, size: 14 },
  { id: 1, color: '#FFC107', left: 45.2, delay: 0.1, duration: 2.1, size: 10 },
  { id: 2, color: '#4D94FF', left: 78.9, delay: 0.5, duration: 1.5, size: 16 },
  { id: 3, color: '#4CAF50', left: 23.1, delay: 0.7, duration: 1.9, size: 12 },
  { id: 4, color: '#E91E63', left: 67.4, delay: 0.2, duration: 2.3, size: 8 },
  { id: 5, color: '#B24BF3', left: 34.7, delay: 0.6, duration: 1.6, size: 15 },
  { id: 6, color: '#00BCD4', left: 89.3, delay: 0.4, duration: 2.0, size: 11 },
  { id: 7, color: '#FF6B35', left: 56.8, delay: 0.0, duration: 1.7, size: 13 },
  { id: 8, color: '#FFC107', left: 18.6, delay: 0.8, duration: 2.2, size: 9 },
  { id: 9, color: '#4D94FF', left: 72.1, delay: 0.3, duration: 1.4, size: 17 },
  { id: 10, color: '#4CAF50', left: 41.3, delay: 0.5, duration: 1.8, size: 10 },
  { id: 11, color: '#E91E63', left: 85.7, delay: 0.1, duration: 2.4, size: 12 },
  { id: 12, color: '#B24BF3', left: 29.4, delay: 0.7, duration: 1.5, size: 14 },
  { id: 13, color: '#00BCD4', left: 62.9, delay: 0.2, duration: 1.9, size: 8 },
  { id: 14, color: '#FF6B35', left: 95.1, delay: 0.6, duration: 2.1, size: 16 },
  { id: 15, color: '#FFC107', left: 7.8, delay: 0.4, duration: 1.6, size: 11 },
  { id: 16, color: '#4D94FF', left: 51.5, delay: 0.0, duration: 2.3, size: 13 },
  { id: 17, color: '#4CAF50', left: 83.2, delay: 0.8, duration: 1.7, size: 9 },
  { id: 18, color: '#E91E63', left: 37.6, delay: 0.3, duration: 2.0, size: 15 },
  { id: 19, color: '#B24BF3', left: 69.8, delay: 0.5, duration: 1.4, size: 10 },
  { id: 20, color: '#00BCD4', left: 15.3, delay: 0.1, duration: 2.2, size: 12 },
  { id: 21, color: '#FF6B35', left: 92.7, delay: 0.7, duration: 1.8, size: 17 },
  { id: 22, color: '#FFC107', left: 48.1, delay: 0.2, duration: 1.5, size: 8 },
  { id: 23, color: '#4D94FF', left: 26.9, delay: 0.6, duration: 2.4, size: 14 },
  { id: 24, color: '#4CAF50', left: 76.4, delay: 0.4, duration: 1.6, size: 11 },
  { id: 25, color: '#E91E63', left: 59.2, delay: 0.0, duration: 1.9, size: 13 },
  { id: 26, color: '#B24BF3', left: 4.5, delay: 0.8, duration: 2.1, size: 9 },
  { id: 27, color: '#00BCD4', left: 43.8, delay: 0.3, duration: 1.7, size: 16 },
  { id: 28, color: '#FF6B35', left: 81.6, delay: 0.5, duration: 2.3, size: 10 },
  { id: 29, color: '#FFC107', left: 31.2, delay: 0.1, duration: 1.4, size: 12 },
];

const currentPeriod = computed(() => store.currentRoutineTab);
const routineItems = computed(() =>
  store.getRoutineItemsForPeriod(currentPeriod.value)
);
const progress = computed(() => store.getRoutineProgressData(currentPeriod.value));

const periodColor = computed(() => {
  const period = periods.find(p => p.id === currentPeriod.value);
  return period?.color || '#4D94FF';
});

const todayLabel = computed(() => {
  const [year, month, day] = store.routineDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
});

const setPeriod = (period: 'morning' | 'afternoon' | 'night') => {
  store.setCurrentRoutineTab(period);
};

const speak = (text: string) => {
  store.speakText(text);
};

const clearProgress = () => {
  showClearConfirm.value = true;
};

const confirmClear = () => {
  showClearConfirm.value = false;
  store.clearRoutineProgressData(currentPeriod.value);
  showCelebration.value = false;
};

const cancelClear = () => {
  showClearConfirm.value = false;
};

// --- Celebration logic ---
const showCelebration = ref(false);
const showClearConfirm = ref(false);
let celebrationTimeoutId: ReturnType<typeof setTimeout> | null = null;

watch(
  () => progress.value.isCompleted,
  (isNowCompleted, wasCompleted) => {
    if (isNowCompleted && !wasCompleted) {
      showCelebration.value = true;
      const period = periods.find(p => p.id === currentPeriod.value);
      if (period) store.unlockAchievement(period.achievement);
      store.speakText('Parabéns! Você completou a rotina!');
      if (celebrationTimeoutId !== null) clearTimeout(celebrationTimeoutId);
      celebrationTimeoutId = setTimeout(() => { 
        showCelebration.value = false; 
        celebrationTimeoutId = null;
      }, 4000);
    }
  }
);

onUnmounted(() => {
  if (celebrationTimeoutId !== null) {
    clearTimeout(celebrationTimeoutId);
    celebrationTimeoutId = null;
  }
});

const toggleItem = (index: number) => {
  store.toggleRoutineItem(currentPeriod.value, index);
};
</script>

<template>
  <div class="routines-screen">
    <!-- Celebration Overlay -->
    <Transition name="celebrate">
      <div v-if="showCelebration" class="celebration-overlay">
        <div
          v-for="c in confettiItems"
          :key="c.id"
          class="confetti"
          :style="{
            left: c.left + '%',
            background: c.color,
            width: c.size + 'px',
            height: c.size + 'px',
            animationDelay: c.delay + 's',
            animationDuration: c.duration + 's',
          }"
        ></div>
        <div class="celebration-badge">
          <span class="celebration-emoji">🎉</span>
          <p class="celebration-text">Rotina Completa!</p>
          <p class="celebration-sub">Parabéns! Continue assim! 🌟</p>
        </div>
      </div>
    </Transition>

    <!-- Clear Confirmation Modal -->
    <Transition name="celebrate">
      <div v-if="showClearConfirm" class="modal-overlay" @click.self="cancelClear">
        <div class="modal-card">
          <span class="modal-icon">🗑️</span>
          <p class="modal-title">Limpar Progresso?</p>
          <p class="modal-text">Deseja limpar o progresso de hoje da rotina "{{ getPeriodName(currentPeriod) }}"?</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="cancelClear">Cancelar</button>
            <button class="modal-btn confirm" @click="confirmClear">Limpar</button>
          </div>
        </div>
      </div>
    </Transition>

    <header class="screen-header">
      <div class="header-top">
        <h1 class="screen-title">Rotinas</h1>
        <button class="clear-btn" @click="clearProgress" aria-label="Limpar progresso da rotina">🗑️</button>
      </div>
      <p class="screen-subtitle">Acompanhe suas atividades de hoje</p>
      <p class="today-label">Hoje, {{ todayLabel }}</p>
    </header>

    <!-- Period Tabs -->
    <div class="period-tabs">
      <button
        v-for="period in periods"
        :key="period.id"
        class="period-tab"
        :class="{ active: currentPeriod === period.id }"
        :aria-pressed="currentPeriod === period.id"
        :style="{ 
          backgroundColor: currentPeriod === period.id ? period.color : '#1E2235',
          borderColor: currentPeriod === period.id ? period.color : '#2A2F45'
        }"
        @click="setPeriod(period.id)"
      >
        {{ period.name }}
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-card" :style="{ borderColor: periodColor + '40' }">
        <div class="progress-header">
          <span class="progress-label">Progresso:</span>
          <span class="progress-value" :style="{ color: periodColor }">{{ progress.progressText }}</span>
        </div>
        <div class="progress-bar-bg">
          <div 
            class="progress-bar-fill"
            :style="{ 
              width: `${progress.progress}%`,
              backgroundColor: progress.isCompleted ? '#4CAF50' : periodColor
            }"
          ></div>
        </div>
        <p v-if="progress.isCompleted" class="completed-msg">🌟 Incrível! Tudo feito!</p>
      </div>
    </div>

    <!-- Routine Items -->
    <main class="routine-content">
      <div class="routine-list">
        <div
          v-for="(item, index) in routineItems"
          :key="item.id || index"
          class="routine-item"
          :class="{ completed: progress.completedItems[index] }"
          :style="{ 
            borderColor: progress.completedItems[index] ? '#4CAF50' : periodColor + '80'
          }"
        >
          <button
            class="item-speak"
            :aria-label="`Ouvir: ${item.text}`"
            @click="speak(item.text)"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span 
              class="item-text"
              :class="{ completed: progress.completedItems[index] }"
            >
              {{ item.text }}
            </span>
          </button>
          <button
            class="checkbox"
            :class="{ checked: progress.completedItems[index] }"
            :aria-pressed="progress.completedItems[index]"
            :aria-label="`Marcar ${item.text} como ${progress.completedItems[index] ? 'não concluído' : 'concluído'}`"
            @click="toggleItem(index)"
          >
            <span v-if="progress.completedItems[index]">✓</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.routines-screen {
  min-height: 100vh;
  background-color: #050510;
  position: relative;
}

/* ---- Celebration ---- */
.celebration-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -20px;
  border-radius: 3px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0%   { top: -20px; opacity: 1; transform: rotate(0deg) translateX(0); }
  100% { top: 110vh;  opacity: 0; transform: rotate(720deg) translateX(40px); }
}

.celebration-badge {
  background: linear-gradient(135deg, #1E2235, #2a2f55);
  border: 3px solid #4CAF50;
  border-radius: 24px;
  padding: 32px 48px;
  text-align: center;
  pointer-events: all;
  box-shadow: 0 0 48px #4CAF5066;
  animation: badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes badgePop {
  from { transform: scale(0.3); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.celebration-emoji {
  font-size: 60px;
  display: block;
  margin-bottom: 8px;
  animation: emojiSpin 0.8s ease infinite alternate;
}

@keyframes emojiSpin {
  from { transform: rotate(-15deg) scale(1); }
  to   { transform: rotate(15deg) scale(1.15); }
}

.celebration-text {
  color: #4CAF50;
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px;
}

.celebration-sub {
  color: #ccc;
  font-size: 16px;
  margin: 0;
}

.celebrate-enter-active { transition: opacity 0.3s ease; }
.celebrate-leave-active { transition: opacity 0.5s ease; }
.celebrate-enter-from, .celebrate-leave-to { opacity: 0; }

/* ---- Confirmation Modal ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.modal-title {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 8px;
}

.modal-text {
  color: #aaa;
  font-size: 14px;
  margin: 0 0 20px;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.cancel {
  background: transparent;
  border-color: #444;
  color: #aaa;
}

.modal-btn.confirm {
  background: #F44336;
  border-color: #F44336;
  color: white;
}

.modal-btn:active {
  transform: scale(0.96);
}

/* ---- Header ---- */
.screen-header {
  padding: 20px 16px;
  background-color: #050510;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.screen-title {
  font-weight: bold;
  font-size: 28px;
  color: white;
  margin-bottom: 8px;
}

.clear-btn {
  background: #1E2235;
  border: 2px solid #2A2F45;
  border-radius: 12px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 18px;
}

.screen-subtitle {
  color: #888;
  font-size: 16px;
}

.today-label {
  color: #4D94FF;
  font-size: 14px;
  font-weight: bold;
  margin-top: 6px;
}

/* ---- Tabs ---- */
.period-tabs {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.period-tab {
  flex: 1;
  padding: 14px 12px;
  border: 2px solid #2A2F45;
  border-radius: 16px;
  background: #1E2235;
  color: #888;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-tab.active {
  color: white;
}

/* ---- Progress ---- */
.progress-section {
  padding: 0 16px;
  margin-bottom: 16px;
}

.progress-card {
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 20px;
  padding: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-label {
  color: #ccc;
  font-weight: bold;
  font-size: 16px;
}

.progress-value {
  font-weight: bold;
  font-size: 24px;
}

.progress-bar-bg {
  height: 10px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s ease;
}

.completed-msg {
  color: #4CAF50;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  margin: 10px 0 0;
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ---- Routine Items ---- */
.routine-content {
  padding: 0 16px;
}

.routine-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.routine-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(77, 148, 255, 0.1);
  border: 2px solid rgba(77, 148, 255, 0.5);
  border-radius: 20px;
  padding: 16px;
  transition: all 0.3s ease;
}

.item-speak {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.routine-item.completed {
  background: rgba(76, 175, 80, 0.1);
}

.item-icon {
  font-size: 35px;
  margin-right: 16px;
}

.item-text {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.item-text.completed {
  color: #888;
  text-decoration: line-through;
}

.checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid;
  border-radius: 6px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox:not(.checked) {
  border-color: #4D94FF;
}

.checkbox.checked {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}
</style>
