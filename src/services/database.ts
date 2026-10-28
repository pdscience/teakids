import { Capacitor } from '@capacitor/core';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { getRoutinePeriodLength } from '../data/routines';
import { getLocalDateKey } from '../utils/date';
import { routineStorageKey } from '../utils/routineDay';
import { wasCustomItemActiveOnDate } from '../utils/customRoutine';
import type {
  CustomConversationCard,
  CustomRoutineItem,
  RoutinePeriod,
} from '../types/models';

type StorageRow = { key: string; value: string };
type RoutineRow = { period: string; item_index: number; completed: number };
type AchievementRow = { date: string; key: string; value: number };
type CustomConversationRow = {
  id: string;
  category: string;
  icon: string;
  text: string;
  color: string;
  created_at: string;
};

type CustomRoutineRow = {
  id: string;
  period: string;
  icon: string;
  text: string;
  created_at: string;
  removed_at: string | null;
};

type CustomRoutineProgressRow = {
  date: string;
  item_id: string;
  completed: number;
};

export interface RoutineHistoryEntry {
  date: string;
  period: string;
  completedCount: number;
  totalCount: number;
}

const LEGACY_MIGRATION_KEY = 'teakids_routine_daily_migrated';
const CUSTOM_CONVERSATION_KEY = 'teakids_custom_conversation';
const CUSTOM_ROUTINE_KEY = 'teakids_custom_routine';
const CUSTOM_ROUTINE_PROGRESS_PREFIX = 'custom_routine_progress_';
const PERIODS = ['morning', 'afternoon', 'night'];

let dbInitialized = false;
let initPromise: Promise<boolean> | null = null;
let initError: string | null = null;
let db: SQLiteDBConnection | null = null;

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

async function getDb(): Promise<SQLiteDBConnection | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }
  if (db) {
    return db;
  }
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  const connection = await sqlite.createConnection('teakids', false, 'no-encryption', 1, false);
  await connection.open();
  return connection;
}

export function getDatabaseError(): string | null {
  return initError;
}

export function isDatabaseReady(): boolean {
  return dbInitialized;
}

async function waitForInit(): Promise<void> {
  if (initPromise) {
    await initPromise;
  }
}

function migrateLegacyWebRoutineProgress(today: string): void {
  const store = storage();
  if (!store) return;
  if (store.getItem(LEGACY_MIGRATION_KEY) === '1') return;

  for (const period of PERIODS) {
    const length = getRoutinePeriodLength(period);
    for (let index = 0; index < length; index++) {
      const legacyKey = `routine_${period}_${index}`;
      const legacyValue = store.getItem(legacyKey);
      if (legacyValue !== null) {
        store.setItem(routineStorageKey(today, period, index), legacyValue);
        store.removeItem(legacyKey);
      }
    }
  }

  store.setItem(LEGACY_MIGRATION_KEY, '1');
}

async function migrateNativeRoutineProgress(connection: SQLiteDBConnection): Promise<void> {
  const flag = await connection.query(`SELECT value FROM settings WHERE key = ?`, [
    LEGACY_MIGRATION_KEY,
  ]);
  const rows = flag.values as StorageRow[] | undefined;
  if (rows && rows.length > 0) return;

  const today = getLocalDateKey();

  await connection.run(
    `INSERT OR IGNORE INTO routine_progress_daily (date, period, item_index, completed)
     SELECT ?, period, item_index, completed FROM routine_progress`,
    [today]
  );
  await connection.run(`DELETE FROM routine_progress`);
  await connection.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [
    LEGACY_MIGRATION_KEY,
    '1',
  ]);
}

export async function initDatabase(): Promise<boolean> {
  if (dbInitialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      db = await getDb();

      if (!db) {
        migrateLegacyWebRoutineProgress(getLocalDateKey());
        dbInitialized = true;
        initError = null;
        return true;
      }

      await db.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS routine_progress (
          period TEXT NOT NULL,
          item_index INTEGER NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (period, item_index)
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS routine_progress_daily (
          date TEXT NOT NULL,
          period TEXT NOT NULL,
          item_index INTEGER NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (date, period, item_index)
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS achievements (
          date TEXT NOT NULL,
          key TEXT NOT NULL,
          value INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (date, key)
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS custom_conversation (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          icon TEXT NOT NULL,
          text TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS custom_routine (
          id TEXT PRIMARY KEY,
          period TEXT NOT NULL,
          icon TEXT NOT NULL,
          text TEXT NOT NULL,
          created_at TEXT NOT NULL,
          removed_at TEXT
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS custom_routine_progress_daily (
          date TEXT NOT NULL,
          item_id TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (date, item_id)
        )
      `);

      await migrateNativeRoutineProgress(db);

      dbInitialized = true;
      initError = null;
      return true;
    } catch (error) {
      if (db) {
        try {
          await db.close();
        } catch {
          // Ignore close errors while recovering from a failed init
        }
      }
      db = null;
      initError = error instanceof Error ? error.message : String(error);
      console.error('Falha ao inicializar o banco de dados:', error);
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function dbGetSetting(key: string): Promise<string | null> {
  await waitForInit();
  if (!db) return storage()?.getItem(key) ?? null;
  const res = await db.query(`SELECT value FROM settings WHERE key = ?`, [key]);
  const rows = res.values as StorageRow[] | undefined;
  return rows && rows.length > 0 ? rows[0].value : null;
}

export async function dbSetSetting(key: string, value: string) {
  await waitForInit();
  if (!db) {
    storage()?.setItem(key, value);
    return;
  }
  await db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
}

export async function dbRemoveSetting(key: string) {
  await waitForInit();
  if (!db) {
    storage()?.removeItem(key);
    return;
  }
  await db.run(`DELETE FROM settings WHERE key = ?`, [key]);
}

export async function dbSaveRoutineProgress(
  date: string,
  period: string,
  index: number,
  completed: boolean
) {
  await waitForInit();
  if (!db) {
    storage()?.setItem(routineStorageKey(date, period, index), JSON.stringify(completed));
    return;
  }
  await db.run(
    `INSERT OR REPLACE INTO routine_progress_daily (date, period, item_index, completed) VALUES (?, ?, ?, ?)`,
    [date, period, index, completed ? 1 : 0]
  );
}

export async function dbLoadRoutineProgress(
  date: string,
  period: string,
  index: number
): Promise<boolean> {
  await waitForInit();
  if (!db) {
    try {
      const val = storage()?.getItem(routineStorageKey(date, period, index));
      return val ? JSON.parse(val) : false;
    } catch {
      return false;
    }
  }
  const res = await db.query(
    `SELECT completed FROM routine_progress_daily WHERE date = ? AND period = ? AND item_index = ?`,
    [date, period, index]
  );
  const rows = res.values as { completed: number }[] | undefined;
  return rows && rows.length > 0 ? rows[0].completed === 1 : false;
}

export async function dbLoadAllRoutineProgress(
  date: string,
  period: string
): Promise<boolean[]> {
  await waitForInit();
  if (!db) {
    const length = getRoutinePeriodLength(period);
    const result: boolean[] = [];
    for (let i = 0; i < length; i++) {
      result.push(await dbLoadRoutineProgress(date, period, i));
    }
    return result;
  }
  const res = await db.query(
    `SELECT item_index, completed FROM routine_progress_daily WHERE date = ? AND period = ?`,
    [date, period]
  );
  const rows = (res.values as RoutineRow[]) || [];
  const length = getRoutinePeriodLength(period);
  const result: boolean[] = Array(length).fill(false);
  for (const row of rows) {
    if (row.item_index < length) {
      result[row.item_index] = row.completed === 1;
    }
  }
  return result;
}

export async function dbClearRoutineProgress(date: string, period: string) {
  await waitForInit();
  if (!db) {
    const length = getRoutinePeriodLength(period);
    for (let i = 0; i < length; i++) {
      storage()?.removeItem(routineStorageKey(date, period, i));
    }
    return;
  }
  await db.run(`DELETE FROM routine_progress_daily WHERE date = ? AND period = ?`, [
    date,
    period,
  ]);
}

export async function dbLoadRoutineHistory(days: number): Promise<RoutineHistoryEntry[]> {
  await waitForInit();

  const dates: string[] = [];
  for (let offset = 0; offset < days; offset++) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    dates.push(getLocalDateKey(date));
  }

  const customItems = await dbLoadCustomRoutineItems();
  const completedByDate = new Map<string, number>();
  const customCompletedByDate = new Map<string, number>();

  if (!db) {
    const store = storage();
    for (const date of dates) {
      for (const period of PERIODS) {
        const length = getRoutinePeriodLength(period);
        for (let index = 0; index < length; index++) {
          const raw = store?.getItem(routineStorageKey(date, period, index));
          if (!raw) continue;
          try {
            if (JSON.parse(raw)) {
              const key = `${date}_${period}`;
              completedByDate.set(key, (completedByDate.get(key) || 0) + 1);
            }
          } catch {
            // Ignore corrupted entries
          }
        }
      }

      for (const item of customItems) {
        if (!wasCustomItemActiveOnDate(item, date)) continue;
        const raw = store?.getItem(customRoutineProgressKey(date, item.id));
        if (!raw) continue;
        try {
          if (JSON.parse(raw)) {
            const key = `${date}_${item.period}`;
            customCompletedByDate.set(
              key,
              (customCompletedByDate.get(key) || 0) + 1
            );
          }
        } catch {
          // Ignore corrupted entries
        }
      }
    }
  } else {
    const since = dates[dates.length - 1];
    const res = await db.query(
      `SELECT date, period, SUM(completed) AS completed
       FROM routine_progress_daily
       WHERE date >= ?
       GROUP BY date, period`,
      [since]
    );
    const rows =
      (res.values as { date: string; period: string; completed: number }[]) || [];
    for (const row of rows) {
      completedByDate.set(`${row.date}_${row.period}`, Number(row.completed) || 0);
    }

    if (customItems.length > 0) {
      const customRes = await db.query(
        `SELECT date, item_id, completed
         FROM custom_routine_progress_daily
         WHERE date >= ?`,
        [since]
      );
      const customRows = (customRes.values as CustomRoutineProgressRow[]) || [];
      const itemsById = new Map(customItems.map((item) => [item.id, item]));

      for (const row of customRows) {
        if (row.completed !== 1) continue;
        const item = itemsById.get(row.item_id);
        if (!item || !wasCustomItemActiveOnDate(item, row.date)) continue;
        const key = `${row.date}_${item.period}`;
        customCompletedByDate.set(
          key,
          (customCompletedByDate.get(key) || 0) + 1
        );
      }
    }
  }

  const entries: RoutineHistoryEntry[] = [];
  for (const date of dates) {
    for (const period of PERIODS) {
      const activeCustomCount = customItems.filter(
        (item) =>
          item.period === period && wasCustomItemActiveOnDate(item, date)
      ).length;

      entries.push({
        date,
        period,
        completedCount:
          (completedByDate.get(`${date}_${period}`) || 0) +
          (customCompletedByDate.get(`${date}_${period}`) || 0),
        totalCount: getRoutinePeriodLength(period) + activeCustomCount,
      });
    }
  }
  return entries;
}

export async function dbSaveAchievement(date: string, key: string, value: boolean) {
  await waitForInit();
  if (!db) {
    const store = storage();
    if (!store) return;
    const raw = store.getItem('teakids_daily_achievements');
    let data: Record<string, unknown> = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.date === date) data = parsed.data || {};
      } catch {
        // Ignore corrupted data
      }
    }
    data[key] = value;
    store.setItem('teakids_daily_achievements', JSON.stringify({ date, data }));
    return;
  }
  await db.run(
    `INSERT OR REPLACE INTO achievements (date, key, value) VALUES (?, ?, ?)`,
    [date, key, value ? 1 : 0]
  );
}

export async function dbLoadAchievements(date: string): Promise<Record<string, boolean>> {
  await waitForInit();
  if (!db) {
    try {
      const raw = storage()?.getItem('teakids_daily_achievements');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed?.date !== date) return {};
      const result: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(parsed.data || {})) {
        result[k] = Boolean(v);
      }
      return result;
    } catch {
      return {};
    }
  }
  const res = await db.query(`SELECT key, value FROM achievements WHERE date = ?`, [date]);
  const rows = (res.values as AchievementRow[]) || [];
  const result: Record<string, boolean> = {};
  for (const row of rows) {
    result[row.key] = row.value === 1;
  }
  return result;
}

const CONVERSATION_CATEGORIES = new Set([
  'greetings',
  'needs',
  'health',
  'activities',
  'family',
  'places',
]);

function isCustomConversationCard(value: unknown): value is CustomConversationCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.id === 'string' &&
    typeof card.category === 'string' &&
    CONVERSATION_CATEGORIES.has(card.category) &&
    typeof card.icon === 'string' &&
    typeof card.text === 'string' &&
    typeof card.color === 'string' &&
    typeof card.createdAt === 'string'
  );
}

export async function dbLoadCustomConversation(): Promise<CustomConversationCard[]> {
  await waitForInit();

  if (!db) {
    try {
      const raw = storage()?.getItem(CUSTOM_CONVERSATION_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isCustomConversationCard) : [];
    } catch {
      return [];
    }
  }

  const res = await db.query(
    `SELECT id, category, icon, text, color, created_at
     FROM custom_conversation
     ORDER BY created_at ASC`
  );
  const rows = (res.values as CustomConversationRow[]) || [];
  return rows
    .map((row) => ({
      id: row.id,
      category: row.category,
      icon: row.icon,
      text: row.text,
      color: row.color,
      createdAt: row.created_at,
    }))
    .filter(isCustomConversationCard);
}

export async function dbSaveCustomConversation(card: CustomConversationCard): Promise<void> {
  await waitForInit();

  if (!db) {
    const store = storage();
    if (!store) return;
    const current = await dbLoadCustomConversation();
    const next = [...current.filter((item) => item.id !== card.id), card];
    store.setItem(CUSTOM_CONVERSATION_KEY, JSON.stringify(next));
    return;
  }

  await db.run(
    `INSERT OR REPLACE INTO custom_conversation
     (id, category, icon, text, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [card.id, card.category, card.icon, card.text, card.color, card.createdAt]
  );
}

export async function dbDeleteCustomConversation(id: string): Promise<void> {
  await waitForInit();

  if (!db) {
    const store = storage();
    if (!store) return;
    const current = await dbLoadCustomConversation();
    store.setItem(
      CUSTOM_CONVERSATION_KEY,
      JSON.stringify(current.filter((card) => card.id !== id))
    );
    return;
  }

  await db.run(`DELETE FROM custom_conversation WHERE id = ?`, [id]);
}

export async function dbResetAllData(): Promise<void> {
  await waitForInit();

  if (!db) {
    const store = storage();
    if (!store) return;
    const keys: string[] = [];
    for (let index = 0; index < store.length; index++) {
      const key = store.key(index);
      if (key) keys.push(key);
    }
    for (const key of keys) {
      if (
        key.startsWith('routine_') ||
        key.startsWith('teakids_') ||
        key.startsWith(CUSTOM_ROUTINE_PROGRESS_PREFIX)
      ) {
        store.removeItem(key);
      }
    }
    return;
  }

  await db.run(`DELETE FROM routine_progress_daily`);
  await db.run(`DELETE FROM routine_progress`);
  await db.run(`DELETE FROM achievements`);
  await db.run(`DELETE FROM custom_conversation`);
  await db.run(`DELETE FROM custom_routine_progress_daily`);
  await db.run(`DELETE FROM custom_routine`);
  await db.run(`DELETE FROM settings`);
}

function parseCustomRoutineItem(value: unknown): CustomRoutineItem | null {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string' ||
    (item.period !== 'morning' &&
      item.period !== 'afternoon' &&
      item.period !== 'night') ||
    typeof item.icon !== 'string' ||
    typeof item.text !== 'string' ||
    typeof item.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    period: item.period as RoutinePeriod,
    icon: item.icon,
    text: item.text,
    createdAt: item.createdAt,
    removedAt: typeof item.removedAt === 'string' ? item.removedAt : null,
  };
}

function customRoutineProgressKey(date: string, itemId: string): string {
  return `${CUSTOM_ROUTINE_PROGRESS_PREFIX}${date}_${itemId}`;
}

export async function dbLoadCustomRoutineItems(): Promise<CustomRoutineItem[]> {
  await waitForInit();

  if (!db) {
    try {
      const raw = storage()?.getItem(CUSTOM_ROUTINE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(parseCustomRoutineItem)
        .filter((item): item is CustomRoutineItem => item !== null);
    } catch {
      return [];
    }
  }

  const res = await db.query(
    `SELECT id, period, icon, text, created_at, removed_at
     FROM custom_routine
     ORDER BY created_at ASC, id ASC`
  );
  const rows = (res.values as CustomRoutineRow[]) || [];

  return rows
    .map((row) =>
      parseCustomRoutineItem({
        id: row.id,
        period: row.period,
        icon: row.icon,
        text: row.text,
        createdAt: row.created_at,
        removedAt: row.removed_at,
      })
    )
    .filter((item): item is CustomRoutineItem => item !== null);
}

export async function dbSaveCustomRoutineItem(
  item: CustomRoutineItem
): Promise<void> {
  await waitForInit();

  if (!db) {
    const store = storage();
    if (!store) return;
    const current = await dbLoadCustomRoutineItems();
    const next = [...current.filter((entry) => entry.id !== item.id), item];
    store.setItem(CUSTOM_ROUTINE_KEY, JSON.stringify(next));
    return;
  }

  await db.run(
    `INSERT OR REPLACE INTO custom_routine
     (id, period, icon, text, created_at, removed_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [item.id, item.period, item.icon, item.text, item.createdAt, item.removedAt]
  );
}

export async function dbRemoveCustomRoutineItem(
  id: string,
  removedAt: string
): Promise<void> {
  await waitForInit();

  if (!db) {
    const store = storage();
    if (!store) return;
    const current = await dbLoadCustomRoutineItems();
    const next = current.map((item) =>
      item.id === id ? { ...item, removedAt } : item
    );
    store.setItem(CUSTOM_ROUTINE_KEY, JSON.stringify(next));
    return;
  }

  await db.run(`UPDATE custom_routine SET removed_at = ? WHERE id = ?`, [
    removedAt,
    id,
  ]);
}

export async function dbSaveCustomRoutineProgress(
  date: string,
  itemId: string,
  completed: boolean
): Promise<void> {
  await waitForInit();

  if (!db) {
    storage()?.setItem(
      customRoutineProgressKey(date, itemId),
      JSON.stringify(completed)
    );
    return;
  }

  await db.run(
    `INSERT OR REPLACE INTO custom_routine_progress_daily
     (date, item_id, completed)
     VALUES (?, ?, ?)`,
    [date, itemId, completed ? 1 : 0]
  );
}

export async function dbLoadCustomRoutineProgress(
  date: string,
  itemId: string
): Promise<boolean> {
  await waitForInit();

  if (!db) {
    try {
      const raw = storage()?.getItem(customRoutineProgressKey(date, itemId));
      return raw ? Boolean(JSON.parse(raw)) : false;
    } catch {
      return false;
    }
  }

  const res = await db.query(
    `SELECT completed FROM custom_routine_progress_daily
     WHERE date = ? AND item_id = ?`,
    [date, itemId]
  );
  const rows = res.values as { completed: number }[] | undefined;
  return rows && rows.length > 0 ? rows[0].completed === 1 : false;
}

export async function dbClearCustomRoutineProgressForPeriod(
  date: string,
  period: string
): Promise<void> {
  await waitForInit();

  if (!db) {
    const store = storage();
    if (!store) return;
    const items = await dbLoadCustomRoutineItems();
    for (const item of items) {
      if (item.period === period) {
        store.removeItem(customRoutineProgressKey(date, item.id));
      }
    }
    return;
  }

  await db.run(
    `DELETE FROM custom_routine_progress_daily
     WHERE date = ? AND item_id IN (
       SELECT id FROM custom_routine WHERE period = ?
     )`,
    [date, period]
  );
}
