<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { useSettingsStore } from '../stores/settings';
import { useI18n } from '../i18n/useI18n';
import { LOCALE_LABELS, LOCALES, type Locale } from '../i18n/types';
import { getAllConversationCategories } from '../data/conversation';
import { getPeriodName } from '../data/routines';
import {
  dbLoadRoutineHistory,
  dbResetAllData,
  type RoutineHistoryEntry,
} from '../services/database';
import { getLocalDateKey } from '../utils/date';
import type { AppSettings } from '../utils/settings';
import type {
  ConversationCategory,
  CustomConversationCard,
  RoutinePeriod,
} from '../types/models';

const router = useRouter();
const store = useAppStore();
const settings = useSettingsStore();
const { t, locale, formatDate } = useI18n();

const categories = computed(() =>
  getAllConversationCategories(locale.value)
);

const routinePeriods = computed<{ id: RoutinePeriod; name: string }[]>(() => [
  { id: 'morning', name: getPeriodName('morning', locale.value) },
  { id: 'afternoon', name: getPeriodName('afternoon', locale.value) },
  { id: 'night', name: getPeriodName('night', locale.value) },
]);

const languageFeedback = ref('');

const changeLanguage = async (language: Locale) => {
  if (settings.settings.language === language) return;

  await settings.update({ language });
  const exactVoice = await store.prepareVoice();

  languageFeedback.value = exactVoice
    ? t('parent.languageChanged')
    : t('parent.languageUnsupported');
};

const unlocked = ref(false);
const challenge = ref({ a: 0, b: 0 });
const answer = ref('');
const gateError = ref('');

const newChallenge = () => {
  challenge.value = {
    a: Math.floor(Math.random() * 8) + 2,
    b: Math.floor(Math.random() * 8) + 2,
  };
  answer.value = '';
  gateError.value = '';
};

const unlock = () => {
  if (Number(answer.value) === challenge.value.a + challenge.value.b) {
    unlocked.value = true;
    gateError.value = '';
    void loadHistory();
    return;
  }

  gateError.value = t('parent.gateError');
  challenge.value = {
    a: Math.floor(Math.random() * 8) + 2,
    b: Math.floor(Math.random() * 8) + 2,
  };
  answer.value = '';
};

newChallenge();

const goBack = () => {
  router.push('/home');
};

const history = ref<RoutineHistoryEntry[]>([]);
const historyLoading = ref(false);

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    history.value = await dbLoadRoutineHistory(7);
  } finally {
    historyLoading.value = false;
  }
};

const formatDay = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  return formatDate(new Date(year, month - 1, day), {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

const groupedHistory = computed(() => {
  const byDate = new Map<string, RoutineHistoryEntry[]>();
  for (const entry of history.value) {
    const entries = byDate.get(entry.date) || [];
    entries.push(entry);
    byDate.set(entry.date, entries);
  }
  return Array.from(byDate.entries()).map(([date, entries]) => ({
    date,
    label: formatDay(date),
    entries,
  }));
});

const setNumber = (key: 'speechRate' | 'speechPitch', event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (!Number.isFinite(value)) return;
  const patch: Partial<AppSettings> = {};
  patch[key] = value;
  void settings.update(patch);
};

const setToggle = (
  key: 'soundEnabled' | 'reduceMotion' | 'largeText' | 'highContrast',
  event: Event
) => {
  const checked = (event.target as HTMLInputElement).checked;
  if (key === 'soundEnabled' && !checked) {
    void store.stopSpeaking();
  }
  const patch: Partial<AppSettings> = {};
  patch[key] = checked;
  void settings.update(patch);
};

const resetSettings = () => {
  void settings.reset();
};

const testVoice = () => {
  void store.speakText(t('parent.testPhrase'));
};

const newCard = ref<{
  category: ConversationCategory;
  icon: string;
  text: string;
  color: string;
}>({
  category: 'needs',
  icon: '🙂',
  text: '',
  color: '#4D94FF',
});

const cardError = ref('');

const categoryName = (id: ConversationCategory): string =>
  categories.value.find((category) => category.id === id)?.name || id;

const saveCard = async () => {
  const text = newCard.value.text.trim();
  if (!text) {
    cardError.value = t('parent.cardError');
    return;
  }

  const icon =
    Array.from(newCard.value.icon.trim() || '🙂')
      .slice(0, 2)
      .join('') || '🙂';

  const card: CustomConversationCard = {
    id: `custom:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: newCard.value.category,
    icon,
    text: text.slice(0, 60),
    color: newCard.value.color,
    createdAt: new Date().toISOString(),
  };

  await store.addCustomCard(card);
  newCard.value.text = '';
  cardError.value = '';
};

const deleteCard = async (id: string) => {
  if (!window.confirm(t('parent.deleteCardConfirm'))) return;
  await store.removeCustomCard(id);
};

const newRoutineItem = ref<{
  period: RoutinePeriod;
  icon: string;
  text: string;
}>({
  period: 'morning',
  icon: '✅',
  text: '',
});

const routineItemError = ref('');

const activeRoutineItems = computed(() =>
  store.customRoutineItems.filter((item) => !item.removedAt)
);

const routinePeriodName = (period: RoutinePeriod): string =>
  routinePeriods.value.find((entry) => entry.id === period)?.name || period;

const saveRoutineItem = async () => {
  const text = newRoutineItem.value.text.trim();
  if (!text) {
    routineItemError.value = t('parent.itemError');
    return;
  }

  const icon =
    Array.from(newRoutineItem.value.icon.trim() || '✅')
      .slice(0, 2)
      .join('') || '✅';

  await store.addCustomRoutineItem({
    period: newRoutineItem.value.period,
    icon,
    text: text.slice(0, 60),
  });

  newRoutineItem.value.text = '';
  routineItemError.value = '';
  void loadHistory();
};

const deleteRoutineItem = async (id: string) => {
  if (!window.confirm(t('parent.removeItemConfirm'))) {
    return;
  }

  await store.removeCustomRoutineItem(id);
  void loadHistory();
};

const exportFeedback = ref('');

const buildExportJson = (): string =>
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      settings: settings.settings,
      favorites: store.favoriteIds,
      recents: store.recentIds,
      customCards: store.customCards,
      routineHistory: history.value,
    },
    null,
    2
  );

const downloadExport = () => {
  const json = buildExportJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `teakids-backup-${getLocalDateKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  exportFeedback.value = t('parent.backupGenerated');
};

const copyExport = async () => {
  try {
    await navigator.clipboard.writeText(buildExportJson());
    exportFeedback.value = t('parent.backupCopied');
  } catch {
    exportFeedback.value = t('parent.backupCopyError');
  }
};

const resetting = ref(false);

const resetAll = async () => {
  const confirmed = window.confirm(t('parent.resetConfirm'));
  if (!confirmed) return;

  resetting.value = true;
  try {
    await dbResetAllData();
    window.location.reload();
  } finally {
    resetting.value = false;
  }
};

</script>

<template>
  <div class="parent-screen">
    <header class="parent-header">
      <button class="back-btn" :aria-label="t('parent.backAria')" @click="goBack">
        ←
      </button>
      <div>
        <h1 class="parent-title">{{ t('parent.title') }}</h1>
        <p class="parent-subtitle">{{ t('parent.subtitle') }}</p>
      </div>
    </header>

    <main class="parent-content">
      <section v-if="!unlocked" class="gate-card">
        <span class="gate-icon">🔒</span>
        <h2>{{ t('parent.gateTitle') }}</h2>
        <p class="gate-text">{{ t('parent.gateText') }}</p>
        <p class="gate-question">{{ challenge.a }} + {{ challenge.b }} = ?</p>
        <input
          v-model="answer"
          class="gate-input"
          type="number"
          inputmode="numeric"
          :aria-label="t('parent.gateAria')"
          @keyup.enter="unlock"
        />
        <p v-if="gateError" class="gate-error" role="alert">{{ gateError }}</p>
        <button class="primary-btn" @click="unlock">{{ t('parent.enter') }}</button>
        <button class="link-btn" @click="newChallenge">{{ t('parent.newChallenge') }}</button>
      </section>

      <div v-else class="dashboard">
        <section class="panel">
          <h2 class="panel-title">{{ t('parent.languageTitle') }}</h2>
          <p class="panel-hint">{{ t('parent.languageHint') }}</p>
          <div class="row-actions">
            <button
              v-for="option in LOCALES"
              :key="option"
              class="secondary-btn"
              :class="{ 'language-active': settings.settings.language === option }"
              :aria-pressed="settings.settings.language === option"
              @click="changeLanguage(option)"
            >
              {{ LOCALE_LABELS[option] }}
            </button>
          </div>
          <p v-if="languageFeedback" class="feedback">{{ languageFeedback }}</p>
        </section>

        <section class="panel">
          <h2 class="panel-title">{{ t('parent.voiceTitle') }}</h2>

          <label class="range-label" for="speech-rate">
            <span>{{ t('parent.speechRate') }}</span>
            <span class="range-value">{{ settings.settings.speechRate.toFixed(2) }}</span>
          </label>
          <input
            id="speech-rate"
            class="range-input"
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            :value="settings.settings.speechRate"
            @input="setNumber('speechRate', $event)"
          />

          <label class="range-label" for="speech-pitch">
            <span>{{ t('parent.speechPitch') }}</span>
            <span class="range-value">{{ settings.settings.speechPitch.toFixed(2) }}</span>
          </label>
          <input
            id="speech-pitch"
            class="range-input"
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            :value="settings.settings.speechPitch"
            @input="setNumber('speechPitch', $event)"
          />

          <label class="switch-row">
            <span>{{ t('parent.sound') }}</span>
            <input
              type="checkbox"
              :checked="settings.settings.soundEnabled"
              @change="setToggle('soundEnabled', $event)"
            />
          </label>

          <label class="switch-row">
            <span>{{ t('parent.reduceMotion') }}</span>
            <input
              type="checkbox"
              :checked="settings.settings.reduceMotion"
              @change="setToggle('reduceMotion', $event)"
            />
          </label>

          <label class="switch-row">
            <span>{{ t('parent.largeText') }}</span>
            <input
              type="checkbox"
              :checked="settings.settings.largeText"
              @change="setToggle('largeText', $event)"
            />
          </label>

          <label class="switch-row">
            <span>{{ t('parent.highContrast') }}</span>
            <input
              type="checkbox"
              :checked="settings.settings.highContrast"
              @change="setToggle('highContrast', $event)"
            />
          </label>

          <div class="row-actions">
            <button class="secondary-btn" @click="testVoice">{{ t('parent.testVoice') }}</button>
            <button class="secondary-btn" @click="resetSettings">
              {{ t('parent.resetSettings') }}
            </button>
          </div>
        </section>

        <section class="panel">
          <h2 class="panel-title">{{ t('parent.historyTitle') }}</h2>
          <p v-if="historyLoading" class="panel-hint">{{ t('parent.historyLoading') }}</p>
          <div v-else class="history-list">
            <div v-for="day in groupedHistory" :key="day.date" class="history-day">
              <div class="history-date">{{ day.label }}</div>
              <div class="history-periods">
                <div
                  v-for="entry in day.entries"
                  :key="entry.period"
                  class="history-period"
                >
                  <span>{{ getPeriodName(entry.period, locale) }}</span>
                  <span
                    class="history-count"
                    :class="{ complete: entry.completedCount === entry.totalCount }"
                  >
                    {{ entry.completedCount }}/{{ entry.totalCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel">
          <h2 class="panel-title">{{ t('parent.customRoutinesTitle') }}</h2>
          <p class="panel-hint">
            {{ t('parent.customRoutinesHint') }}
          </p>

          <form class="card-form" @submit.prevent="saveRoutineItem">
            <label class="field">
              <span>{{ t('common.period') }}</span>
              <select v-model="newRoutineItem.period">
                <option
                  v-for="period in routinePeriods"
                  :key="period.id"
                  :value="period.id"
                >
                  {{ period.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('common.emoji') }}</span>
              <input
                v-model="newRoutineItem.icon"
                type="text"
                maxlength="4"
                :aria-label="t('parent.itemEmojiAria')"
              />
            </label>

            <label class="field field-wide">
              <span>{{ t('parent.itemName') }}</span>
              <input
                v-model="newRoutineItem.text"
                type="text"
                maxlength="60"
                :placeholder="t('parent.itemPlaceholder')"
              />
            </label>

            <p v-if="routineItemError" class="gate-error" role="alert">
              {{ routineItemError }}
            </p>

            <button class="primary-btn" type="submit">{{ t('parent.addItem') }}</button>
          </form>

          <ul v-if="activeRoutineItems.length" class="custom-list">
            <li
              v-for="item in activeRoutineItems"
              :key="item.id"
              class="custom-item"
            >
              <span class="custom-emoji">{{ item.icon }}</span>
              <span class="custom-text">{{ item.text }}</span>
              <span class="custom-category">
                {{ routinePeriodName(item.period) }}
              </span>
              <button class="delete-btn" @click="deleteRoutineItem(item.id)">
                {{ t('common.remove') }}
              </button>
            </li>
          </ul>
          <p v-else class="panel-hint">{{ t('parent.noCustomItems') }}</p>
        </section>

        <section class="panel">
          <h2 class="panel-title">{{ t('parent.customCardsTitle') }}</h2>
          <p class="panel-hint">
            {{ t('parent.customCardsHint') }}
          </p>

          <form class="card-form" @submit.prevent="saveCard">
            <label class="field">
              <span>{{ t('common.category') }}</span>
              <select v-model="newCard.category">
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('common.emoji') }}</span>
              <input
                v-model="newCard.icon"
                type="text"
                maxlength="4"
                :aria-label="t('parent.cardEmojiAria')"
              />
            </label>

            <label class="field field-wide">
              <span>{{ t('parent.cardText') }}</span>
              <input
                v-model="newCard.text"
                type="text"
                maxlength="60"
                :placeholder="t('parent.cardPlaceholder')"
              />
            </label>

            <label class="field">
              <span>{{ t('common.color') }}</span>
              <input v-model="newCard.color" type="color" />
            </label>

            <p v-if="cardError" class="gate-error" role="alert">{{ cardError }}</p>

            <button class="primary-btn" type="submit">{{ t('parent.addCard') }}</button>
          </form>

          <ul v-if="store.customCards.length" class="custom-list">
            <li v-for="card in store.customCards" :key="card.id" class="custom-item">
              <span class="custom-emoji">{{ card.icon }}</span>
              <span class="custom-text">{{ card.text }}</span>
              <span class="custom-category">{{ categoryName(card.category) }}</span>
              <button class="delete-btn" @click="deleteCard(card.id)">
                {{ t('common.delete') }}
              </button>
            </li>
          </ul>
          <p v-else class="panel-hint">{{ t('parent.noCustomCards') }}</p>
        </section>

        <section class="panel">
          <h2 class="panel-title">{{ t('parent.dataTitle') }}</h2>
          <div class="row-actions">
            <button class="secondary-btn" @click="downloadExport">
              {{ t('parent.downloadBackup') }}
            </button>
            <button class="secondary-btn" @click="copyExport">
              {{ t('parent.copyBackup') }}
            </button>
          </div>
          <p v-if="exportFeedback" class="feedback">{{ exportFeedback }}</p>

          <button class="danger-btn" :disabled="resetting" @click="resetAll">
            {{ resetting ? t('parent.deleting') : t('parent.resetAll') }}
          </button>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.parent-screen {
  min-height: 100vh;
  background-color: #050510;
}

.parent-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 16px 12px;
  max-width: 720px;
  margin: 0 auto;
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

.parent-title {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.parent-subtitle {
  color: #888;
  font-size: 13px;
  margin-top: 2px;
}

.parent-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.gate-card {
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.gate-icon {
  font-size: 44px;
}

.gate-card h2 {
  color: white;
  font-size: 20px;
}

.gate-text {
  color: #aaa;
  font-size: 14px;
}

.gate-question {
  color: #4D94FF;
  font-size: 30px;
  font-weight: bold;
}

.gate-input {
  width: 140px;
  padding: 12px;
  border: 2px solid rgba(77, 148, 255, 0.4);
  border-radius: 12px;
  background: #050510;
  color: white;
  font-size: 22px;
  text-align: center;
}

.gate-error {
  color: #ff6b6b;
  font-size: 13px;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.panel {
  background: #1E2235;
  border: 2px solid rgba(77, 148, 255, 0.2);
  border-radius: 20px;
  padding: 18px;
  min-width: 0;
}

.panel-title {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.panel-hint {
  color: #888;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 8px;
}

.range-label {
  display: flex;
  justify-content: space-between;
  color: #ccc;
  font-size: 14px;
  margin-bottom: 6px;
}

.range-value {
  color: #4D94FF;
  font-weight: bold;
}

.range-input {
  width: 100%;
  margin-bottom: 16px;
  accent-color: #4D94FF;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #ccc;
  font-size: 15px;
}

.switch-row input {
  width: 22px;
  height: 22px;
  accent-color: #07D407;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid transparent;
}

.primary-btn {
  background: #4D94FF;
  color: white;
}

.secondary-btn {
  background: transparent;
  border-color: rgba(77, 148, 255, 0.4);
  color: #4D94FF;
}

.danger-btn {
  width: 100%;
  margin-top: 14px;
  background: transparent;
  border-color: rgba(255, 107, 107, 0.5);
  color: #ff6b6b;
}

.primary-btn:disabled,
.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-day {
  background: #050510;
  border-radius: 12px;
  padding: 10px 12px;
}

.history-date {
  color: #4D94FF;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 6px;
}

.history-periods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.history-period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  color: #aaa;
  font-size: 12px;
}

.history-count {
  color: #888;
  font-weight: bold;
}

.history-count.complete {
  color: #07D407;
}

.card-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: #ccc;
  font-size: 13px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field input,
.field select {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 10px;
  border: 2px solid rgba(77, 148, 255, 0.3);
  border-radius: 10px;
  background: #050510;
  color: white;
  font-size: 14px;
  text-overflow: ellipsis;
}

.field input[type='color'] {
  height: 44px;
  padding: 4px;
}

.card-form .primary-btn {
  grid-column: 1 / -1;
}

.card-form .gate-error {
  grid-column: 1 / -1;
}

.custom-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.custom-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #050510;
  border-radius: 10px;
  padding: 10px 12px;
  color: #eee;
  font-size: 14px;
}

.custom-emoji {
  font-size: 20px;
}

.custom-text {
  flex: 1;
}

.custom-category {
  color: #888;
  font-size: 11px;
}

.delete-btn {
  background: none;
  border: 1px solid rgba(255, 107, 107, 0.4);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 12px;
  padding: 5px 8px;
  cursor: pointer;
}

.feedback {
  color: #07D407;
  font-size: 13px;
  margin-top: 8px;
}

.language-active {
  background: #4D94FF;
  border-color: #4D94FF;
  color: white;
}

@media (max-width: 520px) {
  .parent-content {
    padding: 0 10px 24px;
  }

  .panel {
    padding: 14px;
  }

  .card-form {
    grid-template-columns: minmax(0, 1fr);
  }

  .history-periods {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
