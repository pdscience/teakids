<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { useAppStore } from '../stores/app';
import { getInteractiveItems, getAllInteractiveCategories } from '../data/interactive';
import { useI18n } from '../i18n/useI18n';
import type { InteractiveCategory, InteractiveItem } from '../types/models';

let quizTimeoutId: ReturnType<typeof setTimeout> | null = null;

const clearQuizTimeout = () => {
  if (quizTimeoutId !== null) {
    clearTimeout(quizTimeoutId);
    quizTimeoutId = null;
  }
};

const store = useAppStore();
const { t, locale } = useI18n();

const categories = computed(() => getAllInteractiveCategories(locale.value));

const currentCategory = computed(() => store.currentInteractiveTab as InteractiveCategory);
const interactiveItems = computed(() =>
  getInteractiveItems(currentCategory.value, locale.value)
);

const categoryColors: Record<string, string> = {
  shapes: '#4D94FF', colors: '#B24BF3', animals: '#00C853',
  fruits: '#FF1744', foods: '#FF6B35', numbers: '#00BCD4',
  vegetables: '#4CAF50', household: '#795548',
};

const tabColor = computed(() => categoryColors[currentCategory.value] || '#4D94FF');

const setCategory = (category: InteractiveCategory) => {
  store.setCurrentInteractiveTab(category);
};

// Normal mode speak
const speak = (name: string) => {
  store.speakText(name);
};

const parseColor = (hexColor?: string): string => {
  if (!hexColor) return tabColor.value;
  return hexColor;
};

// ---- QUIZ MODE ----
const quizMode = ref(false);
const quizScore = ref(0);
const quizTotal = ref(0);
const quizCurrentItem = ref<InteractiveItem | null>(null);
const quizOptions = ref<InteractiveItem[]>([]);
const quizAnswered = ref<'correct' | 'wrong' | null>(null);
const quizAnsweredIndex = ref<number | null>(null);

const toggleQuizMode = () => {
  quizMode.value = !quizMode.value;
  if (quizMode.value) {
    store.resetQuizStreak();
    quizScore.value = 0;
    quizTotal.value = 0;
    generateQuizQuestion();
  }
};

const resetQuiz = () => {
  quizScore.value = 0;
  quizTotal.value = 0;
  quizAnswered.value = null;
  quizAnsweredIndex.value = null;
  store.resetQuizStreak();
  generateQuizQuestion();
};

watch([currentCategory, locale], () => {
  if (quizMode.value) resetQuiz();
});

const generateQuizQuestion = () => {
  const items = getInteractiveItems(currentCategory.value, locale.value);
  if (items.length < 2) return;
  quizAnswered.value = null;
  quizAnsweredIndex.value = null;

  // Pick the correct answer
  const correctIdx = Math.floor(Math.random() * items.length);
  const correct = items[correctIdx];
  quizCurrentItem.value = correct;

  // Build 4 unique options (correct + 3 distractors)
  const distractors = items
    .filter((_, i) => i !== correctIdx)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(3, items.length - 1));

  const opts = [...distractors, correct].sort(() => Math.random() - 0.5);
  quizOptions.value = opts;

  // Ask TTS
  clearQuizTimeout();
  quizTimeoutId = setTimeout(() => {
    store.speakText(
      t(
        currentCategory.value === 'shapes'
          ? 'interactive.askShapes'
          : 'interactive.askItem'
      )
    );
    quizTimeoutId = null;
  }, 300);
};

const answerQuiz = (option: InteractiveItem, index: number) => {
  if (quizAnswered.value) return;
  quizTotal.value++;
  quizAnsweredIndex.value = index;

  if (option.id === quizCurrentItem.value?.id) {
    quizAnswered.value = 'correct';
    quizScore.value++;
    store.incrementQuizStreak();
    store.speakText(t('interactive.correct', { name: option.name }));
  } else {
    quizAnswered.value = 'wrong';
    store.resetQuizStreak();
    store.speakText(
      t('interactive.wrong', { name: quizCurrentItem.value?.name ?? '' })
    );
  }

  clearQuizTimeout();
  quizTimeoutId = setTimeout(() => {
    generateQuizQuestion();
    quizTimeoutId = null;
  }, 2000);
};

onUnmounted(() => {
  clearQuizTimeout();
});
</script>

<template>
  <div class="interactive-screen">
    <header class="screen-header">
      <div class="header-row">
        <div>
          <h1 class="screen-title">{{ t('interactive.title') }}</h1>
          <p class="screen-subtitle">{{ t('interactive.subtitle') }}</p>
        </div>
        <button
          class="quiz-toggle"
          :class="{ active: quizMode }"
          :aria-pressed="quizMode"
          @click="toggleQuizMode"
        >
          🎯 {{ quizMode ? t('interactive.quizOn') : t('interactive.quiz') }}
        </button>
      </div>
    </header>

    <!-- Category Grid -->
    <div class="category-grid" role="group" :aria-label="t('interactive.quizGroupAria')">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: currentCategory === category.id }"
        :aria-pressed="currentCategory === category.id"
        :aria-label="t('interactive.categoryAria', { name: category.name })"
        :style="{ 
          backgroundColor: currentCategory === category.id ? category.color : '#1E2235',
          borderColor: currentCategory === category.id ? category.color : '#2A2F45'
        }"
        @click="setCategory(category.id)"
      >
        <span class="category-tab-icon" aria-hidden="true">{{ category.icon }}</span>
        <span class="category-tab-name">{{ category.name }}</span>
      </button>
    </div>

    <!-- ===== QUIZ MODE ===== -->
    <main v-if="quizMode" class="quiz-content">
      <!-- Score bar -->
      <div class="quiz-score-bar">
        <div class="quiz-score-stars">
          <span
            v-for="i in 5"
            :key="i"
            class="quiz-star"
            :class="{ filled: i <= quizScore }"
          >⭐</span>
        </div>
        <span class="quiz-score-text">{{ quizScore }} / {{ quizTotal }}</span>
      </div>

      <!-- Question card -->
      <div v-if="quizCurrentItem" class="quiz-question-card">
        <div class="quiz-icon-wrapper" :style="{ borderColor: tabColor + '80' }">
          <span class="quiz-icon">{{ quizCurrentItem.icon }}</span>
        </div>
        <p class="quiz-prompt">{{ t('interactive.question') }}</p>
      </div>

      <!-- Options -->
      <div class="quiz-options">
        <button
          v-for="(option, index) in quizOptions"
          :key="option.id"
          class="quiz-option"
          :class="{
            correct: quizAnswered && option.id === quizCurrentItem?.id,
            wrong: quizAnswered === 'wrong' && quizAnsweredIndex === index && option.id !== quizCurrentItem?.id,
            disabled: !!quizAnswered
          }"
          :aria-label="option.name"
          :aria-disabled="!!quizAnswered"
          @click="answerQuiz(option, index)"
        >
          <span class="option-icon">{{ option.icon }}</span>
          <span class="option-name">{{ option.name }}</span>
          <span v-if="quizAnswered && option.id === quizCurrentItem?.id" class="option-result">✅</span>
          <span v-else-if="quizAnswered === 'wrong' && quizAnsweredIndex === index" class="option-result">❌</span>
        </button>
      </div>

      <button class="quiz-skip" @click="generateQuizQuestion">{{ t('interactive.skip') }}</button>
    </main>

    <!-- ===== NORMAL MODE ===== -->
    <main v-else class="interactive-content">
      <div class="items-grid">
        <button
          v-for="item in interactiveItems"
          :key="item.id"
          class="interactive-card"
          :aria-label="t('common.listenAria', { text: item.name })"
          :style="{ borderColor: parseColor(item.color) + '99' }"
          @click="speak(item.name)"
        >
          <span 
            v-if="currentCategory === 'shapes' && item.id !== 'interactive:shapes:trapezio'"
            class="card-icon"
            :style="{ color: parseColor(item.color) }"
          >{{ item.icon }}</span>
          <svg
            v-else-if="currentCategory === 'shapes' && item.id === 'interactive:shapes:trapezio'"
            class="card-icon card-icon-svg"
            viewBox="0 0 100 80"
            :fill="parseColor(item.color)"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="20,0 80,0 100,80 0,80" />
          </svg>
          <span v-else class="card-icon">{{ item.icon }}</span>
          
          <span class="card-name">{{ item.name }}</span>
          <span v-if="item.type" class="card-type">{{ item.type }}</span>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.interactive-screen {
  min-height: 100vh;
  background-color: #050510;
}

.screen-header {
  padding: 20px 16px 12px;
  background-color: #050510;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.screen-title {
  font-weight: bold;
  font-size: 28px;
  color: white;
  margin-bottom: 4px;
}

.screen-subtitle {
  color: #888;
  font-size: 14px;
}

/* Quiz Toggle Button */
.quiz-toggle {
  padding: 10px 18px;
  border: 2px solid #4D94FF;
  border-radius: 14px;
  background: #1E2235;
  color: #4D94FF;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.quiz-toggle.active {
  background: #4D94FF;
  color: white;
  box-shadow: 0 0 16px #4D94FF66;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 0 16px 16px;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 72px;
  padding: 8px 4px;
  border: 2px solid #2A2F45;
  border-radius: 14px;
  background: #1E2235;
  color: #888;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.category-tab-icon {
  font-size: 24px;
  line-height: 1;
}

.category-tab-name {
  font-size: 12px;
  line-height: 1.15;
  text-align: center;
  overflow-wrap: anywhere;
}

.category-tab.active {
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.category-tab:active {
  transform: scale(0.96);
}

/* ---- QUIZ STYLES ---- */
.quiz-content {
  padding: 0 16px 24px;
}

.quiz-score-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  background: #1E2235;
  border-radius: 16px;
  padding: 12px 16px;
  border: 2px solid rgba(77,148,255,0.2);
}

.quiz-score-stars {
  display: flex;
  gap: 4px;
}

.quiz-star {
  font-size: 24px;
  filter: grayscale(1) opacity(0.3);
  transition: all 0.4s ease;
}

.quiz-star.filled {
  filter: grayscale(0) opacity(1);
  animation: starPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes starPop {
  from { transform: scale(0.5); }
  to   { transform: scale(1); }
}

.quiz-score-text {
  color: #4D94FF;
  font-size: 20px;
  font-weight: bold;
}

.quiz-question-card {
  background: #1E2235;
  border-radius: 24px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  border: 2px solid rgba(77,148,255,0.2);
}

.quiz-icon-wrapper {
  width: 120px;
  height: 120px;
  border: 3px solid;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: rgba(255,255,255,0.04);
}

.quiz-icon {
  font-size: 72px;
}

.quiz-prompt {
  color: #ccc;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1E2235;
  border: 2px solid rgba(77,148,255,0.3);
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.quiz-option:active:not(.disabled) {
  transform: scale(0.97);
}

.quiz-option.correct {
  border-color: #4CAF50;
  background: rgba(76,175,80,0.15);
  animation: correctPop 0.4s ease;
}

.quiz-option.wrong {
  border-color: #FF1744;
  background: rgba(255,23,68,0.15);
  animation: wrongShake 0.4s ease;
}

.quiz-option.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

@keyframes correctPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-6px); }
  75%      { transform: translateX(6px); }
}

.option-icon { font-size: 28px; }
.option-name { flex: 1; }
.option-result { font-size: 20px; margin-left: auto; }

.quiz-skip {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 2px solid #333;
  border-radius: 12px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quiz-skip:hover {
  border-color: #555;
  color: #999;
}

/* ---- NORMAL MODE STYLES ---- */
.interactive-content {
  padding: 16px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 600px) {
  .items-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 900px) {
  .items-grid { grid-template-columns: repeat(4, 1fr); }
}

.interactive-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.6);
  border-radius: 20px;
  padding: 20px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 140px;
}

.interactive-card:active { transform: scale(0.95); }

.card-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.card-icon-svg {
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
}

.card-name {
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.card-type {
  color: #666;
  font-size: 13px;
  margin-top: 4px;
}
</style>
