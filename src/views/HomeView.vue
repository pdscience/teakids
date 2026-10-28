<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { useI18n } from '../i18n/useI18n';
import logoUrl from '../assets/TEA Kids.png';

const router = useRouter();
const store = useAppStore();

const { t } = useI18n();

const features = computed(() => [
  { title: t('home.featureConversationTitle'), description: t('home.featureConversationDescription'), icon: '💬', color: '#4D94FF', route: '/conversation' },
  { title: t('home.featureRoutinesTitle'), description: t('home.featureRoutinesDescription'), icon: '📅', color: '#FFB84D', route: '/routines' },
  { title: t('home.featureWriterTitle'), description: t('home.featureWriterDescription'), icon: '✏️', color: '#A78BFA', route: '/writer' },
  { title: t('home.featureInteractiveTitle'), description: t('home.featureInteractiveDescription'), icon: '🎮', color: '#4DFF88', route: '/interactive' },
]);

const navigateTo = (route: string) => {
  router.push(route);
};

const openParentArea = () => {
  router.push('/parent');
};

const achievements = computed(() => [
  { key: 'morningRoutine', label: t('home.achievementMorning'), icon: '🌅', unlocked: store.dailyAchievements.morningRoutine },
  { key: 'afternoonRoutine', label: t('home.achievementAfternoon'), icon: '☀️', unlocked: store.dailyAchievements.afternoonRoutine },
  { key: 'nightRoutine', label: t('home.achievementNight'), icon: '🌙', unlocked: store.dailyAchievements.nightRoutine },
  { key: 'usedConversation', label: t('home.achievementConversation'), icon: '💬', unlocked: store.dailyAchievements.usedConversation },
  { key: 'quizStreak', label: t('home.achievementQuiz'), icon: '🎯', unlocked: store.dailyAchievements.quizStreak },
]);

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length);
</script>

<template>
  <div class="home-screen">
    <header class="app-header">
      <h1 class="welcome-title">{{ t('home.welcome') }}</h1>
      <button
        class="parent-btn"
        :aria-label="t('home.parentAria')"
        @click="openParentArea"
      >⚙️</button>
    </header>

    <main class="home-content">
      <div class="welcome-section">
        <div class="logo-container">
          <img :src="logoUrl" alt="TEA Kids" class="logo-image" />
        </div>
        
        <h2 class="welcome-title"></h2>

        <!-- Daily Stars Card -->
        <div class="stars-card">
          <div class="stars-header">
            <span class="stars-title">{{ t('home.starsTitle') }}</span>
            <span class="stars-count" :class="{ full: unlockedCount === 5 }">
              {{ unlockedCount }}/5
            </span>
          </div>
          <div class="stars-row">
            <div
              v-for="achievement in achievements"
              :key="achievement.key"
              class="star-item"
              :class="{ unlocked: achievement.unlocked }"
              :title="achievement.label"
              :aria-label="t('home.achievementStatus', {
                label: achievement.label,
                status: achievement.unlocked
                  ? t('home.achievementUnlocked')
                  : t('home.achievementPending'),
              })"
            >
              <span class="star-icon">{{ achievement.icon }}</span>
              <span class="star-label">{{ achievement.label }}</span>
              <span class="star-badge" :class="{ lit: achievement.unlocked }">⭐</span>
            </div>
          </div>
          <p v-if="unlockedCount === 5" class="all-stars-msg">{{ t('home.allStars') }}</p>
        </div>

        <div class="description-card">
          <p class="description-text">{{ t('home.description') }}</p>
          
          <div class="divider"></div>
          
          <p class="nav-hint">{{ t('home.navHint') }}</p>

          <div class="features-list">
            <button
              v-for="feature in features"
              :key="feature.route"
              class="feature-item"
              @click="navigateTo(feature.route)"
            >
              <span class="feature-icon">{{ feature.icon }}</span>
              <div class="feature-text">
                <span class="feature-title">{{ feature.title }}</span>
                <span class="feature-description">{{ feature.description }}</span>
              </div>
              <span class="feature-arrow">→</span>
            </button>
          </div>
        </div>

        <p class="footer-message">{{ t('home.footer') }}</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-screen {
  min-height: 100vh;
  background-color: #050510;
}

.app-header {
  background-color: #050510;
  padding: 20px;
  text-align: center;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.parent-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 12px;
  font-size: 19px;
  cursor: pointer;
}

.app-title {
  font-weight: bold;
  font-size: 32px;
  color: #4D94FF;
}

.home-content {
  padding: 20px;
}

.welcome-section {
  max-width: 600px;
  margin: 0 auto;
}

.logo-container {
  width: 100%;
  border: 4px solid #4D94FF;
  border-radius: 24px;
  margin: 0 auto 30px;
  overflow: hidden;
}

.logo-image {
  display: block;
  width: 100%;
  height: auto;
}

.welcome-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 05px;
}

/* ---- Stars Card ---- */
.stars-card {
  background: linear-gradient(135deg, #1a1e35, #22263d);
  border: 2px solid #4D94FF;
  border-radius: 20px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.stars-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.stars-title {
  color: #FFC107;
  font-size: 16px;
  font-weight: bold;
}

.stars-count {
  color: #888;
  font-size: 15px;
  font-weight: bold;
  background: #1E2235;
  padding: 4px 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stars-count.full {
  color: #FFC107;
  background: rgba(255, 193, 7, 0.15);
}

.stars-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.star-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  opacity: 0.35;
  transition: all 0.4s ease;
}

.star-item.unlocked {
  opacity: 1;
  animation: starUnlock 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes starUnlock {
  from { transform: scale(0.5) rotate(-15deg); }
  to   { transform: scale(1) rotate(0deg); }
}

.star-icon { font-size: 24px; }

.star-label {
  color: #888;
  font-size: 9px;
  text-align: center;
  line-height: 1.2;
  max-width: 56px;
}

.star-item.unlocked .star-label { color: #FFC107; }

.star-badge {
  font-size: 18px;
  filter: grayscale(1) opacity(0.3);
  transition: all 0.4s ease;
}

.star-badge.lit {
  filter: grayscale(0) opacity(1);
  text-shadow: 0 0 12px #FFC107;
}

.all-stars-msg {
  color: #FFC107;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin: 12px 0 0;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* ---- Description Card ---- */
.description-card {
  background: #1E2235;
  border-radius: 20px;
  padding: 24px;
  border: 2px solid #4D94FF;
}

.description-text {
  color: #ffffff;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
}

.divider {
  height: 1px;
  background: #444;
  margin: 20px 0;
}

.nav-hint {
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16px;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  background: rgba(77, 148, 255, 0.1);
  border: 1px solid #4D94FF;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.feature-item:hover {
  background: rgba(77, 148, 255, 0.2);
  border-color: rgba(77, 148, 255, 0.4);
  transform: translateX(4px);
}

.feature-icon {
  font-size: 28px;
  margin-right: 16px;
}

.feature-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.feature-title {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.feature-description {
  color: #888;
  font-size: 13px;
}

.feature-arrow {
  color: #4D94FF;
  font-size: 18px;
}

.footer-message {
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-top: 40px;
}
</style>
