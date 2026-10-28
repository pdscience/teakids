# Personalização de Rotinas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que os responsáveis adicionem e removam itens extras nas rotinas diárias sem perder o histórico existente.

**Architecture:** Os itens padrão continuam fixos e usam o progresso por índice já existente. Itens extras ficam em tabelas próprias, com ID estável, progresso separado e remoção suave (`removedAt`). A lista efetiva de cada período é montada por `mergeRoutineItems`, e o histórico soma os extras que existiam em cada data.

**Tech Stack:** Vue 3, TypeScript, Pinia, SQLite via `@capacitor-community/sqlite`, localStorage como fallback web, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-27-custom-routines-design.md`

## Global Constraints

- Não criar commits sem pedido explícito do usuário.
- Não alterar, renomear ou reordenar os itens padrão das rotinas.
- Manter o esquema `routine_progress_daily` por índice para os itens padrão.
- Usar data local (`getLocalDateKey`) para decidir se um extra estava ativo em uma data.
- Não adicionar dependências novas.
- Manter o padrão de código existente, sem comentários novos.
- Toda data de criação/remoção de extra é ISO; a comparação histórica é feita pela data local.

---

### Task 1: Tipos e helpers puros de rotina personalizada

**Files:**
- Modify: `src/types/models.ts`
- Create: `src/utils/customRoutine.ts`
- Test: `src/utils/customRoutine.test.ts`

**Interfaces:**
- Consumes: `getLocalDateKey(date?: Date): string` de `src/utils/date.ts`.
- Produces:
  - `RoutinePeriod = 'morning' | 'afternoon' | 'night'`
  - `CustomRoutineItem { id: string; period: RoutinePeriod; icon: string; text: string; createdAt: string; removedAt: string | null }`
  - `RoutineItem` com `id?: string` e `custom?: boolean`
  - `wasCustomItemActiveOnDate(item: CustomRoutineItem, date: string): boolean`
  - `getActiveCustomRoutineItems(items: CustomRoutineItem[], period: RoutinePeriod): CustomRoutineItem[]`
  - `mergeRoutineItems(defaultItems: RoutineItem[], customItems: CustomRoutineItem[]): RoutineItem[]`

- [ ] **Step 1: Adicionar os tipos em `src/types/models.ts`**

Substitua o bloco atual de `RoutineItem` por:

```ts
export type RoutinePeriod = 'morning' | 'afternoon' | 'night';

export interface RoutineItem {
  icon: string;
  text: string;
  period: RoutinePeriod;
  index: number;
  id?: string;
  custom?: boolean;
}

export interface CustomRoutineItem {
  id: string;
  period: RoutinePeriod;
  icon: string;
  text: string;
  createdAt: string;
  removedAt: string | null;
}
```

- [ ] **Step 2: Escrever o teste que falha**

Crie `src/utils/customRoutine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getRoutineItems } from '../data/routines';
import type { CustomRoutineItem } from '../types/models';
import {
  getActiveCustomRoutineItems,
  mergeRoutineItems,
  wasCustomItemActiveOnDate,
} from './customRoutine';

const makeItem = (
  overrides: Partial<CustomRoutineItem> = {}
): CustomRoutineItem => ({
  id: 'routine:1',
  period: 'morning',
  icon: '💊',
  text: 'Tomar remédio',
  createdAt: '2026-10-05T12:00:00.000Z',
  removedAt: null,
  ...overrides,
});

describe('wasCustomItemActiveOnDate', () => {
  it('is active on and after the creation date', () => {
    expect(wasCustomItemActiveOnDate(makeItem(), '2026-10-04')).toBe(false);
    expect(wasCustomItemActiveOnDate(makeItem(), '2026-10-05')).toBe(true);
    expect(wasCustomItemActiveOnDate(makeItem(), '2026-10-06')).toBe(true);
  });

  it('stays active on the removal date and stops afterwards', () => {
    const removed = makeItem({
      removedAt: '2026-10-07T12:00:00.000Z',
    });

    expect(wasCustomItemActiveOnDate(removed, '2026-10-06')).toBe(true);
    expect(wasCustomItemActiveOnDate(removed, '2026-10-07')).toBe(true);
    expect(wasCustomItemActiveOnDate(removed, '2026-10-08')).toBe(false);
  });
});

describe('getActiveCustomRoutineItems', () => {
  it('returns only active items of the requested period', () => {
    const items = [
      makeItem({ id: 'a' }),
      makeItem({ id: 'b', removedAt: '2026-10-07T12:00:00.000Z' }),
      makeItem({ id: 'c', period: 'night' }),
    ];

    const active = getActiveCustomRoutineItems(items, 'morning');

    expect(active.map((item) => item.id)).toEqual(['a']);
  });
});

describe('mergeRoutineItems', () => {
  it('appends custom items after defaults with stable ids', () => {
    const defaults = getRoutineItems('morning');
    const merged = mergeRoutineItems(defaults, [makeItem({ id: 'extra' })]);
    const appended = merged[defaults.length];

    expect(merged).toHaveLength(defaults.length + 1);
    expect(appended).toMatchObject({
      id: 'extra',
      custom: true,
      index: defaults.length,
      text: 'Tomar remédio',
    });
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/utils/customRoutine.test.ts`

Expected: FAIL porque `./customRoutine` ainda não existe.

- [ ] **Step 4: Implementar `src/utils/customRoutine.ts`**

```ts
import { getLocalDateKey } from './date';
import type {
  CustomRoutineItem,
  RoutineItem,
  RoutinePeriod,
} from '../types/models';

export function wasCustomItemActiveOnDate(
  item: CustomRoutineItem,
  date: string
): boolean {
  const createdDate = getLocalDateKey(new Date(item.createdAt));
  if (createdDate > date) return false;
  if (!item.removedAt) return true;

  const removedDate = getLocalDateKey(new Date(item.removedAt));
  return removedDate >= date;
}

export function getActiveCustomRoutineItems(
  items: CustomRoutineItem[],
  period: RoutinePeriod
): CustomRoutineItem[] {
  return items.filter((item) => item.period === period && !item.removedAt);
}

export function mergeRoutineItems(
  defaultItems: RoutineItem[],
  customItems: CustomRoutineItem[]
): RoutineItem[] {
  return [
    ...defaultItems,
    ...customItems.map((item, customIndex) => ({
      icon: item.icon,
      text: item.text,
      period: item.period,
      index: defaultItems.length + customIndex,
      id: item.id,
      custom: true,
    })),
  ];
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/utils/customRoutine.test.ts`

Expected: PASS com 4 testes.

---

### Task 2: Banco de dados dos itens extras

**Files:**
- Modify: `src/services/database.ts`
- Test: `src/services/database.test.ts`

**Interfaces:**
- Consumes: `CustomRoutineItem` e `RoutinePeriod` da Task 1; `getLocalDateKey` existente.
- Produces:
  - `dbLoadCustomRoutineItems(): Promise<CustomRoutineItem[]>`
  - `dbSaveCustomRoutineItem(item: CustomRoutineItem): Promise<void>`
  - `dbRemoveCustomRoutineItem(id: string, removedAt: string): Promise<void>`
  - `dbSaveCustomRoutineProgress(date: string, itemId: string, completed: boolean): Promise<void>`
  - `dbLoadCustomRoutineProgress(date: string, itemId: string): Promise<boolean>`
  - `dbClearCustomRoutineProgressForPeriod(date: string, period: string): Promise<void>`

- [ ] **Step 1: Escrever os testes que falham**

Em `src/services/database.test.ts`, adicione aos imports existentes:

```ts
  dbClearCustomRoutineProgressForPeriod,
  dbLoadCustomRoutineItems,
  dbLoadCustomRoutineProgress,
  dbRemoveCustomRoutineItem,
  dbSaveCustomRoutineItem,
  dbSaveCustomRoutineProgress,
```

Atualize o import de tipos:

```ts
import type {
  CustomConversationCard,
  CustomRoutineItem,
} from '../types/models';
```

Adicione ao final do arquivo:

```ts
describe('custom routine storage', () => {
  const item: CustomRoutineItem = {
    id: 'routine:1',
    period: 'morning',
    icon: '💊',
    text: 'Tomar remédio',
    createdAt: '2026-10-05T12:00:00.000Z',
    removedAt: null,
  };

  it('saves, lists and soft deletes custom routine items', async () => {
    await dbSaveCustomRoutineItem(item);

    expect(await dbLoadCustomRoutineItems()).toEqual([item]);

    await dbRemoveCustomRoutineItem(item.id, '2026-10-06T12:00:00.000Z');

    expect(await dbLoadCustomRoutineItems()).toEqual([
      { ...item, removedAt: '2026-10-06T12:00:00.000Z' },
    ]);
  });

  it('saves, loads and clears custom progress by period', async () => {
    await dbSaveCustomRoutineItem(item);
    await dbSaveCustomRoutineProgress('2026-10-05', item.id, true);

    expect(await dbLoadCustomRoutineProgress('2026-10-05', item.id)).toBe(true);

    await dbClearCustomRoutineProgressForPeriod('2026-10-05', 'morning');

    expect(await dbLoadCustomRoutineProgress('2026-10-05', item.id)).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run src/services/database.test.ts`

Expected: FAIL com erros de importação das funções novas.

- [ ] **Step 3: Adicionar tipos, chaves e criação das tabelas**

No topo de `src/services/database.ts`, atualize o import de tipos:

```ts
import type {
  CustomConversationCard,
  CustomRoutineItem,
  RoutinePeriod,
} from '../types/models';
```

Adicione os tipos de linha após `CustomConversationRow`:

```ts
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
```

Adicione as constantes após `CUSTOM_CONVERSATION_KEY`:

```ts
const CUSTOM_ROUTINE_KEY = 'teakids_custom_routine';
const CUSTOM_ROUTINE_PROGRESS_PREFIX = 'custom_routine_progress_';
```

Dentro de `initDatabase`, após a criação da tabela `custom_conversation`, adicione:

```ts
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
```

- [ ] **Step 4: Implementar o parser e as funções de armazenamento**

Adicione ao final de `src/services/database.ts`:

```ts
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
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npx vitest run src/services/database.test.ts`

Expected: PASS com todos os testes de rotina, conversa e custom routine.

---

### Task 3: Histórico e reset com itens extras

**Files:**
- Modify: `src/services/database.ts`
- Test: `src/services/database.test.ts`

**Interfaces:**
- Consumes: `dbLoadCustomRoutineItems` e `dbLoadCustomRoutineProgress` da Task 2; `wasCustomItemActiveOnDate` da Task 1; `RoutineHistoryEntry` existente.
- Produces: `dbLoadRoutineHistory(days)` com extras somados; `dbResetAllData()` apagando extras.

- [ ] **Step 1: Adicionar os testes de histórico**

No topo de `src/services/database.ts`, importe o helper:

```ts
import { wasCustomItemActiveOnDate } from '../utils/customRoutine';
```

Em `src/services/database.test.ts`, adicione ao final:

```ts
describe('custom routine history', () => {
  it('adds active custom items to the day history', async () => {
    const today = getLocalDateKey();
    const item: CustomRoutineItem = {
      id: 'routine:history',
      period: 'morning',
      icon: '💊',
      text: 'Tomar remédio',
      createdAt: new Date().toISOString(),
      removedAt: null,
    };

    await dbSaveCustomRoutineItem(item);
    await dbSaveCustomRoutineProgress(today, item.id, true);

    const history = await dbLoadRoutineHistory(1);
    const morning = history.find(
      (entry) => entry.date === today && entry.period === 'morning'
    );

    expect(morning).toMatchObject({ completedCount: 1, totalCount: 9 });
  });

  it('does not add items created after the history date', async () => {
    const today = getLocalDateKey();

    await dbSaveCustomRoutineItem({
      id: 'routine:future',
      period: 'morning',
      icon: '💊',
      text: 'Tomar remédio',
      createdAt: new Date().toISOString(),
      removedAt: null,
    });

    const history = await dbLoadRoutineHistory(2);
    const yesterday = history.find(
      (entry) => entry.period === 'morning' && entry.date !== today
    );

    expect(yesterday?.totalCount).toBe(8);
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run src/services/database.test.ts`

Expected: FAIL porque o histórico ainda não soma os extras.

- [ ] **Step 3: Estender `dbLoadRoutineHistory`**

No início da função, após a criação do array `dates`, adicione:

```ts
  const customItems = await dbLoadCustomRoutineItems();
  const customCompletedByDate = new Map<string, number>();
```

No ramo web (`if (!db)`), após o loop de progresso padrão, adicione o loop dos extras:

```ts
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
        } catch {}
      }
```

No ramo nativo (`else`), após o loop que preenche `completedByDate`, adicione:

```ts
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
```

Substitua a montagem final de `entries` por:

```ts
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
```

- [ ] **Step 4: Atualizar `dbResetAllData` e o teste de reset**

Dentro de `dbResetAllData`, no ramo web, adicione a condição de prefixo:

```ts
      if (
        key.startsWith('routine_') ||
        key.startsWith('teakids_') ||
        key.startsWith(CUSTOM_ROUTINE_PROGRESS_PREFIX)
      ) {
        store.removeItem(key);
      }
```

No ramo nativo, adicione antes de `DELETE FROM settings`:

```ts
  await db.run(`DELETE FROM custom_routine_progress_daily`);
  await db.run(`DELETE FROM custom_routine`);
```

No teste "resets progress, settings and custom cards", adicione antes do reset:

```ts
    const routineItem: CustomRoutineItem = {
      id: 'routine:reset',
      period: 'morning',
      icon: '💊',
      text: 'Tomar remédio',
      createdAt: '2026-01-05T12:00:00.000Z',
      removedAt: null,
    };
    await dbSaveCustomRoutineItem(routineItem);
    await dbSaveCustomRoutineProgress(today, routineItem.id, true);
```

E adicione as asserções após o reset:

```ts
    expect(await dbLoadCustomRoutineItems()).toEqual([]);
    expect(
      await dbLoadCustomRoutineProgress(today, routineItem.id)
    ).toBe(false);
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npx vitest run src/services/database.test.ts`

Expected: PASS com histórico incluindo extras e reset limpando tudo.

---

### Task 4: Integração na store

**Files:**
- Modify: `src/stores/app.ts`

**Interfaces:**
- Consumes: funções de banco da Task 2/3; `mergeRoutineItems`, `getActiveCustomRoutineItems` da Task 1; `getRoutineItems` de `src/data/routines.ts`.
- Produces:
  - `customRoutineItems: Ref<CustomRoutineItem[]>`
  - `getRoutineItemsForPeriod(period: string): RoutineItem[]`
  - `addCustomRoutineItem(input: { period: RoutinePeriod; icon: string; text: string }): Promise<void>`
  - `removeCustomRoutineItem(id: string): Promise<void>`

- [ ] **Step 1: Atualizar imports e estado**

Substitua os imports de tipos e de rotinas no topo de `src/stores/app.ts`:

```ts
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
```

Adicione aos imports de banco:

```ts
  dbClearCustomRoutineProgressForPeriod,
  dbLoadCustomRoutineItems,
  dbLoadCustomRoutineProgress,
  dbRemoveCustomRoutineItem,
  dbSaveCustomRoutineItem,
  dbSaveCustomRoutineProgress,
```

Adicione o import do helper:

```ts
import {
  getActiveCustomRoutineItems,
  mergeRoutineItems,
} from '../utils/customRoutine';
```

Adicione o estado após `routineProgress`:

```ts
  const customRoutineItems = ref<CustomRoutineItem[]>([]);
```

- [ ] **Step 2: Adicionar os helpers de montagem**

Antes de `initialize`, adicione:

```ts
  const getRoutineItemsForPeriod = (period: string): RoutineItem[] =>
    mergeRoutineItems(
      getRoutineItems(period),
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
```

- [ ] **Step 3: Carregar extras na inicialização**

Dentro de `initialize`, antes de `await loadAllRoutineProgressData();`, adicione:

```ts
      try {
        customRoutineItems.value = await dbLoadCustomRoutineItems();
      } catch {
        customRoutineItems.value = [];
      }
```

- [ ] **Step 4: Reescrever a carga do progresso**

Substitua `loadAllRoutineProgressData` inteira por:

```ts
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
```

- [ ] **Step 5: Atualizar toggle, limpeza e fallback**

Substitua `toggleRoutineItem` por:

```ts
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
```

Substitua `clearRoutineProgressData` por:

```ts
  const clearRoutineProgressData = async (period: string) => {
    await clearRoutineProgress(routineDate.value, period);
    await dbClearCustomRoutineProgressForPeriod(routineDate.value, period);
    routineProgress.value[period] = createEmptyProgressForPeriod(period);
  };
```

Substitua o fallback de `getRoutineProgressData` por:

```ts
  const getRoutineProgressData = (period: string): RoutineProgress => {
    return routineProgress.value[period] || createEmptyProgressForPeriod(period);
  };
```

- [ ] **Step 6: Adicionar as ações de extras**

Antes do bloco `// Achievements`, adicione:

```ts
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
```

- [ ] **Step 7: Expor estado e ações**

No retorno da store, adicione:

```ts
    customRoutineItems,
    getRoutineItemsForPeriod,
    addCustomRoutineItem,
    removeCustomRoutineItem,
```

- [ ] **Step 8: Rodar o typecheck**

Run: `npm run typecheck`

Expected: PASS sem erros.

---

### Task 5: Exibir extras na tela de rotinas

**Files:**
- Modify: `src/views/RoutinesView.vue`

**Interfaces:**
- Consumes: `store.getRoutineItemsForPeriod(period)` da Task 4.
- Produces: lista de rotina com extras após os padrões.

- [ ] **Step 1: Trocar a fonte da lista**

No topo de `src/views/RoutinesView.vue`, remova `getRoutineItems` do import:

```ts
import { getPeriodName } from '../data/routines';
```

Substitua:

```ts
const routineItems = computed(() => getRoutineItems(currentPeriod.value));
```

por:

```ts
const routineItems = computed(() =>
  store.getRoutineItemsForPeriod(currentPeriod.value)
);
```

- [ ] **Step 2: Usar chave estável para extras**

No template, troque:

```html
          v-for="(item, index) in routineItems"
          :key="index"
```

por:

```html
          v-for="(item, index) in routineItems"
          :key="item.id || index"
```

- [ ] **Step 3: Verificar o typecheck**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 6: Painel de rotinas personalizadas na área dos responsáveis

**Files:**
- Modify: `src/views/ParentView.vue`

**Interfaces:**
- Consumes: `store.customRoutineItems`, `store.addCustomRoutineItem`, `store.removeCustomRoutineItem` da Task 4.
- Produces: formulário e lista de extras em `/parent`.

- [ ] **Step 1: Adicionar o tipo e os dados de período**

No import de tipos de `src/views/ParentView.vue`, adicione `RoutinePeriod`:

```ts
import type {
  ConversationCategory,
  CustomConversationCard,
  RoutinePeriod,
} from '../types/models';
```

Após `const categories = getAllConversationCategories();`, adicione:

```ts
const routinePeriods: { id: RoutinePeriod; name: string }[] = [
  { id: 'morning', name: 'Manhã' },
  { id: 'afternoon', name: 'Tarde' },
  { id: 'night', name: 'Noite' },
];
```

- [ ] **Step 2: Adicionar estado e ações de rotina**

Antes de `const exportFeedback = ref('');`, adicione:

```ts
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
  routinePeriods.find((entry) => entry.id === period)?.name || period;

const saveRoutineItem = async () => {
  const text = newRoutineItem.value.text.trim();
  if (!text) {
    routineItemError.value = 'Digite o nome do item.';
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
  if (
    !window.confirm(
      'Remover este item da rotina? O histórico anterior será mantido.'
    )
  ) {
    return;
  }

  await store.removeCustomRoutineItem(id);
  void loadHistory();
};
```

- [ ] **Step 3: Adicionar o painel no template**

Insira entre o painel de histórico e o painel de cartões personalizados:

```html
        <section class="panel">
          <h2 class="panel-title">📅 Rotinas personalizadas</h2>
          <p class="panel-hint">
            Adicione atividades extras. Os itens padrão continuam iguais.
          </p>

          <form class="card-form" @submit.prevent="saveRoutineItem">
            <label class="field">
              <span>Período</span>
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
              <span>Emoji</span>
              <input
                v-model="newRoutineItem.icon"
                type="text"
                maxlength="4"
                aria-label="Emoji do item da rotina"
              />
            </label>

            <label class="field field-wide">
              <span>Nome do item</span>
              <input
                v-model="newRoutineItem.text"
                type="text"
                maxlength="60"
                placeholder="Ex.: Tomar remédio"
              />
            </label>

            <p v-if="routineItemError" class="gate-error" role="alert">
              {{ routineItemError }}
            </p>

            <button class="primary-btn" type="submit">Adicionar item</button>
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
                Remover
              </button>
            </li>
          </ul>
          <p v-else class="panel-hint">Nenhum item personalizado ainda.</p>
        </section>
```

- [ ] **Step 4: Verificar o typecheck**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 7: Verificação completa

**Files:**
- Verify: todos os arquivos modificados.

- [ ] **Step 1: Rodar toda a suíte de testes**

Run: `npm test`

Expected: PASS com todos os arquivos de teste.

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Rodar o build**

Run: `npm run build`

Expected: build concluído sem erros.

- [ ] **Step 4: Revisar manualmente o fluxo**

1. Abrir `/parent`, resolver a conta.
2. Em "Rotinas personalizadas", adicionar um item no período Manhã.
3. Abrir `/routines`, confirmar que o item aparece depois dos padrões.
4. Marcar o item e conferir o progresso.
5. Voltar a `/parent` e conferir o histórico do dia.
6. Remover o item e confirmar que ele some da rotina, mas o histórico do dia continua contando.
7. Limpar o progresso da manhã e confirmar que o extra também é desmarcado.

---

## Self-Review

- Cobertura do spec: tipos, persistência, regra de data, histórico, store, as duas telas e reset estão cobertos pelas Tasks 1–7.
- Sem placeholders: todas as etapas têm código ou comandos concretos.
- Consistência de tipos: `CustomRoutineItem`, `RoutinePeriod`, `getRoutineItemsForPeriod`, `dbClearCustomRoutineProgressForPeriod` e `mergeRoutineItems` são usados com os mesmos nomes em todas as tarefas.
- Commits não fazem parte do plano porque o usuário não pediu commits.
