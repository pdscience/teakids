import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from '../i18n/useI18n';
import { LOCALE_LABELS } from '../i18n/types';
import type { MessageKey } from '../i18n/messages';
import type {
  ConversationCategory,
  CustomConversationCard,
  CustomRoutineItem,
  InteractiveCategory,
  RoutineItem,
  RoutinePeriod,
  RoutineProgress,
} from '../types/models';
import {
  createRoutineProgressFromStorage,
  getRoutineItems,
} from '../data/routines';
import { setCustomCommunicationEntries } from '../data/communication';
import { useTts } from '../composables/useTts';
import { useStorage } from '../composables/useStorage';
import {
  dbClearCustomRoutineProgressForPeriod,
  dbDeleteCustomConversation,
  dbGetSetting,
  dbLoadAchievements,
  dbLoadCustomConversation,
  dbLoadCustomRoutineItems,
  dbLoadCustomRoutineProgress,
  dbRemoveCustomRoutineItem,
  dbSaveAchievement,
  dbSaveCustomConversation,
  dbSaveCustomRoutineItem,
  dbSaveCustomRoutineProgress,
  dbSetSetting,
  getDatabaseError,
} from '../services/database';
import { getLocalDateKey } from '../utils/date';
import { getRoutineDayState } from '../utils/routineDay';
import {
  getActiveCustomRoutineItems,
  mergeRoutineItems,
} from '../utils/customRoutine';
import { addRecent, toggleFavorite as toggleFavoriteIds } from '../utils/favorites';
import { useSettingsStore } from './settings';

const FAVORITES_KEY = 'teakids_favorites';
const RECENT_KEY = 'teakids_recent';

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

export type AchievementKey = 'morningRoutine' | 'afternoonRoutine' | 'nightRoutine' | 'usedConversation' | 'quizStreak';

const getTodayKey = () => getLocalDateKey();

const VALID_ACHIEVEMENT_KEYS: AchievementKey[] = ['morningRoutine', 'afternoonRoutine', 'nightRoutine', 'usedConversation', 'quizStreak'];

const loadDailyAchievements = async (): Promise<Record<AchievementKey, boolean>> => {
  const empty: Record<AchievementKey, boolean> = {
    morningRoutine: false, afternoonRoutine: false, nightRoutine: false,
    usedConversation: false, quizStreak: false,
  };
  const data = await dbLoadAchievements(getTodayKey());
  for (const key of VALID_ACHIEVEMENT_KEYS) {
    if (typeof data[key] === 'boolean') {
      empty[key] = data[key];
    }
  }
  return empty;
};

const saveDailyAchievements = async (data: Record<AchievementKey, boolean>) => {
  const today = getTodayKey();
  for (const [key, value] of Object.entries(data)) {
    await dbSaveAchievement(today, key, value);
  }
};

export const useAppStore = defineStore('app', () => {
  // TTS
  const { t, locale, speechLocale } = useI18n();
  const { speak: ttsSpeak, stop: ttsStop, initialize: ttsInitialize, isInitialized: isTtsInitialized } = useTts();
  const { loadAllRoutineProgress, saveRoutineProgress, clearRoutineProgress } = useStorage();
  const settingsStore = useSettingsStore();

  // App state
  const isLoading = ref(true);
  const systemWarningKey = ref<MessageKey | ''>('');
  const systemWarning = computed(() =>
    systemWarningKey.value
      ? t(systemWarningKey.value, {
          language: LOCALE_LABELS[locale.value],
        })
      : ''
  );

  // Conversation state
  const currentConversationTab = ref<ConversationCategory>('greetings');

  // Routine state
  const currentRoutineTab = ref<RoutinePeriod>('morning');
  const routineDate = ref(getLocalDateKey());
  const routineProgress = ref<Record<string, RoutineProgress>>({});
  const customRoutineItems = ref<CustomRoutineItem[]>([]);

  // Interactive state
  const currentInteractiveTab = ref<InteractiveCategory>('shapes');

  // Writer state
  const writerText = ref('');

  // Communication preferences
  const favoriteIds = ref<string[]>([]);
  const recentIds = ref<string[]>([]);
  const customCards = ref<CustomConversationCard[]>([]);

  // TTS speaking state
  const isSpeaking = ref(false);
  const speakingText = ref('');

  // Daily achievements
  const dailyAchievements = ref<Record<AchievementKey, boolean>>({
    morningRoutine: false, afternoonRoutine: false, nightRoutine: false,
    usedConversation: false, quizStreak: false,
  });
  const quizCorrectStreak = ref(0);

  const dismissSystemWarning = () => {
    systemWarningKey.value = '';
  };

  const getRoutineItemsForPeriod = (period: string): RoutineItem[] =>
    mergeRoutineItems(
      getRoutineItems(period, settingsStore.settings.language),
      getActiveCustomRoutineItems(
        customRoutineItems.value,
        period as RoutinePeriod
      )
    );

  const createEmptyProgressForPeriod = (period: string): RoutineProgress => {
    const items = getRoutineItemsForPeriod(period);
    return createRoutineProgressFromStorage(
      period,
      new Array<boolean>(items.length).fill(false)
    );
  };

  // Actions
  const initialize = async () => {
    isLoading.value = true;
    routineDate.value = getLocalDateKey();

    const databaseError = getDatabaseError();
    if (databaseError) {
      systemWarningKey.value = 'app.warningDb';
    }

    try {
      await settingsStore.load();
      const exactVoice = await ttsInitialize(settingsStore.settings.language);
      if (!isTtsInitialized.value) {
        systemWarningKey.value = 'app.warningVoice';
      } else if (!exactVoice) {
        systemWarningKey.value = 'app.warningVoiceLanguage';
      }
      dailyAchievements.value = await loadDailyAchievements();
      favoriteIds.value = parseIds(await dbGetSetting(FAVORITES_KEY));
      recentIds.value = parseIds(await dbGetSetting(RECENT_KEY));
      try {
        customRoutineItems.value = await dbLoadCustomRoutineItems();
      } catch {
        customRoutineItems.value = [];
      }
      await loadAllRoutineProgressData();
      try {
        customCards.value = await dbLoadCustomConversation();
      } catch {
        customCards.value = [];
      }
      setCustomCommunicationEntries(customCards.value);
    } catch {
      systemWarningKey.value = 'app.warningLoad';
    } finally {
      isLoading.value = false;
    }
  };

  const loadAllRoutineProgressData = async () => {
    const periods: RoutinePeriod[] = ['morning', 'afternoon', 'night'];

    for (const period of periods) {
      const defaultCompleted = await loadAllRoutineProgress(
        routineDate.value,
        period
      );
      const customItems = getActiveCustomRoutineItems(
        customRoutineItems.value,
        period
      );
      const customCompleted: boolean[] = [];

      for (const item of customItems) {
        customCompleted.push(
          await dbLoadCustomRoutineProgress(routineDate.value, item.id)
        );
      }

      routineProgress.value[period] = createRoutineProgressFromStorage(
        period,
        [...defaultCompleted, ...customCompleted]
      );
    }
  };

  const ensureCurrentDay = async () => {
    const dayState = getRoutineDayState(routineDate.value);
    if (!dayState.isNewDay) return;

    routineDate.value = dayState.dateKey;
    quizCorrectStreak.value = 0;
    dailyAchievements.value = await loadDailyAchievements();
    await loadAllRoutineProgressData();
  };

  // Navigation
  const setCurrentConversationTab = (tab: ConversationCategory) => {
    currentConversationTab.value = tab;
  };

  const setCurrentRoutineTab = (tab: RoutinePeriod) => {
    currentRoutineTab.value = tab;
  };

  const setCurrentInteractiveTab = (tab: InteractiveCategory) => {
    currentInteractiveTab.value = tab;
  };

  // Writer
  const setWriterText = (text: string) => {
    writerText.value = text;
  };

  const clearWriterText = () => {
    writerText.value = '';
  };

  // TTS
  let speechToken = 0;

  const speakText = async (text: string) => {
    if (!isTtsInitialized.value || !settingsStore.settings.soundEnabled) {
      return;
    }

    const token = ++speechToken;
    isSpeaking.value = true;
    speakingText.value = text;
    await ttsSpeak(text, {
      lang: speechLocale.value,
      rate: settingsStore.settings.speechRate,
      pitch: settingsStore.settings.speechPitch,
    });

    if (token === speechToken) {
      isSpeaking.value = false;
      speakingText.value = '';
    }
  };

  const stopSpeaking = async () => {
    speechToken++;
    await ttsStop();
    isSpeaking.value = false;
    speakingText.value = '';
  };

  const prepareVoice = async (): Promise<boolean> => {
    await stopSpeaking();
    const exactVoice = await ttsInitialize(settingsStore.settings.language);

    if (!isTtsInitialized.value) {
      systemWarningKey.value = 'app.warningVoice';
      return false;
    }

    if (!exactVoice) {
      systemWarningKey.value = 'app.warningVoiceLanguage';
      return false;
    }

    systemWarningKey.value = '';
    return true;
  };

  // Communication preferences
  const isFavorite = (id: string): boolean => favoriteIds.value.includes(id);

  const persistIds = async (key: string, ids: string[]) => {
    try {
      await dbSetSetting(key, JSON.stringify(ids));
    } catch {
      // Preferences are not critical; keep the in-memory value
    }
  };

  const toggleFavorite = async (id: string) => {
    favoriteIds.value = toggleFavoriteIds(favoriteIds.value, id);
    await persistIds(FAVORITES_KEY, favoriteIds.value);
  };

  const recordRecent = async (id: string) => {
    recentIds.value = addRecent(recentIds.value, id);
    await persistIds(RECENT_KEY, recentIds.value);
  };

  const refreshCustomCards = async () => {
    customCards.value = await dbLoadCustomConversation();
    setCustomCommunicationEntries(customCards.value);
  };

  const addCustomCard = async (card: CustomConversationCard) => {
    await dbSaveCustomConversation(card);
    await refreshCustomCards();
  };

  const removeCustomCard = async (id: string) => {
    await dbDeleteCustomConversation(id);
    await refreshCustomCards();

    if (favoriteIds.value.includes(id)) {
      favoriteIds.value = favoriteIds.value.filter((entryId) => entryId !== id);
      await persistIds(FAVORITES_KEY, favoriteIds.value);
    }
    if (recentIds.value.includes(id)) {
      recentIds.value = recentIds.value.filter((entryId) => entryId !== id);
      await persistIds(RECENT_KEY, recentIds.value);
    }
  };

  const refreshCustomRoutineItems = async () => {
    customRoutineItems.value = await dbLoadCustomRoutineItems();
  };

  const addCustomRoutineItem = async (input: {
    period: RoutinePeriod;
    icon: string;
    text: string;
  }) => {
    const item: CustomRoutineItem = {
      id: `routine:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      period: input.period,
      icon: input.icon,
      text: input.text,
      createdAt: new Date().toISOString(),
      removedAt: null,
    };

    await dbSaveCustomRoutineItem(item);
    await refreshCustomRoutineItems();
    await loadAllRoutineProgressData();
  };

  const removeCustomRoutineItem = async (id: string) => {
    await dbRemoveCustomRoutineItem(id, new Date().toISOString());
    await refreshCustomRoutineItems();
    await loadAllRoutineProgressData();
  };

  // Achievements
  const unlockAchievement = async (key: AchievementKey) => {
    if (!dailyAchievements.value[key]) {
      dailyAchievements.value[key] = true;
      await saveDailyAchievements(dailyAchievements.value);
    }
  };

  const incrementQuizStreak = () => {
    quizCorrectStreak.value++;
    if (quizCorrectStreak.value >= 3) {
      unlockAchievement('quizStreak');
    }
  };

  const resetQuizStreak = () => {
    quizCorrectStreak.value = 0;
  };

  // Routine
  const toggleRoutineItem = async (period: string, index: number) => {
    const items = getRoutineItemsForPeriod(period);
    const item = items[index];
    if (!item) return;

    const currentProgress =
      routineProgress.value[period] || createEmptyProgressForPeriod(period);
    const updatedItems = [...currentProgress.completedItems];

    while (updatedItems.length < items.length) {
      updatedItems.push(false);
    }

    updatedItems[index] = !updatedItems[index];
    routineProgress.value[period] = createRoutineProgressFromStorage(
      period,
      updatedItems
    );

    if (item.custom && item.id) {
      await dbSaveCustomRoutineProgress(
        routineDate.value,
        item.id,
        updatedItems[index]
      );
      return;
    }

    await saveRoutineProgress(
      routineDate.value,
      period,
      index,
      updatedItems[index]
    );
  };

  const clearRoutineProgressData = async (period: string) => {
    await clearRoutineProgress(routineDate.value, period);
    await dbClearCustomRoutineProgressForPeriod(routineDate.value, period);
    routineProgress.value[period] = createEmptyProgressForPeriod(period);
  };

  // Getters
  const getRoutineProgressData = (period: string): RoutineProgress => {
    return routineProgress.value[period] || createEmptyProgressForPeriod(period);
  };

  return {
    // State
    isLoading,
    systemWarningKey,
    systemWarning,
    currentConversationTab,
    currentRoutineTab,
    routineDate,
    currentInteractiveTab,
    writerText,
    favoriteIds,
    recentIds,
    customCards,
    routineProgress,
    customRoutineItems,
    isTtsInitialized,
    isSpeaking,
    speakingText,
    dailyAchievements,
    quizCorrectStreak,

    // Actions
    initialize,
    ensureCurrentDay,
    dismissSystemWarning,
    setCurrentConversationTab,
    setCurrentRoutineTab,
    setCurrentInteractiveTab,
    setWriterText,
    clearWriterText,
    speakText,
    stopSpeaking,
    prepareVoice,
    isFavorite,
    toggleFavorite,
    recordRecent,
    refreshCustomCards,
    addCustomCard,
    removeCustomCard,
    toggleRoutineItem,
    clearRoutineProgressData,
    addCustomRoutineItem,
    removeCustomRoutineItem,
    unlockAchievement,
    incrementQuizStreak,
    resetQuizStreak,

    // Getters
    getRoutineProgressData,
    getRoutineItemsForPeriod,
  };
});
