# Personalização de Rotinas — Desenho

## Contexto

O TEA Kids já possui rotinas fixas por período (manhã, tarde e noite) e progresso diário por índice. Os responsáveis precisam acrescentar atividades específicas da criança, como "Tomar remédio" ou "Terapia", sem perder o histórico já registrado.

A decisão aprovada é manter os itens padrão fixos e permitir adicionar/remover apenas itens extras.

## Objetivo

Permitir que os responsáveis adicionem e removam itens extras nas rotinas diárias. Cada extra deve:

- aparecer depois dos itens padrão do período;
- ter progresso próprio e estável;
- poder ser removido sem apagar o histórico de dias anteriores;
- ser somado corretamente ao histórico.

## Fora do escopo

- Editar, renomear ou reordenar itens padrão.
- Criar rotinas vazias ou substituir as rotinas prontas.
- Editar um extra já criado. Para mudar, o responsável remove e cria outro.
- Múltiplos perfis de crianças.
- Sincronização entre dispositivos.

## Modelo de dados

```ts
export type RoutinePeriod = 'morning' | 'afternoon' | 'night';

export interface CustomRoutineItem {
  id: string;
  period: RoutinePeriod;
  icon: string;
  text: string;
  createdAt: string;
  removedAt: string | null;
}
```

- `id` é único e estável, no formato `routine:<timestamp>-<aleatório>`.
- `createdAt` e `removedAt` são datas ISO.
- `removedAt` nulo significa item ativo.
- Remover um item preenche `removedAt`; a definição não é apagada.
- `RoutineItem` passa a ter `id?: string` e `custom?: boolean` para identificar extras na lista efetiva.

## Persistência

### SQLite

```sql
CREATE TABLE IF NOT EXISTS custom_routine (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL,
  icon TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  removed_at TEXT
);

CREATE TABLE IF NOT EXISTS custom_routine_progress_daily (
  date TEXT NOT NULL,
  item_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, item_id)
);
```

O progresso dos itens padrão continua em `routine_progress_daily`, por índice. Nenhuma migração é necessária.

### Web

- `teakids_custom_routine`: JSON com a lista de `CustomRoutineItem`.
- `custom_routine_progress_<data>_<id>`: JSON booleano do progresso de um extra.
- O reset remove as duas famílias de chaves.

## Regra de atividade por data

Um extra conta para uma data se já existia e ainda não havia sido removido naquela data:

```ts
function wasCustomItemActiveOnDate(item: CustomRoutineItem, date: string): boolean {
  const createdDate = getLocalDateKey(new Date(item.createdAt));
  if (createdDate > date) return false;
  if (!item.removedAt) return true;
  const removedDate = getLocalDateKey(new Date(item.removedAt));
  return removedDate >= date;
}
```

Consequências:

- Item criado hoje conta no histórico de hoje.
- Item removido hoje continua contando no histórico de hoje.
- Item removido ontem não conta em hoje nem em datas futuras.
- O progresso de dias anteriores permanece armazenado.

## API de banco

Novas funções em `src/services/database.ts`:

- `dbLoadCustomRoutineItems(): Promise<CustomRoutineItem[]>`
- `dbSaveCustomRoutineItem(item): Promise<void>`
- `dbRemoveCustomRoutineItem(id, removedAt): Promise<void>` (remoção suave)
- `dbSaveCustomRoutineProgress(date, itemId, completed): Promise<void>`
- `dbLoadCustomRoutineProgress(date, itemId): Promise<boolean>`
- `dbClearCustomRoutineProgressForPeriod(date, period): Promise<void>`

`dbLoadRoutineHistory(days)` passa a:

1. carregar todos os itens extras;
2. para cada data e período, identificar extras ativos naquela data;
3. somar a quantidade de extras ativos ao `totalCount`;
4. somar as conclusões dos extras ao `completedCount`.

`dbResetAllData` passa a apagar `custom_routine` e `custom_routine_progress_daily` ou as chaves web equivalentes.

## Estado e ações da store

Novo estado:

```ts
const customRoutineItems = ref<CustomRoutineItem[]>([]);
```

Ações:

- `refreshCustomRoutineItems()`: recarrega todos os extras do banco.
- `addCustomRoutineItem({ period, icon, text })`: cria com ID, `createdAt` e `removedAt: null`, salva e recarrega itens e progresso.
- `removeCustomRoutineItem(id)`: grava `removedAt` com a data/hora atual, recarrega itens e progresso.
- `getRoutineItemsForPeriod(period)`: retorna padrões + extras ativos do período.
- `toggleRoutineItem(period, index)`: usa índice para padrões e ID estável para extras.
- `clearRoutineProgressData(period)`: limpa o progresso padrão do dia e o progresso extra daquele período, inclusive de itens removidos.
- `getRoutineProgressData(period)`: inclui os extras ativos no total e no array de conclusões.

`initialize` carrega os extras antes de montar o progresso do dia.

## Interface

### RoutinesView

- Usa `store.getRoutineItemsForPeriod(period)` em vez da lista estática.
- Extras aparecem após os padrões, com o mesmo layout.
- A chave da lista usa `item.id` para extras e o índice para padrões.

### ParentView

Novo painel "Rotinas personalizadas":

- seletor de período;
- campo de emoji;
- campo de texto;
- botão "Adicionar item";
- lista dos extras ativos com período, emoji, texto e botão "Remover";
- confirmação antes de remover, informando que o histórico anterior será mantido.

Após adicionar ou remover, o histórico exibido na área dos responsáveis é recarregado.

## Testes

Testes puros:

- `wasCustomItemActiveOnDate` para item criado antes, na data e depois; removido antes, na data e depois.

Testes de banco:

- salvar, carregar e remover extra com remoção suave;
- salvar, carregar e limpar progresso de extra;
- histórico soma extras ativos e conclusões;
- histórico não conta extra criado depois da data;
- histórico conta extra no dia da remoção;
- reset apaga extras e progresso de extras.

Verificação final:

- `npm test`
- `npm run typecheck`
- `npm run build`

## Riscos e decisões

- O histórico usa as definições atuais mais as datas de criação/remoção; não há snapshot diário da rotina. É suficiente para o escopo e evita migração.
- O progresso padrão permanece por índice. Como os padrões são fixos, não há deslocamento.
- Extras são sempre anexados ao final do período; não há reordenação.
- A remoção suave preserva o histórico sem manter o item visível na rotina.
