<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { getCoreVocabulary, type CoreWord } from '../data/coreVocabulary';
import { buildSentence } from '../utils/sentence';
import { useI18n } from '../i18n/useI18n';

const router = useRouter();
const store = useAppStore();
const { t, locale } = useI18n();
const vocabulary = computed(() => getCoreVocabulary(locale.value));

const selected = ref<CoreWord[]>([]);

const sentence = computed(() => buildSentence(selected.value.map((word) => word.label)));
const canSpeak = computed(() => sentence.value.length > 0);

const addWord = (word: CoreWord) => {
  selected.value = [...selected.value, word];
};

const removeWord = (index: number) => {
  selected.value = selected.value.filter((_, itemIndex) => itemIndex !== index);
};

const clearSentence = () => {
  selected.value = [];
};

const speakSentence = () => {
  if (canSpeak.value) {
    void store.speakText(sentence.value);
  }
};

const goBack = () => {
  router.push('/conversation');
};
</script>

<template>
  <div class="builder-screen">
    <header class="screen-header">
      <button class="back-btn" :aria-label="t('builder.backAria')" @click="goBack">←</button>
      <div>
        <h1 class="screen-title">{{ t('builder.title') }}</h1>
        <p class="screen-subtitle">{{ t('builder.subtitle') }}</p>
      </div>
    </header>

    <main class="builder-content">
      <section class="sentence-card" aria-live="polite">
        <p v-if="!selected.length" class="empty-sentence">{{ t('builder.empty') }}</p>
        <div v-else class="selected-words">
          <button
            v-for="(word, index) in selected"
            :key="`${word.id}-${index}`"
            class="selected-word"
            :aria-label="t('builder.removeAria', { word: word.label })"
            @click="removeWord(index)"
          >
            <span class="word-icon">{{ word.icon }}</span>
            <span>{{ word.label }}</span>
            <span class="remove-mark">×</span>
          </button>
        </div>

        <p class="sentence-preview">{{ sentence || '...' }}</p>

        <div class="sentence-actions">
          <button class="action-btn clear" @click="clearSentence" :disabled="!selected.length">
            {{ t('common.clear') }}
          </button>
          <button class="action-btn speak" :disabled="!canSpeak" @click="speakSentence">
            {{ t('builder.speak') }}
          </button>
        </div>
      </section>

      <section class="vocabulary-section">
        <h2 class="section-title">{{ t('builder.words') }}</h2>
        <div class="vocabulary-grid">
          <button
            v-for="word in vocabulary"
            :key="word.id"
            class="word-card"
            :aria-label="t('builder.addAria', { word: word.label })"
            @click="addWord(word)"
          >
            <span class="word-card-icon">{{ word.icon }}</span>
            <span class="word-card-label">{{ word.label }}</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.builder-screen {
  min-height: 100vh;
  background-color: #050510;
}

.screen-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 16px 12px;
}

.back-btn {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border: 2px solid rgba(77, 148, 255, 0.4);
  border-radius: 12px;
  background: #1E2235;
  color: #4D94FF;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
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

.builder-content {
  padding: 0 16px 24px;
}

.sentence-card {
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
}

.empty-sentence {
  color: #888;
  font-size: 14px;
  margin-bottom: 12px;
}

.selected-words {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-word {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 2px solid rgba(77, 148, 255, 0.4);
  border-radius: 12px;
  background: rgba(77, 148, 255, 0.12);
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.word-icon {
  font-size: 18px;
}

.remove-mark {
  color: #888;
  font-size: 16px;
}

.sentence-preview {
  min-height: 28px;
  color: #4D94FF;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 14px;
  word-break: break-word;
}

.sentence-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid transparent;
  border-radius: 14px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}

.action-btn.clear {
  background: transparent;
  border-color: #444;
  color: #aaa;
}

.action-btn.speak {
  background: #07D407;
  color: white;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.section-title {
  color: #ccc;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.vocabulary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (min-width: 600px) {
  .vocabulary-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.word-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 84px;
  padding: 10px 6px;
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.word-card:active {
  transform: scale(0.95);
  border-color: #4D94FF;
}

.word-card-icon {
  font-size: 24px;
}

.word-card-label {
  font-size: 13px;
  font-weight: bold;
  text-align: center;
}
</style>
