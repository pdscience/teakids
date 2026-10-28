<script setup lang="ts">
import { computed, onUnmounted } from 'vue';
import { useAppStore } from '../stores/app';
import { getAlphabetItems } from '../data/alphabet';

const store = useAppStore();
const alphabetItems = getAlphabetItems();

const writerText = computed({
  get: () => store.writerText,
  set: (value: string) => store.setWriterText(value),
});

const colors = [
  '#2196F3', '#9C27B0', '#4CAF50', '#FF9800', '#E91E63', 
  '#009688', '#F44336', '#FFC107', '#3F51B5', '#00BCD4'
];

const getItemColor = (letter: string): string => {
  const colorIndex = letter.charCodeAt(0) % colors.length;
  return colors[colorIndex];
};

const speakText = () => {
  if (writerText.value.trim()) {
    store.speakText(writerText.value);
  }
};

const speakLetter = (letter: string, word: string) => {
  store.speakText(`${letter} de ${word}`);
};

const clearText = () => {
  store.clearWriterText();
};

onUnmounted(() => {
  store.clearWriterText();
});
</script>

<template>
  <div class="writer-screen">
    <header class="screen-header">
      <div class="header-top">
        <h1 class="screen-title">Escrever</h1>
        <button class="clear-btn" @click="clearText" aria-label="Limpar texto">🗑️</button>
      </div>
      <p class="screen-subtitle">Escreva e eu falo:</p>
    </header>

    <main class="writer-content">
      <!-- Text Input Card -->
      <div class="input-card">
        <textarea
          v-model="writerText"
          class="text-input"
          placeholder="Digite algo e eu falo..."
          rows="4"
          maxlength="500"
        ></textarea>
        
        <button 
          class="speak-btn"
          :disabled="!writerText.trim()"
          :class="{ active: writerText.trim() }"
          @click="speakText"
        >
          <span class="btn-icon">🔊</span>
          <span class="btn-text">Falar texto</span>
        </button>
      </div>

      <!-- Tip -->
      <div class="tip-card">
        <span class="tip-icon">💡</span>
        <span class="tip-text">Dica: Use frases curtas para melhor compreensão</span>
      </div>

      <!-- Alphabet Section -->
      <div class="alphabet-section">
        <h2 class="section-title">Alfabeto:</h2>
        
        <div class="alphabet-grid">
          <button
            v-for="item in alphabetItems"
            :key="item.letter"
            class="alphabet-item"
            :aria-label="`Letra ${item.letter}, ${item.word}`"
            :style="{ borderColor: getItemColor(item.letter) + '80' }"
            @click="speakLetter(item.letter, item.word)"
          >
            <span class="letter-icon">{{ item.icon }}</span>
            <span class="letter" :style="{ color: getItemColor(item.letter) }">{{ item.letter }}</span>
            <span class="word" :style="{ color: getItemColor(item.letter) + 'CC' }">{{ item.word }}</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.writer-screen {
  min-height: 100vh;
  background-color: #050510;
}

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
  color: #ccc;
  font-size: 20px;
  font-weight: bold;
}

.writer-content {
  padding: 16px;
}

.input-card {
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
}

.text-input {
  width: 100%;
  background: #0D0F1A;
  border: 2px solid rgba(77, 148, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 18px;
  resize: none;
  outline: none;
  margin-bottom: 16px;
}

.text-input::placeholder {
  color: #666;
}

.text-input:focus {
  border-color: #4D94FF;
}

.speak-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #333;
  color: #888;
  font-size: 18px;
  font-weight: bold;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.speak-btn.active {
  background: #07D407;
  color: white;
  cursor: pointer;
}

.btn-icon {
  font-size: 24px;
}

.tip-card {
  background: rgba(77, 148, 255, 0.1);
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.tip-icon {
  font-size: 28px;
}

.tip-text {
  color: #4D94FF;
  font-weight: 500;
  font-size: 14px;
}

.alphabet-section {
  margin-bottom: 20px;
}

.section-title {
  color: #ccc;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
}

.alphabet-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.alphabet-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(77, 148, 255, 0.1);
  border: 2px solid rgba(77, 148, 255, 0.5);
  border-radius: 20px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alphabet-item:active {
  transform: scale(0.95);
}

.letter-icon {
  font-size: 36px;
  margin-bottom: 4px;
}

.letter {
  font-size: 24px;
  font-weight: bold;
}

.word {
  font-size: 12px;
  font-weight: 500;
}
</style>
