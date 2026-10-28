import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbGetSetting, dbSetSetting } from '../services/database';
import {
  DEFAULT_SETTINGS,
  parseSettings,
  type AppSettings,
} from '../utils/settings';

const SETTINGS_KEY = 'teakids_settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS });
  const isLoaded = ref(false);

  const apply = () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', settings.value.reduceMotion);
    root.classList.toggle('large-text', settings.value.largeText);
    root.classList.toggle('high-contrast', settings.value.highContrast);
  };

  const load = async () => {
    try {
      settings.value = parseSettings(await dbGetSetting(SETTINGS_KEY));
    } catch {
      settings.value = { ...DEFAULT_SETTINGS };
    }
    apply();
    isLoaded.value = true;
  };

  const update = async (patch: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...patch };
    apply();
    try {
      await dbSetSetting(SETTINGS_KEY, JSON.stringify(settings.value));
    } catch {}
  };

  const reset = async () => {
    settings.value = { ...DEFAULT_SETTINGS };
    apply();
    try {
      await dbSetSetting(SETTINGS_KEY, JSON.stringify(settings.value));
    } catch {}
  };

  return {
    settings,
    isLoaded,
    load,
    update,
    reset,
    apply,
  };
});
