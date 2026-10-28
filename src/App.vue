<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useAppStore } from './stores/app';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from './i18n/useI18n';

const store = useAppStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

watchEffect(() => {
  document.title = t('app.documentTitle');
});

const navItems = computed(() => [
  { name: t('nav.home'), icon: '🏠', route: '/home', tab: 'home' },
  { name: t('nav.conversation'), icon: '💬', route: '/conversation', tab: 'conversation' },
  { name: t('nav.routines'), icon: '📅', route: '/routines', tab: 'routines' },
  { name: t('nav.writer'), icon: '✏️', route: '/writer', tab: 'writer' },
  { name: t('nav.interactive'), icon: '🎮', route: '/interactive', tab: 'interactive' },
]);

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let dayCheckInterval: ReturnType<typeof setInterval> | null = null;
const showInstall = ref(false);
const isIOS = ref(false);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  showInstall.value = true;
};

const handleAppInstalled = () => {
  showInstall.value = false;
  deferredPrompt = null;
};

const installApp = async () => {
  if (!deferredPrompt) return;
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === 'accepted') {
    showInstall.value = false;
  }
  deferredPrompt = null;
};

const dismissInstall = () => {
  showInstall.value = false;
};

const checkDayChange = () => {
  store.ensureCurrentDay().catch(() => {
    // A later check will retry
  });
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkDayChange();
  }
};

onMounted(async () => {
  await store.initialize();

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  dayCheckInterval = setInterval(checkDayChange, 60_000);

  const ua = window.navigator.userAgent;
  isIOS.value = /iP(hone|ad|od)/.test(ua) && !('MSStream' in window);
  if (isIOS.value && !window.matchMedia('(display-mode: standalone)').matches) {
    showInstall.value = true;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (dayCheckInterval !== null) {
    clearInterval(dayCheckInterval);
    dayCheckInterval = null;
  }
});

const currentPath = computed(() => route.path);

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="app-container">
    <div v-if="store.isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="loading-logo">
          <span class="logo-icon">🧠</span>
        </div>
        <h1 class="loading-title">{{ t('app.title') }}</h1>
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ t('app.loading') }}</p>
      </div>
    </div>

    <template v-else>
      <transition name="slide-up">
        <div v-if="showInstall" class="install-banner">
          <span class="install-icon">📲</span>
          <div class="install-text">
            <strong>{{ t('app.installTitle') }}</strong>
            <small v-if="!isIOS">{{ t('app.installHint') }}</small>
            <small v-else>{{ t('app.installIosHint') }}</small>
          </div>
          <button v-if="!isIOS" class="install-btn" @click="installApp">{{ t('app.install') }}</button>
          <button class="install-close" @click="dismissInstall" :aria-label="t('app.close')">✕</button>
        </div>
      </transition>

      <div class="main-content">
        <div v-if="store.systemWarning" class="warning-banner" role="status">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">{{ store.systemWarning }}</span>
          <button class="warning-close" @click="store.dismissSystemWarning" :aria-label="t('app.closeWarning')">✕</button>
        </div>

        <router-view v-slot="{ Component }">
          <transition name="slide-up" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <nav class="bottom-nav">
          <button
            v-for="item in navItems"
            :key="item.tab"
            class="nav-item"
            :class="{ active: currentPath.startsWith(item.route) }"
            :aria-current="currentPath.startsWith(item.route) ? 'page' : undefined"
            @click="navigateTo(item.route)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.name }}</span>
          </button>
        </nav>
      </div>
    </template>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #050510;
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4D94FF 0%, #E6F2FF 100%);
}

.loading-content {
  text-align: center;
}

.loading-logo {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.logo-icon {
  font-size: 60px;
}

.loading-title {
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
}

.main-content {
  min-height: calc(100vh - 70px);
  padding-bottom: 70px;
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 184, 77, 0.12);
  border-bottom: 1px solid rgba(255, 184, 77, 0.35);
  color: #FFD08A;
}

.warning-icon {
  font-size: 18px;
}

.warning-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.35;
}

.warning-close {
  background: none;
  border: none;
  color: rgba(255, 208, 138, 0.7);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #1E2235;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #80807c;
  cursor: pointer;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #ffffff;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
}

.slide-up-enter-active {
  transition: all 0.28s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-up-leave-active {
  transition: all 0.2s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.install-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #1E2235;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(77, 148, 255, 0.3);
}

.install-icon {
  font-size: 28px;
}

.install-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  color: #fff;
}

.install-text strong {
  font-size: 15px;
}

.install-text small {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.install-btn {
  background: #4D94FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.install-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
}
</style>
