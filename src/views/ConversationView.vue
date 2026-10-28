<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { getAllConversationCategories } from '../data/conversation';
import { getQuickPhrases } from '../data/quickPhrases';
import {
  getCommunicationEntry,
  type CommunicationEntry,
} from '../data/communication';
import { useI18n } from '../i18n/useI18n';

const router = useRouter();
const store = useAppStore();
const { t, locale } = useI18n();

const categories = computed(() =>
  getAllConversationCategories(locale.value)
);

const quickEntries = computed<CommunicationEntry[]>(() =>
  getQuickPhrases(locale.value).map((phrase) => ({
    ...phrase,
    category: 'quick',
  }))
);

const resolveEntries = (ids: string[], limit = 20): CommunicationEntry[] =>
  ids
    .slice(0, limit)
    .map((id) => getCommunicationEntry(id, locale.value))
    .filter((entry): entry is CommunicationEntry => entry !== undefined);

const favoriteEntries = computed(() => resolveEntries(store.favoriteIds));
const recentEntries = computed(() => resolveEntries(store.recentIds, 8));

const speakEntry = (entry: CommunicationEntry) => {
  void store.recordRecent(entry.id);
  void store.speakText(entry.text);
};

const navigateToCategory = (categoryId: string) => {
  router.push(`/conversation/${categoryId}`);
};

const openBuilder = () => {
  router.push('/conversation/builder');
};
</script>

<template>
  <div class="conversation-screen">
    <header class="screen-header">
      <div class="header-top">
        <div>
          <h1 class="screen-title">{{ t('conversation.title') }}</h1>
          <p class="screen-subtitle">{{ t('conversation.subtitle') }}</p>
        </div>
        <button class="builder-btn" @click="openBuilder">{{ t('conversation.builder') }}</button>
      </div>
    </header>

    <main class="conversation-content">
      <section class="quick-section">
        <h2 class="section-title">{{ t('conversation.quick') }}</h2>
        <div class="quick-grid">
          <button
            v-for="entry in quickEntries"
            :key="entry.id"
            class="quick-card"
            :style="{
              borderColor: entry.color + '99',
              backgroundColor: entry.color + '18',
            }"
            :aria-label="t('common.speakAria', { text: entry.text })"
            @click="speakEntry(entry)"
          >
            <span class="quick-icon">{{ entry.icon }}</span>
            <span class="quick-text">{{ entry.text }}</span>
          </button>
        </div>
      </section>

      <section v-if="favoriteEntries.length" class="lists-section">
        <h2 class="section-title">{{ t('conversation.favorites') }}</h2>
        <div class="horizontal-list">
          <button
            v-for="entry in favoriteEntries"
            :key="entry.id"
            class="mini-card"
            :style="{ borderColor: entry.color + '80' }"
            :aria-label="t('common.speakAria', { text: entry.text })"
            @click="speakEntry(entry)"
          >
            <span class="mini-icon">{{ entry.icon }}</span>
            <span class="mini-text">{{ entry.text }}</span>
          </button>
        </div>
      </section>

      <section v-if="recentEntries.length" class="lists-section">
        <h2 class="section-title">{{ t('conversation.recents') }}</h2>
        <div class="horizontal-list">
          <button
            v-for="entry in recentEntries"
            :key="entry.id"
            class="mini-card"
            :style="{ borderColor: entry.color + '80' }"
            :aria-label="t('common.speakAria', { text: entry.text })"
            @click="speakEntry(entry)"
          >
            <span class="mini-icon">{{ entry.icon }}</span>
            <span class="mini-text">{{ entry.text }}</span>
          </button>
        </div>
      </section>

      <section class="categories-section">
        <h2 class="section-title">{{ t('conversation.categories') }}</h2>
        <div class="categories-grid">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            :style="{ borderColor: category.color }"
            @click="navigateToCategory(category.id)"
          >
            <div
              class="category-icon"
              :style="{ backgroundColor: category.color + '20' }"
            >
              <span class="icon-emoji">{{ category.icon }}</span>
            </div>
            <div class="category-text">
              <h3 class="category-name">{{ category.name }}</h3>
            </div>
            <span class="arrow-icon">→</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.conversation-screen {
  min-height: 100vh;
  background-color: #050510;
}

.screen-header {
  padding: 20px 16px 12px;
  background-color: #050510;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.screen-title {
  font-weight: bold;
  font-size: 28px;
  color: white;
  margin-bottom: 8px;
}

.screen-subtitle {
  color: #888;
  font-size: 14px;
}

.builder-btn {
  flex-shrink: 0;
  padding: 10px 14px;
  border: 2px solid #4D94FF;
  border-radius: 14px;
  background: #1E2235;
  color: #4D94FF;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.builder-btn:active {
  transform: scale(0.96);
}

.conversation-content {
  padding: 0 16px 16px;
}

.section-title {
  color: #ccc;
  font-size: 16px;
  font-weight: bold;
  margin: 18px 0 10px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 600px) {
  .quick-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 92px;
  padding: 12px 8px;
  border: 2px solid;
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.quick-card:active {
  transform: scale(0.96);
}

.quick-icon {
  font-size: 26px;
}

.quick-text {
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  line-height: 1.25;
}

.horizontal-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.horizontal-list::-webkit-scrollbar {
  display: none;
}

.mini-card {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  max-width: 220px;
  padding: 10px 14px;
  border: 2px solid;
  border-radius: 14px;
  background: #1E2235;
  color: white;
  cursor: pointer;
}

.mini-card:active {
  transform: scale(0.96);
}

.mini-icon {
  font-size: 22px;
}

.mini-text {
  font-size: 13px;
  font-weight: bold;
  text-align: left;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: center;
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.category-card:hover {
  transform: translateX(8px);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.icon-emoji {
  font-size: 32px;
}

.category-text {
  flex: 1;
}

.category-name {
  color: white;
  font-size: 22px;
  font-weight: bold;
}

.arrow-icon {
  font-size: 20px;
  color: #4D94FF;
}
</style>
