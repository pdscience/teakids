# Suporte Multilíngue (PT-BR, EN-US, ES-ES) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Traduzir o app inteiro para português, inglês e espanhol, com seletor na área dos responsáveis e voz acompanhando o idioma.

**Architecture:** i18n próprio e tipado, com dicionários de interface por locale, conteúdo nativo usando `LocalizedText` e IDs estáveis, locale persistido em `AppSettings`, e voz resolvida por locale com fallback.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vitest, Capacitor, `@capacitor-community/text-to-speech`.

**Spec:** `docs/superpowers/specs/2026-10-28-i18n-multilingual-design.md`

## Global Constraints

- Não adicionar dependências novas.
- Locales suportados: `pt-BR`, `en-US`, `es-ES`.
- Idioma padrão: `pt-BR`.
- Conteúdo criado pelos responsáveis nunca é traduzido.
- IDs de conversa devem continuar iguais aos IDs atuais derivados do texto em português.
- Progresso de rotina continua salvo por índice.
- O quiz compara IDs estáveis, nunca nomes traduzidos.
- Testes usam `environment: 'node'` e `TZ: 'America/Sao_Paulo'`.
- Comandos de verificação: `npm test`, `npm run typecheck`, `npm run build`.

## File Structure

**Criar:**

- `src/i18n/types.ts` — locales, `LocalizedText`, validação e labels.
- `src/i18n/content.ts` — `localized()` e `localize()`.
- `src/i18n/interpolate.ts` — interpolação `{name}`.
- `src/i18n/interpolate.test.ts` — testes de interpolação.
- `src/i18n/types.test.ts` — testes de locale e fallback.
- `src/i18n/messages/pt-BR.ts` — dicionário fonte da interface.
- `src/i18n/messages/en-US.ts` — dicionário inglês.
- `src/i18n/messages/es-ES.ts` — dicionário espanhol.
- `src/i18n/messages/index.ts` — mapa de dicionários e `MessageKey`.
- `src/i18n/messages/messages.test.ts` — paridade e preenchimento.
- `src/i18n/useI18n.ts` — composable `locale`, `t`, `formatDate`, `speechLocale`.
- `src/utils/slug.ts` — `slugify` compartilhado.
- `src/utils/slug.test.ts` — testes de slug.

**Modificar:**

- `src/types/models.ts` — `id` em `ConversationItem` e `InteractiveItem`.
- `src/utils/settings.ts` — `language` e validação.
- `src/utils/settings.test.ts` — casos de idioma.
- `src/stores/settings.ts` — `<html lang>`.
- `src/data/conversation.ts` — conteúdo localizado, IDs e categorias localizadas.
- `src/data/quickPhrases.ts` — conteúdo localizado.
- `src/data/coreVocabulary.ts` — conteúdo localizado.
- `src/data/alphabet.ts` — conteúdo localizado.
- `src/data/routines.ts` — conteúdo localizado, IDs e períodos localizados.
- `src/data/interactive.ts` — conteúdo localizado, IDs, categorias e tipos.
- `src/data/communication.ts` — índice por locale e IDs estáveis.
- `src/data/communication.test.ts` — IDs e locale.
- `src/data/routines.test.ts` — nova API localizada.
- `src/services/database.ts` — sem mudança funcional; só usa a API de rotinas.
- `src/composables/useTts.ts` — locale ativo, fallback e suporte por idioma.
- `src/composables/useTts.test.ts` — testes de locale.
- `src/stores/app.ts` — avisos por chave, locale das rotinas, preparação da voz.
- `src/App.vue` — navegação, banner, aviso e título localizados.
- `src/views/HomeView.vue` — textos localizados.
- `src/views/ConversationView.vue` — textos, frases e categorias localizadas.
- `src/views/ConversationCategoryView.vue` — título, ARIA e IDs.
- `src/views/SentenceBuilderView.vue` — vocabulário e textos localizados.
- `src/views/WriterView.vue` — alfabeto e textos localizados.
- `src/views/RoutinesView.vue` — períodos, datas, modal e ARIA localizados.
- `src/views/InteractiveView.vue` — categorias, quiz, tipos e textos localizados.
- `src/views/ParentView.vue` — seletor de idioma, datas, confirmações e painéis localizados.
- `index.html` — `lang="pt-BR"`.

---

### Task 1: Núcleo de i18n e utilitários

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/content.ts`
- Create: `src/i18n/interpolate.ts`
- Create: `src/i18n/types.test.ts`
- Create: `src/i18n/interpolate.test.ts`
- Create: `src/utils/slug.ts`
- Create: `src/utils/slug.test.ts`

**Interfaces:**
- Produces:
  - `LOCALES`, `Locale`, `LocalizedText`, `DEFAULT_LOCALE`, `LOCALE_LABELS`, `SPEECH_LANG`, `isLocale()`
  - `localized(pt, en, es): LocalizedText`
  - `localize(text, locale?): string`
  - `interpolate(template, params?): string`
  - `slugify(value): string`

- [ ] **Step 1: Escrever os testes do núcleo**

Crie `src/i18n/types.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { localize, localized } from './content';
import { DEFAULT_LOCALE, isLocale, LOCALES } from './types';

describe('i18n types', () => {
  it('accepts only supported locales', () => {
    expect(LOCALES.every(isLocale)).toBe(true);
    expect(isLocale('fr-FR')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it('returns the requested locale text', () => {
    const text = localized('Olá', 'Hello', 'Hola');

    expect(localize(text, 'en-US')).toBe('Hello');
    expect(localize(text, 'es-ES')).toBe('Hola');
    expect(localize(text, 'pt-BR')).toBe('Olá');
  });

  it('falls back to the default locale', () => {
    const text = localized('Olá', 'Hello', 'Hola');

    expect(localize({ ...text, 'en-US': '' }, 'en-US')).toBe('Olá');
    expect(DEFAULT_LOCALE).toBe('pt-BR');
  });
});
```

Crie `src/i18n/interpolate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('replaces named parameters', () => {
    expect(interpolate('Falar: {text}', { text: 'Olá' })).toBe('Falar: Olá');
  });

  it('keeps unknown placeholders', () => {
    expect(interpolate('Olá, {name}', {})).toBe('Olá, {name}');
  });

  it('returns the template without params', () => {
    expect(interpolate('Olá')).toBe('Olá');
  });
});
```

Crie `src/utils/slug.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('normalizes accents and spaces', () => {
    expect(slugify('Não sei')).toBe('nao-sei');
    expect(slugify('Trapézio')).toBe('trapezio');
  });

  it('removes punctuation and edge separators', () => {
    expect(slugify('  Olá, mundo!  ')).toBe('ola-mundo');
    expect(slugify('---')).toBe('');
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `npx vitest run src/i18n/types.test.ts src/i18n/interpolate.test.ts src/utils/slug.test.ts`
Expected: FAIL porque os módulos ainda não existem.

- [ ] **Step 3: Criar os módulos**

Crie `src/i18n/types.ts`:

```ts
export const LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const;

export type Locale = (typeof LOCALES)[number];

export type LocalizedText = Record<Locale, string>;

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
  'es-ES': 'Español',
};

export const SPEECH_LANG: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  'es-ES': 'es-ES',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
```

Crie `src/i18n/content.ts`:

```ts
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from './types';

export function localized(pt: string, en: string, es: string): LocalizedText {
  return { 'pt-BR': pt, 'en-US': en, 'es-ES': es };
}

export function localize(
  text: LocalizedText,
  locale: Locale = DEFAULT_LOCALE
): string {
  return text[locale] || text[DEFAULT_LOCALE];
}
```

Crie `src/i18n/interpolate.ts`:

```ts
export type InterpolationParams = Record<string, string | number>;

export function interpolate(template: string, params?: InterpolationParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}
```

Crie `src/utils/slug.ts`:

```ts
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 4: Rodar os testes para confirmar a aprovação**

Run: `npx vitest run src/i18n/types.test.ts src/i18n/interpolate.test.ts src/utils/slug.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/types.ts src/i18n/content.ts src/i18n/interpolate.ts src/i18n/types.test.ts src/i18n/interpolate.test.ts src/utils/slug.ts src/utils/slug.test.ts
git commit -m "Adiciona núcleo de i18n e slug compartilhado"
```

---

### Task 2: Dicionários de interface PT/EN/ES

**Files:**
- Create: `src/i18n/messages/pt-BR.ts`
- Create: `src/i18n/messages/en-US.ts`
- Create: `src/i18n/messages/es-ES.ts`
- Create: `src/i18n/messages/index.ts`
- Create: `src/i18n/messages/messages.test.ts`
- Create: `src/i18n/useI18n.ts`

**Interfaces:**
- Consumes: `Locale`, `DEFAULT_LOCALE`, `SPEECH_LANG`, `interpolate`.
- Produces:
  - `ptBR`, `enUS`, `esES`
  - `MessageKey`
  - `messagesByLocale`
  - `useI18n(): { locale, t, formatDate, speechLocale }`

- [ ] **Step 1: Criar o dicionário português como fonte de chaves**

Crie `src/i18n/messages/pt-BR.ts`:

```ts
export const ptBR = {
  'app.title': 'TEA Kids',
  'app.documentTitle': 'TEA Kids - Comunicação assistida',
  'app.loading': 'Carregando...',
  'app.installTitle': 'Instalar TEA Kids',
  'app.installHint': 'Adicione à tela inicial para usar como app.',
  'app.installIosHint': 'No iOS, toque em "Compartilhar" e "Adicionar à Tela de Início".',
  'app.install': 'Instalar',
  'app.warningDb': 'Não foi possível acessar o banco de dados. O progresso será salvo localmente.',
  'app.warningVoice': 'A voz não está disponível neste dispositivo.',
  'app.warningLoad': 'Não foi possível carregar os dados salvos.',
  'app.warningVoiceLanguage': 'A voz para {language} não está disponível. Usando a voz mais próxima.',
  'app.close': 'Fechar',
  'app.closeWarning': 'Fechar aviso',

  'nav.home': 'Início',
  'nav.conversation': 'Conversar',
  'nav.routines': 'Rotinas',
  'nav.writer': 'Escrever',
  'nav.interactive': 'Interação',

  'common.cancel': 'Cancelar',
  'common.remove': 'Remover',
  'common.delete': 'Apagar',
  'common.clear': 'Limpar',
  'common.emoji': 'Emoji',
  'common.category': 'Categoria',
  'common.period': 'Período',
  'common.color': 'Cor',
  'common.speakAria': 'Falar: {text}',
  'common.listenAria': 'Ouvir: {text}',

  'home.parentAria': 'Abrir área dos responsáveis',
  'home.welcome': '💙 Bem-vindo(a)! 💙',
  'home.starsTitle': '⭐ Estrelas de Hoje',
  'home.achievementMorning': 'Rotina da Manhã',
  'home.achievementAfternoon': 'Rotina da Tarde',
  'home.achievementNight': 'Rotina da Noite',
  'home.achievementConversation': 'Conversar',
  'home.achievementQuiz': 'Quiz Champion',
  'home.achievementStatus': '{label}: {status}',
  'home.achievementUnlocked': 'conquistada',
  'home.achievementPending': 'pendente',
  'home.allStars': '🏆 Você conquistou todas as estrelas hoje!',
  'home.description': 'Abrace o autismo e crie um mundo mais azul, um mundo com mais inclusão.',
  'home.navHint': 'Use a navegação abaixo para explorar:',
  'home.featureConversationTitle': 'Conversar',
  'home.featureConversationDescription': 'Categorias de comunicação',
  'home.featureRoutinesTitle': 'Rotinas',
  'home.featureRoutinesDescription': 'Checklists diários',
  'home.featureWriterTitle': 'Escrever',
  'home.featureWriterDescription': 'Digitar e falar',
  'home.featureInteractiveTitle': 'Interação',
  'home.featureInteractiveDescription': 'Aprender cores e formas',
  'home.footer': 'Um espaço seguro para aprender, comunicar e crescer 🌟',

  'conversation.title': 'Conversar',
  'conversation.subtitle': 'Escolha uma categoria ou use uma frase rápida',
  'conversation.builder': '🧩 Montar frase',
  'conversation.quick': 'Frases rápidas',
  'conversation.favorites': '⭐ Favoritos',
  'conversation.recents': '🕘 Recentes',
  'conversation.categories': 'Categorias',
  'conversation.categorySubtitle': 'Toque nos cartões para falar',
  'conversation.addFavoriteAria': 'Adicionar aos favoritos: {text}',
  'conversation.removeFavoriteAria': 'Remover dos favoritos: {text}',
  'conversation.fallbackTitle': 'Conversar',

  'builder.backAria': 'Voltar para conversar',
  'builder.title': 'Montar frase',
  'builder.subtitle': 'Toque nas palavras para montar o que quer dizer',
  'builder.empty': 'Toque nas palavras abaixo para começar.',
  'builder.removeAria': 'Remover {word}',
  'builder.speak': '🔊 Falar frase',
  'builder.words': 'Palavras',
  'builder.addAria': 'Adicionar {word}',

  'routines.title': 'Rotinas',
  'routines.subtitle': 'Acompanhe suas atividades de hoje',
  'routines.clearAria': 'Limpar progresso da rotina',
  'routines.tabMorning': '🌅 Manhã',
  'routines.tabAfternoon': '☀️ Tarde',
  'routines.tabNight': '🌙 Noite',
  'routines.progress': 'Progresso:',
  'routines.completed': '🌟 Incrível! Tudo feito!',
  'routines.celebrationTitle': 'Rotina Completa!',
  'routines.celebrationSub': 'Parabéns! Continue assim! 🌟',
  'routines.clearTitle': 'Limpar Progresso?',
  'routines.clearText': 'Deseja limpar o progresso de hoje da rotina "{period}"?',
  'routines.today': 'Hoje, {date}',
  'routines.speakCongrats': 'Parabéns! Você completou a rotina!',
  'routines.markDone': 'Marcar {item} como concluído',
  'routines.markUndone': 'Marcar {item} como não concluído',

  'writer.title': 'Escrever',
  'writer.subtitle': 'Escreva e eu falo:',
  'writer.clearAria': 'Limpar texto',
  'writer.placeholder': 'Digite algo e eu falo...',
  'writer.speak': 'Falar texto',
  'writer.tip': 'Dica: Use frases curtas para melhor compreensão',
  'writer.alphabet': 'Alfabeto:',
  'writer.letterAria': 'Letra {letter}, {word}',
  'writer.letterWord': '{letter} de {word}',

  'interactive.title': 'Interação',
  'interactive.subtitle': 'Aprenda formas, cores e muito mais',
  'interactive.quizOn': 'Quiz ON',
  'interactive.quiz': 'Quiz',
  'interactive.quizGroupAria': 'Categorias de interação',
  'interactive.categoryAria': 'Categoria {name}',
  'interactive.question': 'Qual é este?',
  'interactive.skip': '↪ Pular',
  'interactive.askShapes': 'Qual é este formato?',
  'interactive.askItem': 'Qual é este item?',
  'interactive.correct': 'Correto! {name}',
  'interactive.wrong': 'Era {name}',
  'interactive.categoryShapes': 'Formas',
  'interactive.categoryColors': 'Cores',
  'interactive.categoryAnimals': 'Animais',
  'interactive.categoryFruits': 'Frutas',
  'interactive.categoryFoods': 'Alimentos',
  'interactive.categoryNumbers': 'Números',
  'interactive.categoryVegetables': 'Legumes',
  'interactive.categoryHousehold': 'Casa',
  'interactive.typeDomestic': 'Doméstico',
  'interactive.typeBrazilianWildlife': 'Fauna Brasileira',
  'interactive.typeWild': 'Selvagem',
  'interactive.typeMarine': 'Marinho',
  'interactive.typeCereals': 'Cereais',
  'interactive.typeProteins': 'Proteínas',
  'interactive.typeDairy': 'Laticínios',
  'interactive.typeSweets': 'Doces',
  'interactive.typeVegetables': 'Vegetais',
  'interactive.typeFastFood': 'Fast Food',
  'interactive.typeDrinks': 'Bebidas',

  'parent.backAria': 'Voltar para o início',
  'parent.title': 'Área dos responsáveis',
  'parent.subtitle': 'Ajustes, histórico e personalização',
  'parent.gateTitle': 'Confirmação para adultos',
  'parent.gateText': 'Resolva a conta para abrir as configurações.',
  'parent.gateAria': 'Resposta da conta',
  'parent.gateError': 'Resposta incorreta. Tente a nova conta.',
  'parent.enter': 'Entrar',
  'parent.newChallenge': 'Trocar conta',
  'parent.languageTitle': '🌐 Idioma',
  'parent.languageHint': 'Escolha o idioma do app.',
  'parent.languageChanged': 'Idioma alterado.',
  'parent.languageUnsupported': 'A voz para este idioma não está disponível; usando a mais próxima.',
  'parent.voiceTitle': '🔊 Voz e acessibilidade',
  'parent.speechRate': 'Velocidade da voz',
  'parent.speechPitch': 'Tom da voz',
  'parent.sound': 'Som da voz',
  'parent.reduceMotion': 'Reduzir animações',
  'parent.largeText': 'Texto maior',
  'parent.highContrast': 'Alto contraste',
  'parent.testVoice': 'Testar voz',
  'parent.resetSettings': 'Restaurar ajustes',
  'parent.testPhrase': 'Olá! Esta é a voz do TEA Kids.',
  'parent.historyTitle': '📅 Histórico dos últimos 7 dias',
  'parent.historyLoading': 'Carregando histórico...',
  'parent.customRoutinesTitle': '📅 Rotinas personalizadas',
  'parent.customRoutinesHint': 'Adicione atividades extras. Os itens padrão continuam iguais.',
  'parent.itemEmojiAria': 'Emoji do item da rotina',
  'parent.itemName': 'Nome do item',
  'parent.itemPlaceholder': 'Ex.: Tomar remédio',
  'parent.addItem': 'Adicionar item',
  'parent.noCustomItems': 'Nenhum item personalizado ainda.',
  'parent.removeItemConfirm': 'Remover este item da rotina? O histórico anterior será mantido.',
  'parent.itemError': 'Digite o nome do item.',
  'parent.customCardsTitle': '🃏 Cartões personalizados',
  'parent.customCardsHint': 'Crie cartões extras de comunicação para o seu filho.',
  'parent.cardEmojiAria': 'Emoji do cartão',
  'parent.cardText': 'Texto do cartão',
  'parent.cardPlaceholder': 'Ex.: Quero meu brinquedo',
  'parent.addCard': 'Adicionar cartão',
  'parent.noCustomCards': 'Nenhum cartão personalizado ainda.',
  'parent.cardError': 'Digite o texto do cartão.',
  'parent.deleteCardConfirm': 'Apagar este cartão personalizado?',
  'parent.dataTitle': '💾 Dados',
  'parent.downloadBackup': 'Baixar backup',
  'parent.copyBackup': 'Copiar backup',
  'parent.backupGenerated': 'Backup gerado.',
  'parent.backupCopied': 'Backup copiado para a área de transferência.',
  'parent.backupCopyError': 'Não foi possível copiar o backup neste dispositivo.',
  'parent.resetAll': 'Apagar todos os dados',
  'parent.deleting': 'Apagando...',
  'parent.resetConfirm': 'Isso apaga todo o progresso, favoritos, ajustes e cartões personalizados. Deseja continuar?',
} as const;

export type MessageKey = keyof typeof ptBR;
```

- [ ] **Step 2: Criar os dicionários inglês e espanhol**

Crie `src/i18n/messages/en-US.ts`:

```ts
import type { MessageKey } from './pt-BR';

export const enUS: Record<MessageKey, string> = {
  'app.title': 'TEA Kids',
  'app.documentTitle': 'TEA Kids - Assistive communication',
  'app.loading': 'Loading...',
  'app.installTitle': 'Install TEA Kids',
  'app.installHint': 'Add it to your home screen to use it as an app.',
  'app.installIosHint': 'On iOS, tap "Share" and "Add to Home Screen".',
  'app.install': 'Install',
  'app.warningDb': 'Could not access the database. Progress will be saved locally.',
  'app.warningVoice': 'Voice is not available on this device.',
  'app.warningLoad': 'Could not load saved data.',
  'app.warningVoiceLanguage': 'The voice for {language} is not available. Using the closest voice.',
  'app.close': 'Close',
  'app.closeWarning': 'Close warning',

  'nav.home': 'Home',
  'nav.conversation': 'Talk',
  'nav.routines': 'Routines',
  'nav.writer': 'Write',
  'nav.interactive': 'Interaction',

  'common.cancel': 'Cancel',
  'common.remove': 'Remove',
  'common.delete': 'Delete',
  'common.clear': 'Clear',
  'common.emoji': 'Emoji',
  'common.category': 'Category',
  'common.period': 'Period',
  'common.color': 'Color',
  'common.speakAria': 'Speak: {text}',
  'common.listenAria': 'Listen: {text}',

  'home.parentAria': 'Open parent area',
  'home.welcome': '💙 Welcome! 💙',
  'home.starsTitle': "⭐ Today's Stars",
  'home.achievementMorning': 'Morning Routine',
  'home.achievementAfternoon': 'Afternoon Routine',
  'home.achievementNight': 'Night Routine',
  'home.achievementConversation': 'Talk',
  'home.achievementQuiz': 'Quiz Champion',
  'home.achievementStatus': '{label}: {status}',
  'home.achievementUnlocked': 'achieved',
  'home.achievementPending': 'pending',
  'home.allStars': '🏆 You earned all the stars today!',
  'home.description': 'Embrace autism and create a bluer world, a world with more inclusion.',
  'home.navHint': 'Use the navigation below to explore:',
  'home.featureConversationTitle': 'Talk',
  'home.featureConversationDescription': 'Communication categories',
  'home.featureRoutinesTitle': 'Routines',
  'home.featureRoutinesDescription': 'Daily checklists',
  'home.featureWriterTitle': 'Write',
  'home.featureWriterDescription': 'Type and speak',
  'home.featureInteractiveTitle': 'Interaction',
  'home.featureInteractiveDescription': 'Learn colors and shapes',
  'home.footer': 'A safe space to learn, communicate and grow 🌟',

  'conversation.title': 'Talk',
  'conversation.subtitle': 'Choose a category or use a quick phrase',
  'conversation.builder': '🧩 Build a sentence',
  'conversation.quick': 'Quick phrases',
  'conversation.favorites': '⭐ Favorites',
  'conversation.recents': '🕘 Recent',
  'conversation.categories': 'Categories',
  'conversation.categorySubtitle': 'Tap the cards to speak',
  'conversation.addFavoriteAria': 'Add to favorites: {text}',
  'conversation.removeFavoriteAria': 'Remove from favorites: {text}',
  'conversation.fallbackTitle': 'Talk',

  'builder.backAria': 'Back to talk',
  'builder.title': 'Build a sentence',
  'builder.subtitle': 'Tap the words to build what you want to say',
  'builder.empty': 'Tap the words below to start.',
  'builder.removeAria': 'Remove {word}',
  'builder.speak': '🔊 Speak sentence',
  'builder.words': 'Words',
  'builder.addAria': 'Add {word}',

  'routines.title': 'Routines',
  'routines.subtitle': "Track today's activities",
  'routines.clearAria': 'Clear routine progress',
  'routines.tabMorning': '🌅 Morning',
  'routines.tabAfternoon': '☀️ Afternoon',
  'routines.tabNight': '🌙 Night',
  'routines.progress': 'Progress:',
  'routines.completed': '🌟 Amazing! All done!',
  'routines.celebrationTitle': 'Routine Complete!',
  'routines.celebrationSub': 'Congratulations! Keep it up! 🌟',
  'routines.clearTitle': 'Clear Progress?',
  'routines.clearText': 'Do you want to clear today\'s progress for the "{period}" routine?',
  'routines.today': 'Today, {date}',
  'routines.speakCongrats': 'Congratulations! You completed the routine!',
  'routines.markDone': 'Mark {item} as done',
  'routines.markUndone': 'Mark {item} as not done',

  'writer.title': 'Write',
  'writer.subtitle': "Write and I'll speak:",
  'writer.clearAria': 'Clear text',
  'writer.placeholder': "Type something and I'll speak...",
  'writer.speak': 'Speak text',
  'writer.tip': 'Tip: Use short sentences for better understanding',
  'writer.alphabet': 'Alphabet:',
  'writer.letterAria': 'Letter {letter}, {word}',
  'writer.letterWord': '{letter} for {word}',

  'interactive.title': 'Interaction',
  'interactive.subtitle': 'Learn shapes, colors and more',
  'interactive.quizOn': 'Quiz ON',
  'interactive.quiz': 'Quiz',
  'interactive.quizGroupAria': 'Interaction categories',
  'interactive.categoryAria': 'Category {name}',
  'interactive.question': 'Which one is this?',
  'interactive.skip': '↪ Skip',
  'interactive.askShapes': 'Which shape is this?',
  'interactive.askItem': 'Which item is this?',
  'interactive.correct': 'Correct! {name}',
  'interactive.wrong': 'It was {name}',
  'interactive.categoryShapes': 'Shapes',
  'interactive.categoryColors': 'Colors',
  'interactive.categoryAnimals': 'Animals',
  'interactive.categoryFruits': 'Fruits',
  'interactive.categoryFoods': 'Foods',
  'interactive.categoryNumbers': 'Numbers',
  'interactive.categoryVegetables': 'Vegetables',
  'interactive.categoryHousehold': 'Home',
  'interactive.typeDomestic': 'Domestic',
  'interactive.typeBrazilianWildlife': 'Brazilian wildlife',
  'interactive.typeWild': 'Wild',
  'interactive.typeMarine': 'Marine',
  'interactive.typeCereals': 'Cereals',
  'interactive.typeProteins': 'Proteins',
  'interactive.typeDairy': 'Dairy',
  'interactive.typeSweets': 'Sweets',
  'interactive.typeVegetables': 'Vegetables',
  'interactive.typeFastFood': 'Fast Food',
  'interactive.typeDrinks': 'Drinks',

  'parent.backAria': 'Back to home',
  'parent.title': 'Parent area',
  'parent.subtitle': 'Settings, history and customization',
  'parent.gateTitle': 'Adult confirmation',
  'parent.gateText': 'Solve the math problem to open settings.',
  'parent.gateAria': 'Answer to the math problem',
  'parent.gateError': 'Wrong answer. Try the new problem.',
  'parent.enter': 'Enter',
  'parent.newChallenge': 'New problem',
  'parent.languageTitle': '🌐 Language',
  'parent.languageHint': 'Choose the app language.',
  'parent.languageChanged': 'Language changed.',
  'parent.languageUnsupported': 'The voice for this language is not available; using the closest one.',
  'parent.voiceTitle': '🔊 Voice and accessibility',
  'parent.speechRate': 'Speech rate',
  'parent.speechPitch': 'Voice pitch',
  'parent.sound': 'Voice sound',
  'parent.reduceMotion': 'Reduce motion',
  'parent.largeText': 'Larger text',
  'parent.highContrast': 'High contrast',
  'parent.testVoice': 'Test voice',
  'parent.resetSettings': 'Restore settings',
  'parent.testPhrase': 'Hello! This is the TEA Kids voice.',
  'parent.historyTitle': '📅 Last 7 days history',
  'parent.historyLoading': 'Loading history...',
  'parent.customRoutinesTitle': '📅 Custom routines',
  'parent.customRoutinesHint': 'Add extra activities. Default items stay the same.',
  'parent.itemEmojiAria': 'Routine item emoji',
  'parent.itemName': 'Item name',
  'parent.itemPlaceholder': 'E.g.: Take medicine',
  'parent.addItem': 'Add item',
  'parent.noCustomItems': 'No custom items yet.',
  'parent.removeItemConfirm': 'Remove this routine item? Previous history will be kept.',
  'parent.itemError': 'Enter the item name.',
  'parent.customCardsTitle': '🃏 Custom cards',
  'parent.customCardsHint': 'Create extra communication cards for your child.',
  'parent.cardEmojiAria': 'Card emoji',
  'parent.cardText': 'Card text',
  'parent.cardPlaceholder': 'E.g.: I want my toy',
  'parent.addCard': 'Add card',
  'parent.noCustomCards': 'No custom cards yet.',
  'parent.cardError': 'Enter the card text.',
  'parent.deleteCardConfirm': 'Delete this custom card?',
  'parent.dataTitle': '💾 Data',
  'parent.downloadBackup': 'Download backup',
  'parent.copyBackup': 'Copy backup',
  'parent.backupGenerated': 'Backup created.',
  'parent.backupCopied': 'Backup copied to clipboard.',
  'parent.backupCopyError': 'Could not copy the backup on this device.',
  'parent.resetAll': 'Delete all data',
  'parent.deleting': 'Deleting...',
  'parent.resetConfirm': 'This deletes all progress, favorites, settings and custom cards. Continue?',
};
```

Crie `src/i18n/messages/es-ES.ts`:

```ts
import type { MessageKey } from './pt-BR';

export const esES: Record<MessageKey, string> = {
  'app.title': 'TEA Kids',
  'app.documentTitle': 'TEA Kids - Comunicación asistida',
  'app.loading': 'Cargando...',
  'app.installTitle': 'Instalar TEA Kids',
  'app.installHint': 'Añádelo a la pantalla de inicio para usarlo como app.',
  'app.installIosHint': 'En iOS, toca "Compartir" y "Añadir a pantalla de inicio".',
  'app.install': 'Instalar',
  'app.warningDb': 'No se pudo acceder a la base de datos. El progreso se guardará localmente.',
  'app.warningVoice': 'La voz no está disponible en este dispositivo.',
  'app.warningLoad': 'No se pudieron cargar los datos guardados.',
  'app.warningVoiceLanguage': 'La voz para {language} no está disponible. Usando la voz más cercana.',
  'app.close': 'Cerrar',
  'app.closeWarning': 'Cerrar aviso',

  'nav.home': 'Inicio',
  'nav.conversation': 'Hablar',
  'nav.routines': 'Rutinas',
  'nav.writer': 'Escribir',
  'nav.interactive': 'Interacción',

  'common.cancel': 'Cancelar',
  'common.remove': 'Quitar',
  'common.delete': 'Eliminar',
  'common.clear': 'Limpiar',
  'common.emoji': 'Emoji',
  'common.category': 'Categoría',
  'common.period': 'Período',
  'common.color': 'Color',
  'common.speakAria': 'Hablar: {text}',
  'common.listenAria': 'Escuchar: {text}',

  'home.parentAria': 'Abrir área de responsables',
  'home.welcome': '💙 ¡Bienvenido(a)! 💙',
  'home.starsTitle': '⭐ Estrellas de Hoy',
  'home.achievementMorning': 'Rutina de la Mañana',
  'home.achievementAfternoon': 'Rutina de la Tarde',
  'home.achievementNight': 'Rutina de la Noche',
  'home.achievementConversation': 'Hablar',
  'home.achievementQuiz': 'Campeón del Quiz',
  'home.achievementStatus': '{label}: {status}',
  'home.achievementUnlocked': 'conseguida',
  'home.achievementPending': 'pendiente',
  'home.allStars': '🏆 ¡Ganaste todas las estrellas hoy!',
  'home.description': 'Abraza el autismo y crea un mundo más azul, un mundo con más inclusión.',
  'home.navHint': 'Usa la navegación de abajo para explorar:',
  'home.featureConversationTitle': 'Hablar',
  'home.featureConversationDescription': 'Categorías de comunicación',
  'home.featureRoutinesTitle': 'Rutinas',
  'home.featureRoutinesDescription': 'Listas diarias',
  'home.featureWriterTitle': 'Escribir',
  'home.featureWriterDescription': 'Escribir y hablar',
  'home.featureInteractiveTitle': 'Interacción',
  'home.featureInteractiveDescription': 'Aprender colores y formas',
  'home.footer': 'Un espacio seguro para aprender, comunicar y crecer 🌟',

  'conversation.title': 'Hablar',
  'conversation.subtitle': 'Elige una categoría o usa una frase rápida',
  'conversation.builder': '🧩 Crear una frase',
  'conversation.quick': 'Frases rápidas',
  'conversation.favorites': '⭐ Favoritos',
  'conversation.recents': '🕘 Recientes',
  'conversation.categories': 'Categorías',
  'conversation.categorySubtitle': 'Toca las tarjetas para hablar',
  'conversation.addFavoriteAria': 'Añadir a favoritos: {text}',
  'conversation.removeFavoriteAria': 'Quitar de favoritos: {text}',
  'conversation.fallbackTitle': 'Hablar',

  'builder.backAria': 'Volver a hablar',
  'builder.title': 'Crear una frase',
  'builder.subtitle': 'Toca las palabras para formar lo que quieres decir',
  'builder.empty': 'Toca las palabras de abajo para empezar.',
  'builder.removeAria': 'Quitar {word}',
  'builder.speak': '🔊 Hablar frase',
  'builder.words': 'Palabras',
  'builder.addAria': 'Añadir {word}',

  'routines.title': 'Rutinas',
  'routines.subtitle': 'Sigue tus actividades de hoy',
  'routines.clearAria': 'Borrar el progreso de la rutina',
  'routines.tabMorning': '🌅 Mañana',
  'routines.tabAfternoon': '☀️ Tarde',
  'routines.tabNight': '🌙 Noche',
  'routines.progress': 'Progreso:',
  'routines.completed': '🌟 ¡Increíble! ¡Todo hecho!',
  'routines.celebrationTitle': '¡Rutina completa!',
  'routines.celebrationSub': '¡Felicidades! ¡Sigue así! 🌟',
  'routines.clearTitle': '¿Borrar progreso?',
  'routines.clearText': '¿Quieres borrar el progreso de hoy de la rutina "{period}"?',
  'routines.today': 'Hoy, {date}',
  'routines.speakCongrats': '¡Felicidades! ¡Completaste la rutina!',
  'routines.markDone': 'Marcar {item} como completado',
  'routines.markUndone': 'Marcar {item} como no completado',

  'writer.title': 'Escribir',
  'writer.subtitle': 'Escribe y yo hablo:',
  'writer.clearAria': 'Borrar texto',
  'writer.placeholder': 'Escribe algo y yo hablo...',
  'writer.speak': 'Hablar texto',
  'writer.tip': 'Consejo: usa frases cortas para una mejor comprensión',
  'writer.alphabet': 'Alfabeto:',
  'writer.letterAria': 'Letra {letter}, {word}',
  'writer.letterWord': '{letter} de {word}',

  'interactive.title': 'Interacción',
  'interactive.subtitle': 'Aprende formas, colores y mucho más',
  'interactive.quizOn': 'Quiz ACTIVO',
  'interactive.quiz': 'Quiz',
  'interactive.quizGroupAria': 'Categorías de interacción',
  'interactive.categoryAria': 'Categoría {name}',
  'interactive.question': '¿Cuál es este?',
  'interactive.skip': '↪ Saltar',
  'interactive.askShapes': '¿Qué forma es esta?',
  'interactive.askItem': '¿Qué elemento es este?',
  'interactive.correct': '¡Correcto! {name}',
  'interactive.wrong': 'Era {name}',
  'interactive.categoryShapes': 'Formas',
  'interactive.categoryColors': 'Colores',
  'interactive.categoryAnimals': 'Animales',
  'interactive.categoryFruits': 'Frutas',
  'interactive.categoryFoods': 'Alimentos',
  'interactive.categoryNumbers': 'Números',
  'interactive.categoryVegetables': 'Verduras',
  'interactive.categoryHousehold': 'Hogar',
  'interactive.typeDomestic': 'Doméstico',
  'interactive.typeBrazilianWildlife': 'Fauna brasileña',
  'interactive.typeWild': 'Salvaje',
  'interactive.typeMarine': 'Marino',
  'interactive.typeCereals': 'Cereales',
  'interactive.typeProteins': 'Proteínas',
  'interactive.typeDairy': 'Lácteos',
  'interactive.typeSweets': 'Dulces',
  'interactive.typeVegetables': 'Verduras',
  'interactive.typeFastFood': 'Comida rápida',
  'interactive.typeDrinks': 'Bebidas',

  'parent.backAria': 'Volver al inicio',
  'parent.title': 'Área de responsables',
  'parent.subtitle': 'Ajustes, historial y personalización',
  'parent.gateTitle': 'Confirmación para adultos',
  'parent.gateText': 'Resuelve la operación para abrir los ajustes.',
  'parent.gateAria': 'Respuesta de la operación',
  'parent.gateError': 'Respuesta incorrecta. Prueba con la nueva operación.',
  'parent.enter': 'Entrar',
  'parent.newChallenge': 'Cambiar operación',
  'parent.languageTitle': '🌐 Idioma',
  'parent.languageHint': 'Elige el idioma de la app.',
  'parent.languageChanged': 'Idioma cambiado.',
  'parent.languageUnsupported': 'La voz para este idioma no está disponible; usando la más cercana.',
  'parent.voiceTitle': '🔊 Voz y accesibilidad',
  'parent.speechRate': 'Velocidad de la voz',
  'parent.speechPitch': 'Tono de la voz',
  'parent.sound': 'Sonido de la voz',
  'parent.reduceMotion': 'Reducir animaciones',
  'parent.largeText': 'Texto más grande',
  'parent.highContrast': 'Alto contraste',
  'parent.testVoice': 'Probar voz',
  'parent.resetSettings': 'Restaurar ajustes',
  'parent.testPhrase': '¡Hola! Esta es la voz de TEA Kids.',
  'parent.historyTitle': '📅 Historial de los últimos 7 días',
  'parent.historyLoading': 'Cargando historial...',
  'parent.customRoutinesTitle': '📅 Rutinas personalizadas',
  'parent.customRoutinesHint': 'Añade actividades extra. Los elementos predeterminados no cambian.',
  'parent.itemEmojiAria': 'Emoji del elemento de la rutina',
  'parent.itemName': 'Nombre del elemento',
  'parent.itemPlaceholder': 'Ej.: Tomar medicina',
  'parent.addItem': 'Añadir elemento',
  'parent.noCustomItems': 'Aún no hay elementos personalizados.',
  'parent.removeItemConfirm': '¿Quitar este elemento de la rutina? Se mantendrá el historial anterior.',
  'parent.itemError': 'Escribe el nombre del elemento.',
  'parent.customCardsTitle': '🃏 Tarjetas personalizadas',
  'parent.customCardsHint': 'Crea tarjetas de comunicación extra para tu hijo/a.',
  'parent.cardEmojiAria': 'Emoji de la tarjeta',
  'parent.cardText': 'Texto de la tarjeta',
  'parent.cardPlaceholder': 'Ej.: Quiero mi juguete',
  'parent.addCard': 'Añadir tarjeta',
  'parent.noCustomCards': 'Aún no hay tarjetas personalizadas.',
  'parent.cardError': 'Escribe el texto de la tarjeta.',
  'parent.deleteCardConfirm': '¿Eliminar esta tarjeta personalizada?',
  'parent.dataTitle': '💾 Datos',
  'parent.downloadBackup': 'Descargar copia',
  'parent.copyBackup': 'Copiar copia',
  'parent.backupGenerated': 'Copia creada.',
  'parent.backupCopied': 'Copia copiada al portapapeles.',
  'parent.backupCopyError': 'No se pudo copiar la copia en este dispositivo.',
  'parent.resetAll': 'Borrar todos los datos',
  'parent.deleting': 'Borrando...',
  'parent.resetConfirm': 'Esto borra todo el progreso, favoritos, ajustes y tarjetas personalizadas. ¿Quieres continuar?',
};
```

- [ ] **Step 3: Criar o índice e o composable**

Crie `src/i18n/messages/index.ts`:

```ts
import type { Locale } from '../types';
import { enUS } from './en-US';
import { esES } from './es-ES';
import { ptBR } from './pt-BR';

export type { MessageKey } from './pt-BR';

export const messagesByLocale: Record<Locale, typeof ptBR> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};
```

Crie `src/i18n/useI18n.ts`:

```ts
import { computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { interpolate, type InterpolationParams } from './interpolate';
import { messagesByLocale, type MessageKey } from './messages';
import {
  DEFAULT_LOCALE,
  SPEECH_LANG,
  type Locale,
} from './types';

export function useI18n() {
  const settings = useSettingsStore();
  const locale = computed<Locale>(() => settings.settings.language);

  const t = (key: MessageKey, params?: InterpolationParams): string => {
    const message =
      messagesByLocale[locale.value][key] ??
      messagesByLocale[DEFAULT_LOCALE][key];
    return interpolate(message, params);
  };

  const formatDate = (
    date: Date,
    options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ): string => new Intl.DateTimeFormat(locale.value, options).format(date);

  const speechLocale = computed(() => SPEECH_LANG[locale.value]);

  return { locale, t, formatDate, speechLocale };
}
```

- [ ] **Step 4: Criar os testes de paridade**

Crie `src/i18n/messages/messages.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../types';
import { messagesByLocale } from './index';
import { ptBR } from './pt-BR';

describe('ui messages', () => {
  it('has every key in every locale', () => {
    const keys = Object.keys(ptBR).sort();

    for (const locale of LOCALES) {
      expect(Object.keys(messagesByLocale[locale]).sort()).toEqual(keys);
    }
  });

  it('has no empty messages', () => {
    for (const locale of LOCALES) {
      for (const value of Object.values(messagesByLocale[locale])) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 5: Rodar os testes**

Run: `npx vitest run src/i18n/messages/messages.test.ts`
Expected: PASS.

- [ ] **Step 6: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/messages src/i18n/useI18n.ts
git commit -m "Adiciona dicionários de interface PT/EN/ES"
```

---

### Task 3: Idioma nas configurações

**Files:**
- Modify: `src/utils/settings.ts`
- Modify: `src/utils/settings.test.ts`
- Modify: `src/stores/settings.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Locale`, `DEFAULT_LOCALE`, `isLocale`.
- Produces:
  - `AppSettings.language`
  - `DEFAULT_SETTINGS.language`
  - `useSettingsStore.apply()` atualiza `<html lang>`

- [ ] **Step 1: Adicionar testes de idioma**

Acrescente a `src/utils/settings.test.ts`:

```ts
  it('keeps a supported language', () => {
    expect(parseSettings(JSON.stringify({ language: 'en-US' })).language).toBe('en-US');
  });

  it('defaults an invalid or missing language to pt-BR', () => {
    expect(parseSettings(JSON.stringify({ language: 'fr-FR' })).language).toBe('pt-BR');
    expect(parseSettings(JSON.stringify({})).language).toBe('pt-BR');
  });
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npx vitest run src/utils/settings.test.ts`
Expected: FAIL porque `language` ainda não existe.

- [ ] **Step 3: Implementar o campo**

Em `src/utils/settings.ts`, importe:

```ts
import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/types';
```

Adicione `language: Locale` a `AppSettings` e `language: DEFAULT_LOCALE` a `DEFAULT_SETTINGS`.

No retorno de `parseSettings`, adicione:

```ts
    language: isLocale(data.language) ? data.language : DEFAULT_SETTINGS.language,
```

- [ ] **Step 4: Atualizar o locale do documento**

Em `src/stores/settings.ts`, dentro de `apply()`, adicione:

```ts
    root.lang = settings.value.language;
```

Em `index.html`, troque `<html lang="pt">` por `<html lang="pt-BR">`.

- [ ] **Step 5: Rodar testes e typecheck**

Run: `npx vitest run src/utils/settings.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/settings.ts src/utils/settings.test.ts src/stores/settings.ts index.html
git commit -m "Adiciona idioma às configurações persistidas"
```

---

### Task 4: Conversa localizada e IDs estáveis

**Files:**
- Modify: `src/types/models.ts`
- Modify: `src/data/conversation.ts`
- Modify: `src/data/conversation.test.ts`
- Modify: `src/data/communication.ts` (somente o import de `slugify` nesta task)

**Interfaces:**
- Consumes: `localized`, `localize`, `DEFAULT_LOCALE`, `Locale`, `slugify`.
- Produces:
  - `ConversationItem.id`
  - `CONVERSATION_CATEGORIES`
  - `getConversationItems(category, locale?)`
  - `getAllConversationCategories(locale?)`

- [ ] **Step 1: Adicionar `id` ao modelo**

Em `src/types/models.ts`, altere:

```ts
export interface ConversationItem {
  id: string;
  icon: string;
  text: string;
  category: string;
  color?: string;
}
```

- [ ] **Step 2: Adicionar testes de tradução e ID**

Acrescente a `src/data/conversation.test.ts`:

```ts
import {
  CONVERSATION_CATEGORIES,
  getAllConversationCategories,
  getConversationItems,
} from './conversation';
import { slugify } from '../utils/slug';

describe('localized conversation items', () => {
  it('keeps the same id across locales', () => {
    const pt = getConversationItems('greetings', 'pt-BR').find((item) => item.text === 'Olá');
    const en = getConversationItems('greetings', 'en-US').find((item) => item.id === pt?.id);
    const es = getConversationItems('greetings', 'es-ES').find((item) => item.id === pt?.id);

    expect(pt?.id).toBe('greetings:ola');
    expect(en?.text).toBe('Hello');
    expect(es?.text).toBe('Hola');
  });

  it('localizes every category name', () => {
    const categories = getAllConversationCategories('en-US');
    expect(categories.find((category) => category.id === 'needs')?.name).toBe('Needs');
  });

  it('preserves every legacy conversation id', () => {
    for (const category of CONVERSATION_CATEGORIES) {
      for (const item of getConversationItems(category, 'pt-BR')) {
        expect(item.id).toBe(`${category}:${slugify(item.text)}`);
      }
    }
  });
});
```

Ajuste o import existente para incluir `getAllConversationCategories`.

- [ ] **Step 3: Rodar os testes para confirmar a falha**

Run: `npx vitest run src/data/conversation.test.ts`
Expected: FAIL porque os getters ainda não aceitam locale.

- [ ] **Step 4: Reescrever `src/data/conversation.ts`**

Substitua o arquivo inteiro por:

```ts
import type { ConversationCategory, ConversationItem } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';
import { slugify } from '../utils/slug';

const colorMap: Record<string, string> = {
  green: '#4CAF50',
  red: '#F44336',
  blue: '#2196F3',
  blueGrey: '#607D8B',
  orange: '#FF9800',
  deepOrange: '#FF5722',
  indigo: '#3F51B5',
  teal: '#009688',
  purple: '#9C27B0',
  brown: '#795548',
  blueAccent: '#448AFF',
  amber: '#FFC107',
  pink: '#E91E63',
  grey: '#9E9E9E',
  cyan: '#00BCD4',
  lightBlue: '#03A9F4',
  redAccent: '#FF1744',
  greenAccent: '#00E676',
  deepPurple: '#673AB7',
  orangeAccent: '#FF9100',
  yellow: '#FFEB3B',
  black: '#000000',
};

const DEFAULT_COLOR = '#2196F3';
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

export function getColor(colorName: string | undefined): string {
  if (!colorName) return DEFAULT_COLOR;
  if (HEX_COLOR.test(colorName)) return colorName;
  return colorMap[colorName] || DEFAULT_COLOR;
}

export function withAlpha(color: string, alpha: string): string {
  return `${getColor(color)}${alpha}`;
}

export const CONVERSATION_CATEGORIES: ConversationCategory[] = [
  'greetings',
  'needs',
  'health',
  'activities',
  'family',
  'places',
];

interface LocalizedConversationItem {
  icon: string;
  text: LocalizedText;
  category: ConversationCategory;
  color?: string;
}

const conversationBase: Record<ConversationCategory, LocalizedConversationItem[]> = {
  greetings: [
    { icon: '👍', text: localized('Sim', 'Yes', 'Sí'), category: 'greetings', color: getColor('green') },
    { icon: '👎', text: localized('Não', 'No', 'No'), category: 'greetings', color: getColor('red') },
    { icon: '👋', text: localized('Olá', 'Hello', 'Hola'), category: 'greetings', color: getColor('blue') },
    { icon: '🤔', text: localized('Não sei', "I don't know", 'No sé'), category: 'greetings', color: getColor('blueGrey') },
    { icon: '☀️', text: localized('Bom dia', 'Good morning', 'Buenos días'), category: 'greetings', color: getColor('orange') },
    { icon: '🌇', text: localized('Boa tarde', 'Good afternoon', 'Buenas tardes'), category: 'greetings', color: getColor('deepOrange') },
    { icon: '🌙', text: localized('Boa noite', 'Good night', 'Buenas noches'), category: 'greetings', color: getColor('indigo') },
    { icon: '🙏', text: localized('Obrigado', 'Thank you', 'Gracias'), category: 'greetings', color: getColor('teal') },
    { icon: '🤝', text: localized('Por favor', 'Please', 'Por favor'), category: 'greetings', color: getColor('purple') },
    { icon: '😔', text: localized('Desculpa', 'Sorry', 'Perdón'), category: 'greetings', color: getColor('brown') },
    { icon: '👋', text: localized('Tchau', 'Bye', 'Adiós'), category: 'greetings', color: getColor('blueAccent') },
    { icon: '😊', text: localized('Estou bem', "I'm fine", 'Estoy bien'), category: 'greetings', color: getColor('green') },
    { icon: '😢', text: localized('Eu estou triste', "I'm sad", 'Estoy triste'), category: 'greetings', color: '#0D47A1' },
    { icon: '😱', text: localized('Eu estou assustado', "I'm scared", 'Tengo miedo'), category: 'greetings', color: getColor('deepPurple') },
    { icon: '😰', text: localized('Eu estou nervoso', "I'm nervous", 'Estoy nervioso'), category: 'greetings', color: '#B71C1C' },
    { icon: '😴', text: localized('Eu estou com sono', "I'm sleepy", 'Tengo sueño'), category: 'greetings', color: '#1A237E' },
    { icon: '😃', text: localized('Eu estou feliz', "I'm happy", 'Estoy feliz'), category: 'greetings', color: getColor('amber') },
    { icon: '😡', text: localized('Eu estou bravo', "I'm angry", 'Estoy enojado'), category: 'greetings', color: getColor('red') },
    { icon: '😣', text: localized('Eu estou frustrado', "I'm frustrated", 'Estoy frustrado'), category: 'greetings', color: getColor('orangeAccent') },
    { icon: '🤗', text: localized('Eu preciso de um abraço', 'I need a hug', 'Necesito un abrazo'), category: 'greetings', color: getColor('pink') },
    { icon: '😖', text: localized('Eu estou sobrecarregado', "I'm overwhelmed", 'Estoy sobrecargado'), category: 'greetings', color: getColor('grey') },
    { icon: '😐', text: localized('Eu estou entediado', "I'm bored", 'Estoy aburrido'), category: 'greetings', color: getColor('blueGrey') },
    { icon: '😌', text: localized('Eu preciso de um tempo sozinho', 'I need some time alone', 'Necesito un tiempo a solas'), category: 'greetings', color: getColor('teal') },
    { icon: '😵', text: localized('Eu estou tonto', "I'm dizzy", 'Estoy mareado'), category: 'greetings', color: '#E040FB' },
  ],
  needs: [
    { icon: '🍎', text: localized('Eu quero uma fruta', 'I want a fruit', 'Quiero una fruta'), category: 'needs', color: getColor('redAccent') },
    { icon: '🥤', text: localized('Eu quero água', 'I want water', 'Quiero agua'), category: 'needs', color: getColor('blue') },
    { icon: '🍪', text: localized('Eu quero biscoito', 'I want a cookie', 'Quiero una galleta'), category: 'needs', color: getColor('brown') },
    { icon: '🍽️', text: localized('Eu estou com fome', "I'm hungry", 'Tengo hambre'), category: 'needs', color: getColor('orange') },
    { icon: '🥛', text: localized('Eu quero leite', 'I want milk', 'Quiero leche'), category: 'needs', color: getColor('grey') },
    { icon: '🚽', text: localized('Eu preciso ir ao banheiro', 'I need to go to the bathroom', 'Necesito ir al baño'), category: 'needs', color: getColor('cyan') },
    { icon: '🛏️', text: localized('Eu estou com sono', "I'm sleepy", 'Tengo sueño'), category: 'needs', color: getColor('indigo') },
    { icon: '🧼', text: localized('Eu quero tomar banho', 'I want to take a bath', 'Quiero bañarme'), category: 'needs', color: getColor('lightBlue') },
    { icon: '👕', text: localized('Eu quero trocar de roupa', 'I want to change clothes', 'Quiero cambiarme de ropa'), category: 'needs', color: getColor('green') },
    { icon: '🧥', text: localized('Eu estou com frio', "I'm cold", 'Tengo frío'), category: 'needs', color: getColor('blueGrey') },
    { icon: '🎽', text: localized('Eu estou com calor', "I'm hot", 'Tengo calor'), category: 'needs', color: getColor('orangeAccent') },
    { icon: '🧢', text: localized('Eu quero meu chapéu', 'I want my hat', 'Quiero mi sombrero'), category: 'needs', color: getColor('amber') },
    { icon: '👟', text: localized('Eu quero meus sapatos', 'I want my shoes', 'Quiero mis zapatos'), category: 'needs', color: getColor('blue') },
    { icon: '🧸', text: localized('Eu quero meu brinquedo', 'I want my toy', 'Quiero mi juguete'), category: 'needs', color: getColor('pink') },
    { icon: '🎒', text: localized('Eu quero minha mochila', 'I want my backpack', 'Quiero mi mochila'), category: 'needs', color: getColor('purple') },
    { icon: '🧴', text: localized('Eu preciso de protetor solar', 'I need sunscreen', 'Necesito protector solar'), category: 'needs', color: getColor('yellow') },
    { icon: '💊', text: localized('Eu preciso de vitaminas', 'I need vitamins', 'Necesito vitaminas'), category: 'needs', color: getColor('green') },
    { icon: '👓', text: localized('Eu preciso dos meus óculos', 'I need my glasses', 'Necesito mis gafas'), category: 'needs', color: getColor('blue') },
    { icon: '🎧', text: localized('Eu quero meus fones', 'I want my headphones', 'Quiero mis auriculares'), category: 'needs', color: getColor('purple') },
    { icon: '📱', text: localized('Eu quero meu celular', 'I want my phone', 'Quiero mi teléfono'), category: 'needs', color: getColor('black') },
    { icon: '🛁', text: localized('Eu quero banho de banheira', 'I want a bubble bath', 'Quiero un baño de tina'), category: 'needs', color: getColor('lightBlue') },
    { icon: '🧴', text: localized('Eu quero passar creme', 'I want to put on lotion', 'Quiero ponerme crema'), category: 'needs', color: getColor('pink') },
  ],
  health: [
    { icon: '💊', text: localized('Eu preciso de remédio', 'I need medicine', 'Necesito medicina'), category: 'health', color: getColor('red') },
    { icon: '🤕', text: localized('Eu estou com dor', "I'm in pain", 'Tengo dolor'), category: 'health', color: getColor('redAccent') },
    { icon: '🤒', text: localized('Eu estou doente', "I'm sick", 'Estoy enfermo'), category: 'health', color: getColor('green') },
    { icon: '🩹', text: localized('Eu preciso de curativo', 'I need a bandage', 'Necesito una curita'), category: 'health', color: getColor('orange') },
    { icon: '🌡️', text: localized('Eu estou com febre', 'I have a fever', 'Tengo fiebre'), category: 'health', color: getColor('red') },
    { icon: '🦷', text: localized('Eu estou com dor de dente', 'I have a toothache', 'Me duele un diente'), category: 'health', color: getColor('blue') },
    { icon: '🧠', text: localized('Eu estou com dor de cabeça', 'I have a headache', 'Me duele la cabeza'), category: 'health', color: getColor('purple') },
    { icon: '😷', text: localized('Eu estou com tosse', 'I have a cough', 'Tengo tos'), category: 'health', color: getColor('grey') },
    { icon: '🤧', text: localized('Eu estou com alergia', 'I have an allergy', 'Tengo alergia'), category: 'health', color: getColor('pink') },
    { icon: '🤮', text: localized('Eu estou enjoado', 'I feel nauseous', 'Tengo náuseas'), category: 'health', color: getColor('greenAccent') },
    { icon: '🩺', text: localized('Eu preciso de médico', 'I need a doctor', 'Necesito un médico'), category: 'health', color: getColor('blue') },
    { icon: '🚑', text: localized('Eu preciso de ambulância!', 'I need an ambulance!', '¡Necesito una ambulancia!'), category: 'health', color: getColor('red') },
    { icon: '💉', text: localized('Eu preciso de vacina', 'I need a vaccine', 'Necesito una vacuna'), category: 'health', color: getColor('teal') },
  ],
  activities: [
    { icon: '📚', text: localized('Eu quero ler um livro', 'I want to read a book', 'Quiero leer un libro'), category: 'activities', color: getColor('blue') },
    { icon: '🎮', text: localized('Eu quero brincar', 'I want to play', 'Quiero jugar'), category: 'activities', color: getColor('purple') },
    { icon: '🧸', text: localized('Eu quero meu brinquedo', 'I want my toy', 'Quiero mi juguete'), category: 'activities', color: getColor('pink') },
    { icon: '🎨', text: localized('Eu quero desenhar', 'I want to draw', 'Quiero dibujar'), category: 'activities', color: getColor('orange') },
    { icon: '🎵', text: localized('Eu quero ouvir música', 'I want to listen to music', 'Quiero escuchar música'), category: 'activities', color: getColor('deepPurple') },
    { icon: '📺', text: localized('Eu quero ver TV', 'I want to watch TV', 'Quiero ver la tele'), category: 'activities', color: '#212121' },
    { icon: '🎤', text: localized('Eu quero cantar', 'I want to sing', 'Quiero cantar'), category: 'activities', color: '#FF4081' },
    { icon: '🎬', text: localized('Eu quero ver um filme', 'I want to watch a movie', 'Quiero ver una película'), category: 'activities', color: getColor('red') },
    { icon: '🎲', text: localized('Eu quero jogar um jogo', 'I want to play a game', 'Quiero jugar un juego'), category: 'activities', color: getColor('green') },
    { icon: '🧩', text: localized('Eu quero montar um quebra-cabeça', 'I want to do a puzzle', 'Quiero hacer un rompecabezas'), category: 'activities', color: getColor('teal') },
    { icon: '🏃', text: localized('Eu quero correr', 'I want to run', 'Quiero correr'), category: 'activities', color: getColor('orangeAccent') },
    { icon: '🚴', text: localized('Eu quero andar de bicicleta', 'I want to ride a bike', 'Quiero andar en bicicleta'), category: 'activities', color: getColor('blueAccent') },
    { icon: '⚽', text: localized('Eu quero jogar futebol', 'I want to play soccer', 'Quiero jugar al fútbol'), category: 'activities', color: getColor('green') },
    { icon: '🏀', text: localized('Eu quero jogar basquete', 'I want to play basketball', 'Quiero jugar al baloncesto'), category: 'activities', color: getColor('orange') },
    { icon: '🎳', text: localized('Eu quero jogar boliche', 'I want to go bowling', 'Quiero jugar a los bolos'), category: 'activities', color: getColor('blueGrey') },
    { icon: '🏊', text: localized('Eu quero nadar', 'I want to swim', 'Quiero nadar'), category: 'activities', color: getColor('cyan') },
    { icon: '🧘', text: localized('Eu quero fazer ioga', 'I want to do yoga', 'Quiero hacer yoga'), category: 'activities', color: getColor('purple') },
    { icon: '🎹', text: localized('Eu quero tocar piano', 'I want to play the piano', 'Quiero tocar el piano'), category: 'activities', color: getColor('black') },
    { icon: '🎸', text: localized('Eu quero tocar violão', 'I want to play the guitar', 'Quiero tocar la guitarra'), category: 'activities', color: getColor('brown') },
    { icon: '🎯', text: localized('Eu quero jogar dardo', 'I want to play darts', 'Quiero jugar a los dardos'), category: 'activities', color: getColor('red') },
  ],
  family: [
    { icon: '👩', text: localized('minha mamãe', 'my mommy', 'mi mamá'), category: 'family', color: getColor('pink') },
    { icon: '👨', text: localized('meu papai', 'my daddy', 'mi papá'), category: 'family', color: getColor('blue') },
    { icon: '👨‍🏫', text: localized('meu professor', 'my teacher', 'mi profesor'), category: 'family', color: getColor('green') },
    { icon: '🧑‍🤝‍🧑', text: localized('meu amigo', 'my friend', 'mi amigo'), category: 'family', color: getColor('orange') },
    { icon: '📞', text: localized('Chama minha mãe!', 'Call my mom!', '¡Llama a mi mamá!'), category: 'family', color: getColor('red') },
    { icon: '📞', text: localized('Chama meu pai!', 'Call my dad!', '¡Llama a mi papá!'), category: 'family', color: getColor('redAccent') },
    { icon: '👵', text: localized('minha avó', 'my grandma', 'mi abuela'), category: 'family', color: getColor('purple') },
    { icon: '👴', text: localized('meu avô', 'my grandpa', 'mi abuelo'), category: 'family', color: getColor('grey') },
    { icon: '👶', text: localized('meu irmãozinho', 'my little brother', 'mi hermanito'), category: 'family', color: getColor('lightBlue') },
    { icon: '👧', text: localized('minha irmãzinha', 'my little sister', 'mi hermanita'), category: 'family', color: '#FF4081' },
    { icon: '🧑‍🤝‍🧑', text: localized('meu primo(a)', 'my cousin', 'mi primo(a)'), category: 'family', color: getColor('teal') },
  ],
  places: [
    { icon: '🏠', text: localized('Casa', 'Home', 'Casa'), category: 'places', color: getColor('brown') },
    { icon: '🏫', text: localized('Escola', 'School', 'Escuela'), category: 'places', color: getColor('blue') },
    { icon: '🏥', text: localized('Hospital', 'Hospital', 'Hospital'), category: 'places', color: getColor('red') },
    { icon: '🛒', text: localized('Loja', 'Store', 'Tienda'), category: 'places', color: getColor('orange') },
    { icon: '🌳', text: localized('Parque', 'Park', 'Parque'), category: 'places', color: getColor('green') },
    { icon: '🏖️', text: localized('Praia', 'Beach', 'Playa'), category: 'places', color: getColor('cyan') },
    { icon: '🏰', text: localized('Parque de diversões', 'Amusement park', 'Parque de atracciones'), category: 'places', color: getColor('purple') },
    { icon: '⛪', text: localized('Igreja', 'Church', 'Iglesia'), category: 'places', color: getColor('amber') },
    { icon: '🏢', text: localized('Escritório', 'Office', 'Oficina'), category: 'places', color: getColor('blueGrey') },
    { icon: '🍽️', text: localized('Restaurante', 'Restaurant', 'Restaurante'), category: 'places', color: getColor('deepOrange') },
    { icon: '✈️', text: localized('Aeroporto', 'Airport', 'Aeropuerto'), category: 'places', color: getColor('lightBlue') },
    { icon: '🚗', text: localized('Carro', 'Car', 'Coche'), category: 'places', color: getColor('grey') },
    { icon: '🚂', text: localized('Estação de trem', 'Train station', 'Estación de tren'), category: 'places', color: getColor('brown') },
    { icon: '🚌', text: localized('Rodoviária', 'Bus station', 'Estación de autobuses'), category: 'places', color: getColor('yellow') },
    { icon: '🏟️', text: localized('Estádio', 'Stadium', 'Estadio'), category: 'places', color: getColor('green') },
    { icon: '🎭', text: localized('Teatro', 'Theater', 'Teatro'), category: 'places', color: getColor('red') },
    { icon: '🎨', text: localized('Museu', 'Museum', 'Museo'), category: 'places', color: getColor('purple') },
    { icon: '📚', text: localized('Biblioteca', 'Library', 'Biblioteca'), category: 'places', color: getColor('blue') },
    { icon: '🐾', text: localized('Pet shop', 'Pet shop', 'Tienda de mascotas'), category: 'places', color: getColor('orange') },
    { icon: '💇', text: localized('Salão de beleza', 'Beauty salon', 'Salón de belleza'), category: 'places', color: getColor('pink') },
  ],
};

export function getConversationItems(
  category: ConversationCategory,
  locale: Locale = DEFAULT_LOCALE
): ConversationItem[] {
  return (conversationBase[category] ?? []).map((item) => ({
    id: `${item.category}:${slugify(item.text[DEFAULT_LOCALE])}`,
    icon: item.icon,
    text: localize(item.text, locale),
    category: item.category,
    color: item.color,
  }));
}

export function getAllConversationCategories(
  locale: Locale = DEFAULT_LOCALE
): { id: ConversationCategory; name: string; icon: string; color: string }[] {
  const names: Record<ConversationCategory, LocalizedText> = {
    greetings: localized('Saudações', 'Greetings', 'Saludos'),
    needs: localized('Necessidades', 'Needs', 'Necesidades'),
    health: localized('Saúde', 'Health', 'Salud'),
    activities: localized('Atividades', 'Activities', 'Actividades'),
    family: localized('Família', 'Family', 'Familia'),
    places: localized('Locais', 'Places', 'Lugares'),
  };

  return [
    { id: 'greetings', name: localize(names.greetings, locale), icon: '👋', color: '#4D94FF' },
    { id: 'needs', name: localize(names.needs, locale), icon: '🍎', color: '#FF6B35' },
    { id: 'health', name: localize(names.health, locale), icon: '❤️', color: '#FF1744' },
    { id: 'activities', name: localize(names.activities, locale), icon: '⚽', color: '#00C853' },
    { id: 'family', name: localize(names.family, locale), icon: '👨‍👩‍👧', color: '#B24BF3' },
    { id: 'places', name: localize(names.places, locale), icon: '🏠', color: '#00BCD4' },
  ];
}

// Compatibilidade temporária até a Task 8; sempre em pt-BR para os IDs atuais.
export const conversationData: Record<ConversationCategory, ConversationItem[]> = {
  greetings: getConversationItems('greetings'),
  needs: getConversationItems('needs'),
  health: getConversationItems('health'),
  activities: getConversationItems('activities'),
  family: getConversationItems('family'),
  places: getConversationItems('places'),
};
```

- [ ] **Step 5: Atualizar o import de `slugify` na comunicação**

Em `src/data/communication.ts`, troque a definição local de `slugify` por:

```ts
import { slugify } from '../utils/slug';
```

Mantenha `slugify` reexportado apenas se algum teste ainda importar:

```ts
export { slugify } from '../utils/slug';
```

Nesta task, `communication.ts` ainda pode usar `getConversationEntryId` com o texto em português; a refatoração completa vem na Task 8.

- [ ] **Step 6: Rodar testes e typecheck**

Run: `npx vitest run src/data/conversation.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/types/models.ts src/data/conversation.ts src/data/conversation.test.ts src/data/communication.ts
git commit -m "Localiza conteúdo de conversa com IDs estáveis"
```

---

### Task 5: Frases rápidas, vocabulário e alfabeto localizados

**Files:**
- Modify: `src/data/quickPhrases.ts`
- Modify: `src/data/coreVocabulary.ts`
- Modify: `src/data/alphabet.ts`
- Create: `src/data/quickPhrases.test.ts`
- Create: `src/data/coreVocabulary.test.ts`
- Create: `src/data/alphabet.test.ts`

**Interfaces:**
- Produces:
  - `getQuickPhrases(locale?)`
  - `getCoreVocabulary(locale?)`
  - `getAlphabetItems(locale?)`
  - `getAlphabetByLetter(letter, locale?)`

- [ ] **Step 1: Escrever os testes**

Crie `src/data/quickPhrases.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getQuickPhrases } from './quickPhrases';

describe('localized quick phrases', () => {
  it('keeps ids stable and translates text', () => {
    const help = getQuickPhrases('pt-BR').find((phrase) => phrase.id === 'quick:help');
    const english = getQuickPhrases('en-US').find((phrase) => phrase.id === 'quick:help');
    const spanish = getQuickPhrases('es-ES').find((phrase) => phrase.id === 'quick:help');

    expect(help?.text).toBe('Preciso de ajuda');
    expect(english?.text).toBe('I need help');
    expect(spanish?.text).toBe('Necesito ayuda');
  });
});
```

Crie `src/data/coreVocabulary.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getCoreVocabulary } from './coreVocabulary';

describe('localized core vocabulary', () => {
  it('translates labels while keeping ids', () => {
    const water = getCoreVocabulary('en-US').find((word) => word.id === 'agua');
    const agua = getCoreVocabulary('es-ES').find((word) => word.id === 'agua');

    expect(water?.label).toBe('water');
    expect(agua?.label).toBe('agua');
    expect(getCoreVocabulary('pt-BR')).toHaveLength(26);
  });
});
```

Crie `src/data/alphabet.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAlphabetByLetter, getAlphabetItems } from './alphabet';

describe('localized alphabet', () => {
  it('translates words and keeps letters', () => {
    const airplane = getAlphabetByLetter('a', 'en-US');

    expect(airplane?.letter).toBe('A');
    expect(airplane?.word).toBe('Airplane');
    expect(getAlphabetItems('es-ES')).toHaveLength(26);
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `npx vitest run src/data/quickPhrases.test.ts src/data/coreVocabulary.test.ts src/data/alphabet.test.ts`
Expected: FAIL porque os getters ainda não aceitam locale.

- [ ] **Step 3: Reescrever `src/data/quickPhrases.ts`**

```ts
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

export interface QuickPhrase {
  id: string;
  icon: string;
  text: string;
  color: string;
}

interface LocalizedQuickPhrase {
  id: string;
  icon: string;
  text: LocalizedText;
  color: string;
}

const quickPhraseBase: LocalizedQuickPhrase[] = [
  { id: 'quick:help', icon: '🆘', text: localized('Preciso de ajuda', 'I need help', 'Necesito ayuda'), color: '#FF1744' },
  { id: 'quick:stop', icon: '✋', text: localized('Quero parar', 'I want to stop', 'Quiero parar'), color: '#FF6B35' },
  { id: 'quick:pain', icon: '🤕', text: localized('Estou com dor', "I'm in pain", 'Tengo dolor'), color: '#E91E63' },
  { id: 'quick:hug', icon: '🤗', text: localized('Preciso de um abraço', 'I need a hug', 'Necesito un abrazo'), color: '#B24BF3' },
  { id: 'quick:overwhelmed', icon: '😖', text: localized('Estou sobrecarregado', "I'm overwhelmed", 'Estoy sobrecargado'), color: '#FF9100' },
  { id: 'quick:quiet', icon: '😌', text: localized('Preciso de um tempo sozinho', 'I need some time alone', 'Necesito un tiempo a solas'), color: '#00BCD4' },
  { id: 'quick:mother', icon: '👩', text: localized('Chama minha mãe', 'Call my mom', 'Llama a mi mamá'), color: '#4D94FF' },
  { id: 'quick:father', icon: '👨', text: localized('Chama meu pai', 'Call my dad', 'Llama a mi papá'), color: '#00C853' },
];

export function getQuickPhrases(locale: Locale = DEFAULT_LOCALE): QuickPhrase[] {
  return quickPhraseBase.map((phrase) => ({
    ...phrase,
    text: localize(phrase.text, locale),
  }));
}

// Compatibilidade temporária até a Task 12.
export const quickPhrases = getQuickPhrases();
```

- [ ] **Step 4: Reescrever `src/data/coreVocabulary.ts`**

```ts
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

export interface CoreWord {
  id: string;
  label: string;
  icon: string;
}

interface LocalizedCoreWord {
  id: string;
  label: LocalizedText;
  icon: string;
}

const coreVocabularyBase: LocalizedCoreWord[] = [
  { id: 'eu', label: localized('Eu', 'I', 'Yo'), icon: '🙋' },
  { id: 'quero', label: localized('quero', 'want', 'quiero'), icon: '✋' },
  { id: 'nao-quero', label: localized('não quero', "don't want", 'no quiero'), icon: '🙅' },
  { id: 'preciso', label: localized('preciso', 'need', 'necesito'), icon: '❗' },
  { id: 'ir', label: localized('ir', 'go', 'ir'), icon: '🚶' },
  { id: 'comer', label: localized('comer', 'eat', 'comer'), icon: '🍽️' },
  { id: 'beber', label: localized('beber', 'drink', 'beber'), icon: '🥤' },
  { id: 'brincar', label: localized('brincar', 'play', 'jugar'), icon: '🧸' },
  { id: 'ajuda', label: localized('ajuda', 'help', 'ayuda'), icon: '🆘' },
  { id: 'mais', label: localized('mais', 'more', 'más'), icon: '➕' },
  { id: 'parar', label: localized('parar', 'stop', 'parar'), icon: '✋' },
  { id: 'gosto', label: localized('gosto', 'like', 'me gusta'), icon: '👍' },
  { id: 'nao-gosto', label: localized('não gosto', "don't like", 'no me gusta'), icon: '👎' },
  { id: 'banheiro', label: localized('banheiro', 'bathroom', 'baño'), icon: '🚽' },
  { id: 'agua', label: localized('água', 'water', 'agua'), icon: '💧' },
  { id: 'comida', label: localized('comida', 'food', 'comida'), icon: '🍎' },
  { id: 'casa', label: localized('casa', 'home', 'casa'), icon: '🏠' },
  { id: 'escola', label: localized('escola', 'school', 'escuela'), icon: '🏫' },
  { id: 'mamae', label: localized('mamãe', 'mommy', 'mamá'), icon: '👩' },
  { id: 'papai', label: localized('papai', 'daddy', 'papá'), icon: '👨' },
  { id: 'por-favor', label: localized('por favor', 'please', 'por favor'), icon: '🙏' },
  { id: 'obrigado', label: localized('obrigado', 'thank you', 'gracias'), icon: '🤝' },
  { id: 'agora', label: localized('agora', 'now', 'ahora'), icon: '⏰' },
  { id: 'depois', label: localized('depois', 'later', 'después'), icon: '⏳' },
  { id: 'muito', label: localized('muito', 'very', 'mucho'), icon: '⭐' },
  { id: 'pouco', label: localized('pouco', 'little', 'poco'), icon: '🔹' },
];

export function getCoreVocabulary(locale: Locale = DEFAULT_LOCALE): CoreWord[] {
  return coreVocabularyBase.map((word) => ({
    ...word,
    label: localize(word.label, locale),
  }));
}

// Compatibilidade temporária até a Task 12.
export const coreVocabulary = getCoreVocabulary();
```

- [ ] **Step 5: Reescrever `src/data/alphabet.ts`**

```ts
import type { AlphabetItem } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

interface LocalizedAlphabetItem {
  letter: string;
  word: LocalizedText;
  icon: string;
}

const alphabetBase: LocalizedAlphabetItem[] = [
  { letter: 'A', word: localized('Avião', 'Airplane', 'Avión'), icon: '✈️' },
  { letter: 'B', word: localized('Bola', 'Ball', 'Pelota'), icon: '⚽' },
  { letter: 'C', word: localized('Casa', 'House', 'Casa'), icon: '🏠' },
  { letter: 'D', word: localized('Dado', 'Dice', 'Dado'), icon: '🎲' },
  { letter: 'E', word: localized('Estrela', 'Star', 'Estrella'), icon: '⭐' },
  { letter: 'F', word: localized('Flor', 'Flower', 'Flor'), icon: '🌸' },
  { letter: 'G', word: localized('Gato', 'Cat', 'Gato'), icon: '🐱' },
  { letter: 'H', word: localized('Helicóptero', 'Helicopter', 'Helicóptero'), icon: '🚁' },
  { letter: 'I', word: localized('Igreja', 'Church', 'Iglesia'), icon: '⛪' },
  { letter: 'J', word: localized('Janela', 'Window', 'Ventana'), icon: '🪟' },
  { letter: 'K', word: localized('Kiwi', 'Kiwi', 'Kiwi'), icon: '🥝' },
  { letter: 'L', word: localized('Leão', 'Lion', 'León'), icon: '🦁' },
  { letter: 'M', word: localized('Maçã', 'Apple', 'Manzana'), icon: '🍎' },
  { letter: 'N', word: localized('Navio', 'Ship', 'Barco'), icon: '🚢' },
  { letter: 'O', word: localized('Ovo', 'Egg', 'Huevo'), icon: '🥚' },
  { letter: 'P', word: localized('Pato', 'Duck', 'Pato'), icon: '🦆' },
  { letter: 'Q', word: localized('Queijo', 'Cheese', 'Queso'), icon: '🧀' },
  { letter: 'R', word: localized('Rato', 'Mouse', 'Ratón'), icon: '🐭' },
  { letter: 'S', word: localized('Sol', 'Sun', 'Sol'), icon: '☀️' },
  { letter: 'T', word: localized('Trem', 'Train', 'Tren'), icon: '🚂' },
  { letter: 'U', word: localized('Uva', 'Grape', 'Uva'), icon: '🍇' },
  { letter: 'V', word: localized('Vaca', 'Cow', 'Vaca'), icon: '🐮' },
  { letter: 'W', word: localized('Waffle', 'Waffle', 'Waffle'), icon: '🧇' },
  { letter: 'X', word: localized('Xícara', 'Cup', 'Taza'), icon: '☕' },
  { letter: 'Y', word: localized('Yoga', 'Yoga', 'Yoga'), icon: '🧘' },
  { letter: 'Z', word: localized('Zebra', 'Zebra', 'Cebra'), icon: '🦓' },
];

export function getAlphabetItems(locale: Locale = DEFAULT_LOCALE): AlphabetItem[] {
  return alphabetBase.map((item) => ({
    letter: item.letter,
    word: localize(item.word, locale),
    icon: item.icon,
  }));
}

export function getAlphabetByLetter(
  letter: string,
  locale: Locale = DEFAULT_LOCALE
): AlphabetItem | undefined {
  return getAlphabetItems(locale).find(
    (item) => item.letter === letter.toUpperCase()
  );
}

// Compatibilidade temporária até a Task 12.
export const alphabetData = getAlphabetItems();
```

- [ ] **Step 6: Rodar testes e typecheck**

Run: `npx vitest run src/data/quickPhrases.test.ts src/data/coreVocabulary.test.ts src/data/alphabet.test.ts && npm run typecheck`
Expected: PASS. As views continuam usando os exports de compatibilidade em pt-BR até a Task 12.

- [ ] **Step 7: Commit**

```bash
git add src/data/quickPhrases.ts src/data/coreVocabulary.ts src/data/alphabet.ts src/data/quickPhrases.test.ts src/data/coreVocabulary.test.ts src/data/alphabet.test.ts
git commit -m "Localiza frases rápidas, vocabulário e alfabeto"
```

---

### Task 6: Rotinas localizadas

**Files:**
- Modify: `src/data/routines.ts`
- Modify: `src/data/routines.test.ts`

**Interfaces:**
- Produces:
  - `getRoutineItems(period, locale?)`
  - `getRoutinePeriodLength(period)`
  - `getAllRoutineItems(locale?)`
  - `getPeriodName(period, locale?)`
  - IDs `routine:<period>:<index>`

- [ ] **Step 1: Reescrever os testes**

Substitua `src/data/routines.test.ts` por:

```ts
import { describe, expect, it } from 'vitest';
import {
  createEmptyRoutineProgress,
  getAllRoutineItems,
  getPeriodName,
  getRoutineItems,
  getRoutinePeriodLength,
} from './routines';

describe('getRoutinePeriodLength', () => {
  it('derives the length from the routine data', () => {
    expect(getRoutinePeriodLength('morning')).toBe(8);
    expect(getRoutinePeriodLength('afternoon')).toBe(8);
    expect(getRoutinePeriodLength('night')).toBe(7);
  });

  it('returns zero for an unknown period', () => {
    expect(getRoutinePeriodLength('unknown')).toBe(0);
  });
});

describe('getRoutineItems', () => {
  it('returns an empty list for an unknown period', () => {
    expect(getRoutineItems('unknown')).toEqual([]);
  });

  it('keeps ids stable while translating text', () => {
    const pt = getRoutineItems('morning', 'pt-BR')[0];
    const en = getRoutineItems('morning', 'en-US')[0];
    const es = getRoutineItems('morning', 'es-ES')[0];

    expect(pt.id).toBe('routine:morning:0');
    expect(pt.text).toBe('Acordar');
    expect(en.text).toBe('Wake up');
    expect(es.text).toBe('Despertar');
  });
});

describe('getAllRoutineItems', () => {
  it('returns every localized item', () => {
    expect(getAllRoutineItems('en-US')).toHaveLength(23);
  });
});

describe('getPeriodName', () => {
  it('localizes known periods and preserves unknown values', () => {
    expect(getPeriodName('morning', 'en-US')).toBe('Morning');
    expect(getPeriodName('night', 'es-ES')).toBe('Noche');
    expect(getPeriodName('unknown', 'en-US')).toBe('unknown');
  });
});

describe('createEmptyRoutineProgress', () => {
  it('does not mark an empty routine as completed', () => {
    const progress = createEmptyRoutineProgress('unknown');

    expect(progress.totalCount).toBe(0);
    expect(progress.progress).toBe(0);
    expect(progress.isCompleted).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npx vitest run src/data/routines.test.ts`
Expected: FAIL porque o conteúdo ainda não é localizado.

- [ ] **Step 3: Reescrever `src/data/routines.ts`**

```ts
import type { RoutineItem, RoutineProgress, RoutinePeriod } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';

interface LocalizedRoutineItem {
  icon: string;
  text: LocalizedText;
  period: RoutinePeriod;
  index: number;
}

const routineBase: Record<RoutinePeriod, LocalizedRoutineItem[]> = {
  morning: [
    { icon: '⏰', text: localized('Acordar', 'Wake up', 'Despertar'), period: 'morning', index: 0 },
    { icon: '🛏️', text: localized('Fazer cama', 'Make the bed', 'Hacer la cama'), period: 'morning', index: 1 },
    { icon: '🪥', text: localized('Escovar os dentes', 'Brush your teeth', 'Cepillarse los dientes'), period: 'morning', index: 2 },
    { icon: '💧', text: localized('Lavar rosto', 'Wash your face', 'Lavarse la cara'), period: 'morning', index: 3 },
    { icon: '☕', text: localized('Tomar café', 'Have breakfast', 'Desayunar'), period: 'morning', index: 4 },
    { icon: '👕', text: localized('Vestir', 'Get dressed', 'Vestirse'), period: 'morning', index: 5 },
    { icon: '🎒', text: localized('Arrumar mochila', 'Pack your backpack', 'Preparar la mochila'), period: 'morning', index: 6 },
    { icon: '🏫', text: localized('Escola', 'School', 'Escuela'), period: 'morning', index: 7 },
  ],
  afternoon: [
    { icon: '🍲', text: localized('Almoço', 'Lunch', 'Almuerzo'), period: 'afternoon', index: 0 },
    { icon: '😴', text: localized('Descanso', 'Rest', 'Descanso'), period: 'afternoon', index: 1 },
    { icon: '⚽', text: localized('Brincar', 'Play', 'Jugar'), period: 'afternoon', index: 2 },
    { icon: '🍎', text: localized('Lanche', 'Snack', 'Merienda'), period: 'afternoon', index: 3 },
    { icon: '📝', text: localized('Tarefa', 'Homework', 'Tarea'), period: 'afternoon', index: 4 },
    { icon: '📚', text: localized('Estudar', 'Study', 'Estudiar'), period: 'afternoon', index: 5 },
    { icon: '🎨', text: localized('Atividades extra', 'Extracurricular activities', 'Actividades extra'), period: 'afternoon', index: 6 },
    { icon: '🏞️', text: localized('Passear', 'Go for a walk', 'Pasear'), period: 'afternoon', index: 7 },
  ],
  night: [
    { icon: '🍽️', text: localized('Jantar', 'Dinner', 'Cena'), period: 'night', index: 0 },
    { icon: '🧸', text: localized('Arrumar brinquedos', 'Tidy up toys', 'Ordenar los juguetes'), period: 'night', index: 1 },
    { icon: '🚿', text: localized('Banho', 'Bath', 'Baño'), period: 'night', index: 2 },
    { icon: '👚', text: localized('Pijama', 'Pajamas', 'Pijama'), period: 'night', index: 3 },
    { icon: '🪥', text: localized('Escovar os dentes', 'Brush your teeth', 'Cepillarse los dientes'), period: 'night', index: 4 },
    { icon: '📖', text: localized('Ler história', 'Read a story', 'Leer un cuento'), period: 'night', index: 5 },
    { icon: '🌙', text: localized('Dormir', 'Sleep', 'Dormir'), period: 'night', index: 6 },
  ],
};

const periodNames: Record<RoutinePeriod, LocalizedText> = {
  morning: localized('Manhã', 'Morning', 'Mañana'),
  afternoon: localized('Tarde', 'Afternoon', 'Tarde'),
  night: localized('Noite', 'Night', 'Noche'),
};

export function getRoutineItems(
  period: string,
  locale: Locale = DEFAULT_LOCALE
): RoutineItem[] {
  const items = routineBase[period as RoutinePeriod] ?? [];

  return items.map((item) => ({
    id: `routine:${item.period}:${item.index}`,
    icon: item.icon,
    text: localize(item.text, locale),
    period: item.period,
    index: item.index,
  }));
}

export function getRoutinePeriodLength(period: string): number {
  return (routineBase[period as RoutinePeriod] ?? []).length;
}

export function getAllRoutineItems(locale: Locale = DEFAULT_LOCALE): RoutineItem[] {
  return (['morning', 'afternoon', 'night'] as RoutinePeriod[]).flatMap((period) =>
    getRoutineItems(period, locale)
  );
}

export function createEmptyRoutineProgress(period: string): RoutineProgress {
  const completedItems = Array(getRoutinePeriodLength(period)).fill(false);
  return createRoutineProgressFromStorage(period, completedItems);
}

export function createRoutineProgressFromStorage(
  period: string,
  completedItems: boolean[]
): RoutineProgress {
  const completedCount = completedItems.filter((item) => item).length;
  const totalCount = completedItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    period,
    completedCount,
    totalCount,
    completedItems,
    progress,
    progressText: `${Math.round(progress)}%`,
    isCompleted: totalCount > 0 && completedCount === totalCount,
  };
}

export function getPeriodName(
  period: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  const label = periodNames[period as RoutinePeriod];
  return label ? localize(label, locale) : period;
}

export { createRoutineProgressFromStorage as getRoutineProgressData };
```

- [ ] **Step 4: Rodar testes e typecheck**

Run: `npx vitest run src/data/routines.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/routines.ts src/data/routines.test.ts
git commit -m "Localiza rotinas mantendo progresso por índice"
```

---

### Task 7: Conteúdo interativo localizado

**Files:**
- Modify: `src/types/models.ts`
- Modify: `src/data/interactive.ts`
- Create: `src/data/interactive.test.ts`

**Interfaces:**
- Produces:
  - `InteractiveItem.id`
  - `getInteractiveItems(category, locale?)`
  - `getAllInteractiveCategories(locale?)`
  - IDs `interactive:<category>:<slugify(ptName)>`

- [ ] **Step 1: Adicionar `id` ao modelo**

Em `src/types/models.ts`, altere:

```ts
export interface InteractiveItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  color?: string;
  type?: string;
}
```

- [ ] **Step 2: Criar o teste**

Crie `src/data/interactive.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAllInteractiveCategories, getInteractiveItems } from './interactive';

describe('localized interactive content', () => {
  it('keeps ids stable across locales', () => {
    const pt = getInteractiveItems('shapes', 'pt-BR').find((item) => item.name === 'Círculo');
    const en = getInteractiveItems('shapes', 'en-US').find((item) => item.id === pt?.id);
    const es = getInteractiveItems('shapes', 'es-ES').find((item) => item.id === pt?.id);

    expect(pt?.id).toBe('interactive:shapes:circulo');
    expect(en?.name).toBe('Circle');
    expect(es?.name).toBe('Círculo');
  });

  it('localizes item types and category names', () => {
    const dog = getInteractiveItems('animals', 'en-US').find((item) => item.id === 'interactive:animals:cachorro');
    const foods = getAllInteractiveCategories('es-ES');

    expect(dog?.type).toBe('Domestic');
    expect(foods.find((category) => category.id === 'foods')?.name).toBe('Alimentos');
  });

  it('returns an empty list for an unknown category', () => {
    expect(getInteractiveItems('unknown' as never)).toEqual([]);
  });
});
```

- [ ] **Step 3: Rodar o teste para confirmar a falha**

Run: `npx vitest run src/data/interactive.test.ts`
Expected: FAIL porque o conteúdo ainda não é localizado.

- [ ] **Step 4: Reescrever `src/data/interactive.ts`**

```ts
import type { InteractiveCategory, InteractiveItem } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';
import { slugify } from '../utils/slug';

interface LocalizedInteractiveItem {
  name: LocalizedText;
  icon: string;
  category: InteractiveCategory;
  color?: string;
  type?: LocalizedText;
}

const interactiveBase: Record<InteractiveCategory, LocalizedInteractiveItem[]> = {
  shapes: [
    { name: localized('Círculo', 'Circle', 'Círculo'), icon: '●', category: 'shapes', color: '#FF5252' },
    { name: localized('Quadrado', 'Square', 'Cuadrado'), icon: '■', category: 'shapes', color: '#4DFF88' },
    { name: localized('Triângulo', 'Triangle', 'Triángulo'), icon: '▲', category: 'shapes', color: '#4D94FF' },
    { name: localized('Retângulo', 'Rectangle', 'Rectángulo'), icon: '▬', category: 'shapes', color: '#FF4DFF' },
    { name: localized('Estrela', 'Star', 'Estrella'), icon: '★', category: 'shapes', color: '#FFD700' },
    { name: localized('Coração', 'Heart', 'Corazón'), icon: '❤', category: 'shapes', color: '#FF3333' },
    { name: localized('Losango', 'Diamond', 'Rombo'), icon: '◆', category: 'shapes', color: '#FFD700' },
    { name: localized('Hexágono', 'Hexagon', 'Hexágono'), icon: '⬡', category: 'shapes', color: '#00E5E5' },
    { name: localized('Pentágono', 'Pentagon', 'Pentágono'), icon: '⬟', category: 'shapes', color: '#FF7A59' },
    { name: localized('Oval', 'Oval', 'Óvalo'), icon: '⬭', category: 'shapes', color: '#9370DB' },
    { name: localized('Cruz', 'Cross', 'Cruz'), icon: '✚', category: 'shapes', color: '#4DFF88' },
    { name: localized('Seta', 'Arrow', 'Flecha'), icon: '➤', category: 'shapes', color: '#FF7A59' },
    { name: localized('Meia lua', 'Crescent moon', 'Media luna'), icon: '🌙', category: 'shapes', color: '#FFD700' },
    { name: localized('Octógono', 'Octagon', 'Octógono'), icon: '⬢', category: 'shapes', color: '#FF6B6B' },
    { name: localized('Trapézio', 'Trapezoid', 'Trapecio'), icon: '⬠', category: 'shapes', color: '#9B59B6' },
    { name: localized('Paralelogramo', 'Parallelogram', 'Paralelogramo'), icon: '▱', category: 'shapes', color: '#3498DB' },
  ],
  colors: [
    { name: localized('Vermelho', 'Red', 'Rojo'), icon: '🔴', category: 'colors', color: '#FF0000' },
    { name: localized('Azul', 'Blue', 'Azul'), icon: '🔵', category: 'colors', color: '#0000FF' },
    { name: localized('Verde', 'Green', 'Verde'), icon: '🟢', category: 'colors', color: '#00FF00' },
    { name: localized('Amarelo', 'Yellow', 'Amarillo'), icon: '🟡', category: 'colors', color: '#FFFF00' },
    { name: localized('Roxo', 'Purple', 'Morado'), icon: '🟣', category: 'colors', color: '#800080' },
    { name: localized('Laranja', 'Orange', 'Naranja'), icon: '🟠', category: 'colors', color: '#FFA500' },
    { name: localized('Rosa', 'Pink', 'Rosa'), icon: '🩷', category: 'colors', color: '#FFC0CB' },
    { name: localized('Marrom', 'Brown', 'Marrón'), icon: '🤎', category: 'colors', color: '#8B4513' },
    { name: localized('Preto', 'Black', 'Negro'), icon: '⚫', category: 'colors', color: '#000000' },
    { name: localized('Branco', 'White', 'Blanco'), icon: '⚪', category: 'colors', color: '#FFFFFF' },
    { name: localized('Cinza', 'Gray', 'Gris'), icon: '🔘', category: 'colors', color: '#808080' },
    { name: localized('Turquesa', 'Turquoise', 'Turquesa'), icon: '🩵', category: 'colors', color: '#40E0D0' },
    { name: localized('Azul escuro', 'Dark blue', 'Azul oscuro'), icon: '💙', category: 'colors', color: '#00008B' },
    { name: localized('Verde escuro', 'Dark green', 'Verde oscuro'), icon: '💚', category: 'colors', color: '#006400' },
    { name: localized('Lilás', 'Lilac', 'Lila'), icon: '🟪', category: 'colors', color: '#C8A2C8' },
    { name: localized('Bege', 'Beige', 'Beige'), icon: '🟫', category: 'colors', color: '#F5F5DC' },
    { name: localized('Dourado', 'Gold', 'Dorado'), icon: '🟨', category: 'colors', color: '#FFD700' },
    { name: localized('Prata', 'Silver', 'Plateado'), icon: '⬜', category: 'colors', color: '#C0C0C0' },
  ],
  animals: [
    { name: localized('Cachorro', 'Dog', 'Perro'), icon: '🐕', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Gato', 'Cat', 'Gato'), icon: '🐱', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Vaca', 'Cow', 'Vaca'), icon: '🐮', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Cavalo', 'Horse', 'Caballo'), icon: '🐴', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Porco', 'Pig', 'Cerdo'), icon: '🐷', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Galinha', 'Chicken', 'Gallina'), icon: '🐔', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Pato', 'Duck', 'Pato'), icon: '🦆', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Coelho', 'Rabbit', 'Conejo'), icon: '🐰', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Ovelha', 'Sheep', 'Oveja'), icon: '🐑', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Cabra', 'Goat', 'Cabra'), icon: '🐐', category: 'animals', type: localized('Doméstico', 'Domestic', 'Doméstico') },
    { name: localized('Onça', 'Jaguar', 'Jaguar'), icon: '🐆', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Marreco', 'Mallard', 'Marreco'), icon: '🦤', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Papagaio', 'Parrot', 'Loro'), icon: '🦜', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Preguiça', 'Sloth', 'Perezoso'), icon: '🦥', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Castor', 'Beaver', 'Castor'), icon: '🦫', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Rinoceronte', 'Rhinoceros', 'Rinoceronte'), icon: '🦏', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Macaco', 'Monkey', 'Mono'), icon: '🐒', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Jabuti', 'Tortoise', 'Tortuga'), icon: '🐢', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Pintinho', 'Chick', 'Pollito'), icon: '🐤', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Passarinho', 'Little bird', 'Pajarito'), icon: '🐥', category: 'animals', type: localized('Fauna Brasileira', 'Brazilian wildlife', 'Fauna brasileña') },
    { name: localized('Leão', 'Lion', 'León'), icon: '🦁', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Tigre', 'Tiger', 'Tigre'), icon: '🐯', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Elefante', 'Elephant', 'Elefante'), icon: '🐘', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Girafa', 'Giraffe', 'Jirafa'), icon: '🦒', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Zebra', 'Zebra', 'Cebra'), icon: '🦓', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Panda', 'Panda', 'Panda'), icon: '🐼', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Koala', 'Koala', 'Koala'), icon: '🐨', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Pinguim', 'Penguin', 'Pingüino'), icon: '🐧', category: 'animals', type: localized('Selvagem', 'Wild', 'Salvaje') },
    { name: localized('Golfinho', 'Dolphin', 'Delfín'), icon: '🐬', category: 'animals', type: localized('Marinho', 'Marine', 'Marino') },
    { name: localized('Baleia', 'Whale', 'Ballena'), icon: '🐋', category: 'animals', type: localized('Marinho', 'Marine', 'Marino') },
    { name: localized('Tubarão', 'Shark', 'Tiburón'), icon: '🦈', category: 'animals', type: localized('Marinho', 'Marine', 'Marino') },
    { name: localized('Polvo', 'Octopus', 'Pulpo'), icon: '🐙', category: 'animals', type: localized('Marinho', 'Marine', 'Marino') },
    { name: localized('Peixe', 'Fish', 'Pez'), icon: '🐟', category: 'animals', type: localized('Marinho', 'Marine', 'Marino') },
  ],
  fruits: [
    { name: localized('Açaí', 'Açaí', 'Açaí'), icon: '🫐', category: 'fruits', color: '#4B0082' },
    { name: localized('Pera', 'Pear', 'Pera'), icon: '🍐', category: 'fruits', color: '#90EE90' },
    { name: localized('Laranja', 'Orange', 'Naranja'), icon: '🟠', category: 'fruits', color: '#FFD700' },
    { name: localized('Manga', 'Mango', 'Mango'), icon: '🥭', category: 'fruits', color: '#FFA500' },
    { name: localized('Mamão', 'Papaya', 'Papaya'), icon: '🍑', category: 'fruits', color: '#FFA07A' },
    { name: localized('Abacaxi', 'Pineapple', 'Piña'), icon: '🍍', category: 'fruits', color: '#FFD700' },
    { name: localized('Caju', 'Cashew', 'Anacardo'), icon: '🥜', category: 'fruits', color: '#8B4513' },
    { name: localized('Cupuaçu', 'Cupuaçu', 'Cupuaçu'), icon: '🫐', category: 'fruits', color: '#DDA0DD' },
    { name: localized('Coco', 'Coconut', 'Coco'), icon: '🥥', category: 'fruits', color: '#F0E68C' },
    { name: localized('Pitanga', 'Pitanga', 'Pitanga'), icon: '🍒', category: 'fruits', color: '#DC143C' },
    { name: localized('Jabuticaba', 'Jabuticaba', 'Jabuticaba'), icon: '🫐', category: 'fruits', color: '#8B008B' },
    { name: localized('Cacau', 'Cocoa', 'Cacao'), icon: '🫘', category: 'fruits', color: '#8B4513' },
    { name: localized('Pequi', 'Pequi', 'Pequi'), icon: '🟠', category: 'fruits', color: '#FFD700' },
    { name: localized('Buriti', 'Buriti', 'Buriti'), icon: '🫒', category: 'fruits', color: '#FFA500' },
    { name: localized('Maracujá', 'Passion fruit', 'Maracuyá'), icon: '🟠', category: 'fruits', color: '#F0E68C' },
    { name: localized('Morango', 'Strawberry', 'Fresa'), icon: '🍓', category: 'fruits', color: '#8B008B' },
  ],
  foods: [
    { name: localized('Arroz', 'Rice', 'Arroz'), icon: '🍚', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Feijão', 'Beans', 'Frijoles'), icon: '🫘', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Milho', 'Corn', 'Maíz'), icon: '🌽', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Trigo', 'Wheat', 'Trigo'), icon: '🌾', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Aveia', 'Oats', 'Avena'), icon: '🥣', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Macarrão', 'Pasta', 'Pasta'), icon: '🍝', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Pão', 'Bread', 'Pan'), icon: '🍞', category: 'foods', type: localized('Cereais', 'Cereals', 'Cereales') },
    { name: localized('Carne', 'Meat', 'Carne'), icon: '🍖', category: 'foods', type: localized('Proteínas', 'Proteins', 'Proteínas') },
    { name: localized('Frango', 'Chicken', 'Pollo'), icon: '🍗', category: 'foods', type: localized('Proteínas', 'Proteins', 'Proteínas') },
    { name: localized('Peixe', 'Fish', 'Pescado'), icon: '🐟', category: 'foods', type: localized('Proteínas', 'Proteins', 'Proteínas') },
    { name: localized('Ovo', 'Egg', 'Huevo'), icon: '🥚', category: 'foods', type: localized('Proteínas', 'Proteins', 'Proteínas') },
    { name: localized('Salsicha', 'Sausage', 'Salchicha'), icon: '🌭', category: 'foods', type: localized('Proteínas', 'Proteins', 'Proteínas') },
    { name: localized('Leite', 'Milk', 'Leche'), icon: '🥛', category: 'foods', type: localized('Laticínios', 'Dairy', 'Lácteos') },
    { name: localized('Queijo', 'Cheese', 'Queso'), icon: '🧀', category: 'foods', type: localized('Laticínios', 'Dairy', 'Lácteos') },
    { name: localized('Iogurte', 'Yogurt', 'Yogur'), icon: '🥛', category: 'foods', type: localized('Laticínios', 'Dairy', 'Lácteos') },
    { name: localized('Manteiga', 'Butter', 'Mantequilla'), icon: '🧈', category: 'foods', type: localized('Laticínios', 'Dairy', 'Lácteos') },
    { name: localized('Bolo', 'Cake', 'Pastel'), icon: '🍰', category: 'foods', type: localized('Doces', 'Sweets', 'Dulces') },
    { name: localized('Sorvete', 'Ice cream', 'Helado'), icon: '🍨', category: 'foods', type: localized('Doces', 'Sweets', 'Dulces') },
    { name: localized('Chocolate', 'Chocolate', 'Chocolate'), icon: '🍫', category: 'foods', type: localized('Doces', 'Sweets', 'Dulces') },
    { name: localized('Bala', 'Candy', 'Caramelo'), icon: '🍬', category: 'foods', type: localized('Doces', 'Sweets', 'Dulces') },
    { name: localized('Salada', 'Salad', 'Ensalada'), icon: '🥗', category: 'foods', type: localized('Vegetais', 'Vegetables', 'Verduras') },
    { name: localized('Sopa', 'Soup', 'Sopa'), icon: '🍲', category: 'foods', type: localized('Vegetais', 'Vegetables', 'Verduras') },
    { name: localized('Pizza', 'Pizza', 'Pizza'), icon: '🍕', category: 'foods', type: localized('Fast Food', 'Fast food', 'Comida rápida') },
    { name: localized('Hambúrguer', 'Hamburger', 'Hamburguesa'), icon: '🍔', category: 'foods', type: localized('Fastfood', 'Fast food', 'Comida rápida') },
    { name: localized('Batata frita', 'French fries', 'Papas fritas'), icon: '🍟', category: 'foods', type: localized('Fastfood', 'Fast food', 'Comida rápida') },
    { name: localized('Hotdog', 'Hot dog', 'Perrito caliente'), icon: '🌭', category: 'foods', type: localized('Fastfood', 'Fast food', 'Comida rápida') },
    { name: localized('Taco', 'Taco', 'Taco'), icon: '🌮', category: 'foods', type: localized('Fastfood', 'Fast food', 'Comida rápida') },
    { name: localized('Sanduíche', 'Sandwich', 'Sándwich'), icon: '🥪', category: 'foods', type: localized('Fastfood', 'Fast food', 'Comida rápida') },
    { name: localized('Suco', 'Juice', 'Jugo'), icon: '🧃', category: 'foods', type: localized('Bebidas', 'Drinks', 'Bebidas') },
    { name: localized('Café', 'Coffee', 'Café'), icon: '☕', category: 'foods', type: localized('Bebidas', 'Drinks', 'Bebidas') },
    { name: localized('Chá', 'Tea', 'Té'), icon: '🍵', category: 'foods', type: localized('Bebidas', 'Drinks', 'Bebidas') },
    { name: localized('Refrigerante', 'Soda', 'Refresco'), icon: '🥤', category: 'foods', type: localized('Bebidas', 'Drinks', 'Bebidas') },
    { name: localized('Água', 'Water', 'Agua'), icon: '💧', category: 'foods', type: localized('Bebidas', 'Drinks', 'Bebidas') },
  ],
  numbers: [
    { name: localized('0', '0', '0'), icon: '0️⃣', category: 'numbers' },
    { name: localized('1', '1', '1'), icon: '1️⃣', category: 'numbers' },
    { name: localized('2', '2', '2'), icon: '2️⃣', category: 'numbers' },
    { name: localized('3', '3', '3'), icon: '3️⃣', category: 'numbers' },
    { name: localized('4', '4', '4'), icon: '4️⃣', category: 'numbers' },
    { name: localized('5', '5', '5'), icon: '5️⃣', category: 'numbers' },
    { name: localized('6', '6', '6'), icon: '6️⃣', category: 'numbers' },
    { name: localized('7', '7', '7'), icon: '7️⃣', category: 'numbers' },
    { name: localized('8', '8', '8'), icon: '8️⃣', category: 'numbers' },
    { name: localized('9', '9', '9'), icon: '9️⃣', category: 'numbers' },
    { name: localized('10', '10', '10'), icon: '🔟', category: 'numbers' },
    { name: localized('11', '11', '11'), icon: '1️⃣1️⃣', category: 'numbers' },
    { name: localized('12', '12', '12'), icon: '1️⃣2️⃣', category: 'numbers' },
    { name: localized('13', '13', '13'), icon: '1️⃣3️⃣', category: 'numbers' },
    { name: localized('14', '14', '14'), icon: '1️⃣4️⃣', category: 'numbers' },
    { name: localized('15', '15', '15'), icon: '1️⃣5️⃣', category: 'numbers' },
    { name: localized('16', '16', '16'), icon: '1️⃣6️⃣', category: 'numbers' },
    { name: localized('17', '17', '17'), icon: '1️⃣7️⃣', category: 'numbers' },
    { name: localized('18', '18', '18'), icon: '1️⃣8️⃣', category: 'numbers' },
    { name: localized('19', '19', '19'), icon: '1️⃣9️⃣', category: 'numbers' },
    { name: localized('20', '20', '20'), icon: '2️⃣0️⃣', category: 'numbers' },
    { name: localized('30', '30', '30'), icon: '3️⃣0️⃣', category: 'numbers' },
    { name: localized('40', '40', '40'), icon: '4️⃣0️⃣', category: 'numbers' },
    { name: localized('50', '50', '50'), icon: '5️⃣0️⃣', category: 'numbers' },
    { name: localized('60', '60', '60'), icon: '6️⃣0️⃣', category: 'numbers' },
    { name: localized('70', '70', '70'), icon: '7️⃣0️⃣', category: 'numbers' },
    { name: localized('80', '80', '80'), icon: '8️⃣0️⃣', category: 'numbers' },
    { name: localized('90', '90', '90'), icon: '9️⃣0️⃣', category: 'numbers' },
    { name: localized('100', '100', '100'), icon: '💯', category: 'numbers' },
  ],
  vegetables: [
    { name: localized('Cenoura', 'Carrot', 'Zanahoria'), icon: '🥕', category: 'vegetables', color: '#FF8C00' },
    { name: localized('Alface', 'Lettuce', 'Lechuga'), icon: '🥬', category: 'vegetables', color: '#32CD32' },
    { name: localized('Tomate', 'Tomato', 'Tomate'), icon: '🍅', category: 'vegetables', color: '#FF6347' },
    { name: localized('Batata', 'Potato', 'Patata'), icon: '🥔', category: 'vegetables', color: '#DAA520' },
    { name: localized('Cebola', 'Onion', 'Cebolla'), icon: '🧅', category: 'vegetables', color: '#DDA0DD' },
    { name: localized('Alho', 'Garlic', 'Ajo'), icon: '🧄', category: 'vegetables', color: '#F5F5DC' },
    { name: localized('Brócolis', 'Broccoli', 'Brócoli'), icon: '🥦', category: 'vegetables', color: '#228B22' },
    { name: localized('Espinafre', 'Spinach', 'Espinaca'), icon: '🥬', category: 'vegetables', color: '#006400' },
    { name: localized('Pimentão', 'Bell pepper', 'Pimiento'), icon: '🫑', category: 'vegetables', color: '#FF0000' },
    { name: localized('Ervilha', 'Pea', 'Guisante'), icon: '🫛', category: 'vegetables', color: '#32CD32' },
    { name: localized('Milho', 'Corn', 'Maíz'), icon: '🌽', category: 'vegetables', color: '#FFD700' },
    { name: localized('Abóbora', 'Pumpkin', 'Calabaza'), icon: '🎃', category: 'vegetables', color: '#FF8C00' },
    { name: localized('Beterraba', 'Beet', 'Remolacha'), icon: '🍠', category: 'vegetables', color: '#8B0000' },
    { name: localized('Repolho', 'Cabbage', 'Repollo'), icon: '🥬', category: 'vegetables', color: '#90EE90' },
    { name: localized('Pepino', 'Cucumber', 'Pepino'), icon: '🥒', category: 'vegetables', color: '#32CD32' },
    { name: localized('Acelga', 'Chard', 'Acelga'), icon: '🥬', category: 'vegetables', color: '#98FB98' },
    { name: localized('Rabanete', 'Radish', 'Rábano'), icon: '🧅', category: 'vegetables', color: '#FF6347' },
    { name: localized('Quiabo', 'Okra', 'Quimbombó'), icon: '🫛', category: 'vegetables', color: '#6B8E23' },
  ],
  household: [
    { name: localized('Cama', 'Bed', 'Cama'), icon: '🛏️', category: 'household' },
    { name: localized('Sofá', 'Sofa', 'Sofá'), icon: '🛋️', category: 'household' },
    { name: localized('Talher', 'Cutlery', 'Cubiertos'), icon: '🍴', category: 'household' },
    { name: localized('Cadeira', 'Chair', 'Silla'), icon: '🪑', category: 'household' },
    { name: localized('Armário', 'Cabinet', 'Armario'), icon: '🗄️', category: 'household' },
    { name: localized('Janela', 'Window', 'Ventana'), icon: '🪟', category: 'household' },
    { name: localized('Porta', 'Door', 'Puerta'), icon: '🚪', category: 'household' },
    { name: localized('Banheiro', 'Bathroom', 'Baño'), icon: '🚽', category: 'household' },
    { name: localized('Chuveiro', 'Shower', 'Ducha'), icon: '🚿', category: 'household' },
    { name: localized('Televisão', 'Television', 'Televisión'), icon: '📺', category: 'household' },
    { name: localized('Lâmpada', 'Lamp', 'Lámpara'), icon: '💡', category: 'household' },
    { name: localized('Relógio', 'Clock', 'Reloj'), icon: '⏰', category: 'household' },
    { name: localized('Geladeira', 'Refrigerator', 'Nevera'), icon: '🧊', category: 'household' },
    { name: localized('Fogão', 'Stove', 'Estufa'), icon: '🔥', category: 'household' },
    { name: localized('Microondas', 'Microwave', 'Microondas'), icon: '📟', category: 'household' },
    { name: localized('Máquina de lavar', 'Washing machine', 'Lavadora'), icon: '🧺', category: 'household' },
    { name: localized('Vassoura', 'Broom', 'Escoba'), icon: '🧹', category: 'household' },
    { name: localized('Torneira', 'Faucet', 'Grifo'), icon: '🚰', category: 'household' },
    { name: localized('Espelho', 'Mirror', 'Espejo'), icon: '🪞', category: 'household' },
    { name: localized('Cortina', 'Curtain', 'Cortina'), icon: '🪟', category: 'household' },
  ],
};

const categoryNames: Record<InteractiveCategory, LocalizedText> = {
  shapes: localized('Formas', 'Shapes', 'Formas'),
  colors: localized('Cores', 'Colors', 'Colores'),
  animals: localized('Animais', 'Animals', 'Animales'),
  fruits: localized('Frutas', 'Fruits', 'Frutas'),
  foods: localized('Alimentos', 'Foods', 'Alimentos'),
  numbers: localized('Números', 'Numbers', 'Números'),
  vegetables: localized('Legumes', 'Vegetables', 'Verduras'),
  household: localized('Casa', 'Household', 'Hogar'),
};

export function getInteractiveItems(
  category: InteractiveCategory,
  locale: Locale = DEFAULT_LOCALE
): InteractiveItem[] {
  return (interactiveBase[category] ?? []).map((item) => ({
    id: `interactive:${item.category}:${slugify(item.name[DEFAULT_LOCALE])}`,
    name: localize(item.name, locale),
    icon: item.icon,
    category: item.category,
    color: item.color,
    type: item.type ? localize(item.type, locale) : undefined,
  }));
}

export function getAllInteractiveCategories(
  locale: Locale = DEFAULT_LOCALE
): { id: InteractiveCategory; name: string; icon: string; color: string }[] {
  return [
    { id: 'shapes', name: localize(categoryNames.shapes, locale), icon: '🔷', color: '#4D94FF' },
    { id: 'colors', name: localize(categoryNames.colors, locale), icon: '🎨', color: '#B24BF3' },
    { id: 'animals', name: localize(categoryNames.animals, locale), icon: '🐾', color: '#00C853' },
    { id: 'fruits', name: localize(categoryNames.fruits, locale), icon: '🍎', color: '#FF1744' },
    { id: 'foods', name: localize(categoryNames.foods, locale), icon: '🍽️', color: '#FF6B35' },
    { id: 'numbers', name: localize(categoryNames.numbers, locale), icon: '🔢', color: '#00BCD4' },
    { id: 'vegetables', name: localize(categoryNames.vegetables, locale), icon: '🥕', color: '#4CAF50' },
    { id: 'household', name: localize(categoryNames.household, locale), icon: '🏠', color: '#795548' },
  ];
}
```

- [ ] **Step 5: Rodar testes e typecheck**

Run: `npx vitest run src/data/interactive.test.ts && npm run typecheck`
Expected: PASS. `getInteractiveItems` mantém o locale padrão, então a view antiga continua compilando até a Task 13.

- [ ] **Step 6: Commit**

```bash
git add src/types/models.ts src/data/interactive.ts src/data/interactive.test.ts
git commit -m "Localiza conteúdo interativo com IDs estáveis"
```

---

### Task 8: Índice de comunicação por idioma e IDs estáveis

**Files:**
- Modify: `src/data/communication.ts`
- Modify: `src/data/communication.test.ts`

**Interfaces:**
- Produces:
  - `getAllCommunicationEntries(locale?)`
  - `getCommunicationEntry(id, locale?)`
  - `getCustomCommunicationEntries(category?)`
  - `setCustomCommunicationEntries(cards)`
  - `getConversationEntryId(item)` mantido por compatibilidade

- [ ] **Step 1: Reescrever os testes**

Substitua `src/data/communication.test.ts` por:

```ts
import { afterEach, describe, expect, it } from 'vitest';
import {
  getAllCommunicationEntries,
  getCommunicationEntry,
  getConversationEntryId,
  setCustomCommunicationEntries,
} from './communication';
import { getConversationItems } from './conversation';
import type { CustomConversationCard } from '../types/models';

afterEach(() => {
  setCustomCommunicationEntries([]);
});

describe('communication entries', () => {
  it('resolves a conversation item by its stable id', () => {
    const hello = getConversationItems('greetings', 'en-US').find(
      (item) => item.id === 'greetings:ola'
    );

    expect(hello).toBeDefined();
    const entry = getCommunicationEntry(getConversationEntryId(hello!));
    expect(entry?.text).toBe('Hello');
  });

  it('resolves a quick phrase by its id', () => {
    expect(getCommunicationEntry('quick:help')?.text).toBe('Preciso de ajuda');
    expect(getCommunicationEntry('quick:help', 'en-US')?.text).toBe('I need help');
    expect(getCommunicationEntry('quick:help', 'es-ES')?.text).toBe('Necesito ayuda');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCommunicationEntry('missing:id')).toBeUndefined();
  });

  it('generates unique ids for every locale', () => {
    for (const locale of ['pt-BR', 'en-US', 'es-ES'] as const) {
      const ids = getAllCommunicationEntries(locale).map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('includes registered custom cards in every locale without translating them', () => {
    const card: CustomConversationCard = {
      id: 'custom:1',
      category: 'needs',
      icon: '🍼',
      text: 'Quero leite',
      color: '#FF9800',
      createdAt: '2026-01-05T10:00:00.000Z',
    };

    setCustomCommunicationEntries([card]);

    expect(getCommunicationEntry('custom:1', 'pt-BR')?.text).toBe('Quero leite');
    expect(getCommunicationEntry('custom:1', 'en-US')?.text).toBe('Quero leite');
    expect(
      getAllCommunicationEntries('es-ES').some((entry) => entry.id === 'custom:1')
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `npx vitest run src/data/communication.test.ts`
Expected: FAIL porque os getters ainda não aceitam locale.

- [ ] **Step 3: Reescrever `src/data/communication.ts`**

```ts
import type { ConversationItem, CustomConversationCard } from '../types/models';
import { CONVERSATION_CATEGORIES, getConversationItems } from './conversation';
import { getQuickPhrases } from './quickPhrases';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/types';
import { slugify } from '../utils/slug';

export interface CommunicationEntry {
  id: string;
  icon: string;
  text: string;
  color: string;
  category: string;
}

export function getConversationEntryId(item: ConversationItem): string {
  return item.id || `${item.category}:${slugify(item.text)}`;
}

const baseEntriesByLocale = new Map<Locale, CommunicationEntry[]>();
const allEntriesByLocale = new Map<Locale, CommunicationEntry[]>();
const entriesByIdByLocale = new Map<Locale, Map<string, CommunicationEntry>>();

let customEntries: CommunicationEntry[] = [];

function buildBaseEntries(locale: Locale): CommunicationEntry[] {
  const quickEntries: CommunicationEntry[] = getQuickPhrases(locale).map((phrase) => ({
    ...phrase,
    category: 'quick',
  }));

  const conversationEntries: CommunicationEntry[] = CONVERSATION_CATEGORIES.flatMap(
    (category) =>
      getConversationItems(category, locale).map((item) => ({
        id: item.id,
        icon: item.icon,
        text: item.text,
        color: item.color || '#4D94FF',
        category: item.category,
      }))
  );

  return [...quickEntries, ...conversationEntries];
}

function rebuildLocale(locale: Locale): void {
  const baseEntries = baseEntriesByLocale.get(locale) ?? buildBaseEntries(locale);
  baseEntriesByLocale.set(locale, baseEntries);

  const allEntries = [...baseEntries, ...customEntries];
  allEntriesByLocale.set(locale, allEntries);
  entriesByIdByLocale.set(
    locale,
    new Map(allEntries.map((entry) => [entry.id, entry]))
  );
}

function rebuildAllLocales(): void {
  for (const locale of LOCALES) {
    rebuildLocale(locale);
  }
}

function getEntries(locale: Locale): CommunicationEntry[] {
  if (!allEntriesByLocale.has(locale)) {
    rebuildLocale(locale);
  }
  return allEntriesByLocale.get(locale)!;
}

export function setCustomCommunicationEntries(
  cards: CustomConversationCard[]
): void {
  customEntries = cards.map((card) => ({
    id: card.id,
    icon: card.icon,
    text: card.text,
    color: card.color,
    category: card.category,
  }));
  rebuildAllLocales();
}

export function getCustomCommunicationEntries(
  category?: string
): CommunicationEntry[] {
  return category
    ? customEntries.filter((entry) => entry.category === category)
    : customEntries;
}

export function getCommunicationEntry(
  id: string,
  locale: Locale = DEFAULT_LOCALE
): CommunicationEntry | undefined {
  getEntries(locale);
  return entriesByIdByLocale.get(locale)?.get(id);
}

export function getAllCommunicationEntries(
  locale: Locale = DEFAULT_LOCALE
): CommunicationEntry[] {
  return getEntries(locale);
}

export { slugify } from '../utils/slug';
```

- [ ] **Step 4: Rodar testes e typecheck**

Run: `npx vitest run src/data/communication.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/communication.ts src/data/communication.test.ts
git commit -m "Indexa comunicação por idioma com IDs estáveis"
```

---

### Task 9: Voz por idioma com fallback

**Files:**
- Modify: `src/composables/useTts.ts`
- Modify: `src/composables/useTts.test.ts`

**Interfaces:**
- Consumes: `SPEECH_LANG`, `DEFAULT_LOCALE`, `Locale`.
- Produces:
  - `initialize(locale?): Promise<boolean>` (retorna `true` se a voz exata do idioma existe)
  - `activeLanguage` (`Ref<string>`)
  - `speak(text, { lang? })` com fallback locale exato → idioma base → `pt-BR`

- [ ] **Step 1: Atualizar os mocks e adicionar testes**

Em `src/composables/useTts.test.ts`, troque o mock de `@capacitor/core` por:

```ts
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) },
}));
```

Adicione após os imports:

```ts
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const isNativePlatform = vi.mocked(Capacitor.isNativePlatform);
const isLanguageSupported = vi.mocked(TextToSpeech.isLanguageSupported);
const nativeSpeak = vi.mocked(TextToSpeech.speak);
```

Adicione ao describe web:

```ts
it('uses the requested locale on the web', async () => {
  const { speak } = useTts();

  await speak('Hello', { lang: 'en-US' });

  const utterance = speakSpy.mock.calls[0][0] as FakeUtterance;
  expect(utterance.lang).toBe('en-US');
});
```

Adicione um novo describe:

```ts
describe('useTts on native', () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(true);
    isLanguageSupported.mockReset();
    nativeSpeak.mockReset();
    nativeSpeak.mockResolvedValue(undefined);
  });

  afterEach(() => {
    isNativePlatform.mockReturnValue(false);
  });

  it('accepts an exact language match', async () => {
    isLanguageSupported.mockResolvedValue(true);
    const { initialize } = useTts();

    await expect(initialize('es-ES')).resolves.toBe(true);
    expect(isLanguageSupported).toHaveBeenCalledWith({ lang: 'es-ES' });
  });

  it('falls back from locale to base language', async () => {
    isLanguageSupported.mockImplementation(async ({ lang }) => lang === 'en');
    const { initialize, speak } = useTts();

    await expect(initialize('en-US')).resolves.toBe(false);
    await speak('Hello', { lang: 'en-US' });

    expect(nativeSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en' })
    );
  });

  it('falls back to pt-BR when no candidate is supported', async () => {
    isLanguageSupported.mockResolvedValue(false);
    const { initialize, speak } = useTts();

    await expect(initialize('en-US')).resolves.toBe(false);
    await speak('Hello', { lang: 'en-US' });

    expect(nativeSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'pt-BR' })
    );
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `npx vitest run src/composables/useTts.test.ts`
Expected: FAIL porque `initialize` ainda não aceita locale e o fallback não existe.

- [ ] **Step 3: Implementar o fallback em `src/composables/useTts.ts`**

Substitua o topo e as funções `initialize`/`speak` por:

```ts
import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { DEFAULT_LOCALE, SPEECH_LANG, type Locale } from '../i18n/types';

type TtsState = 'playing' | 'stopped' | 'paused';

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const DEFAULT_LANGUAGE = SPEECH_LANG[DEFAULT_LOCALE];

const DEFAULT_OPTIONS: Required<SpeakOptions> = {
  lang: DEFAULT_LANGUAGE,
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
};

const isInitialized = ref(false);
const activeLanguage = ref(DEFAULT_LANGUAGE);
const ttsState = ref<TtsState>('stopped');

let cancelCurrentWebSpeech: (() => void) | null = null;

interface ResolvedLanguage {
  language: string;
  exact: boolean;
}

function getLanguageCandidates(language: string): string[] {
  const base = language.split('-')[0];
  return [...new Set([language, base, DEFAULT_LANGUAGE])];
}

async function supportsLanguage(language: string): Promise<boolean> {
  try {
    return await TextToSpeech.isLanguageSupported({ lang: language });
  } catch {
    return false;
  }
}
```

Dentro de `useTts()`:

```ts
  const isNative = Capacitor.isNativePlatform();
  const resolvedLanguages = new Map<string, ResolvedLanguage>();

  const resolveLanguage = async (language: string): Promise<ResolvedLanguage> => {
    const cached = resolvedLanguages.get(language);
    if (cached) return cached;

    const candidates = getLanguageCandidates(language);

    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index];
      if (await supportsLanguage(candidate)) {
        const resolved = { language: candidate, exact: index === 0 };
        resolvedLanguages.set(language, resolved);
        return resolved;
      }
    }

    const fallback = { language: DEFAULT_LANGUAGE, exact: false };
    resolvedLanguages.set(language, fallback);
    return fallback;
  };

  const initialize = async (
    locale: Locale = DEFAULT_LOCALE
  ): Promise<boolean> => {
    const requestedLanguage = SPEECH_LANG[locale];

    if (!isNative) {
      activeLanguage.value = requestedLanguage;
      isInitialized.value =
        typeof globalThis.speechSynthesis !== 'undefined' &&
        'SpeechSynthesisUtterance' in globalThis;
      return isInitialized.value;
    }

    const resolved = await resolveLanguage(requestedLanguage);
    activeLanguage.value = resolved.language;
    isInitialized.value = true;
    return resolved.exact;
  };
```

E `speak`:

```ts
  const speak = async (text: string, options: SpeakOptions = {}): Promise<void> => {
    if (!text.trim()) return;

    if (isNative && !isInitialized.value) {
      await initialize(DEFAULT_LOCALE);
    }

    const requestedLanguage = options.lang ?? activeLanguage.value;
    const resolved = isNative
      ? await resolveLanguage(requestedLanguage)
      : { language: requestedLanguage, exact: true };

    if (isNative) {
      activeLanguage.value = resolved.language;
    }

    const merged = { ...DEFAULT_OPTIONS, ...options, lang: resolved.language };

    if (!isNative) {
      ttsState.value = 'playing';
      await speakWeb(text, merged);
      ttsState.value = 'stopped';
      return;
    }

    try {
      if (ttsState.value === 'playing') {
        await stop();
      }

      ttsState.value = 'playing';

      await TextToSpeech.speak({
        text,
        lang: merged.lang,
        rate: merged.rate,
        pitch: merged.pitch,
        volume: merged.volume,
      });

      ttsState.value = 'stopped';
    } catch {
      ttsState.value = 'stopped';
    }
  };
```

Atualize o retorno:

```ts
  return {
    isInitialized,
    activeLanguage,
    ttsState,
    initialize,
    speak,
    stop,
    pause,
    isSupported,
  };
```

- [ ] **Step 4: Rodar testes e typecheck**

Run: `npx vitest run src/composables/useTts.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useTts.ts src/composables/useTts.test.ts
git commit -m "Adapta voz ao idioma ativo com fallback"
```

---

### Task 10: Store do app com avisos por chave e locale

**Files:**
- Modify: `src/stores/app.ts`
- Create: `src/stores/app.test.ts`

**Interfaces:**
- Consumes: `useI18n`, `LOCALE_LABELS`, `MessageKey`, `getRoutineItems(period, locale)`, `ttsInitialize(locale)`, `speechLocale`.
- Produces:
  - `systemWarningKey: MessageKey | ''`
  - `systemWarning: string` traduzido
  - `prepareVoice(): Promise<boolean>`
  - rotinas resolvidas no idioma ativo

- [ ] **Step 1: Criar o teste do store**

Crie `src/stores/app.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock('../services/database', () => ({
  getDatabaseError: vi.fn(() => null),
  dbGetSetting: vi.fn(async () => null),
  dbSetSetting: vi.fn(async () => undefined),
  dbLoadAchievements: vi.fn(async () => ({})),
  dbSaveAchievement: vi.fn(async () => undefined),
  dbLoadCustomRoutineItems: vi.fn(async () => []),
  dbSaveCustomRoutineItem: vi.fn(async () => undefined),
  dbRemoveCustomRoutineItem: vi.fn(async () => undefined),
  dbLoadCustomRoutineProgress: vi.fn(async () => false),
  dbSaveCustomRoutineProgress: vi.fn(async () => undefined),
  dbClearCustomRoutineProgressForPeriod: vi.fn(async () => undefined),
  dbLoadCustomConversation: vi.fn(async () => []),
  dbSaveCustomConversation: vi.fn(async () => undefined),
  dbDeleteCustomConversation: vi.fn(async () => undefined),
}));

import { useAppStore } from './app';
import { useSettingsStore } from './settings';

describe('app store i18n', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses the active locale for routine items', async () => {
    const store = useAppStore();
    const settings = useSettingsStore();

    expect(store.getRoutineItemsForPeriod('morning')[0].text).toBe('Acordar');

    await settings.update({ language: 'en-US' });

    expect(store.getRoutineItemsForPeriod('morning')[0].text).toBe('Wake up');
  });

  it('keeps the warning empty until a failure occurs', () => {
    const store = useAppStore();

    expect(store.systemWarningKey).toBe('');
    expect(store.systemWarning).toBe('');
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npx vitest run src/stores/app.test.ts`
Expected: FAIL porque `systemWarningKey` ainda não existe e as rotinas não seguem o locale.

- [ ] **Step 3: Atualizar imports e estado de aviso**

Em `src/stores/app.ts`:

```ts
import { computed, ref } from 'vue';
import { useI18n } from '../i18n/useI18n';
import { LOCALE_LABELS } from '../i18n/types';
import type { MessageKey } from '../i18n/messages';
```

Dentro do store:

```ts
  const { t, locale, speechLocale } = useI18n();
  const settingsStore = useSettingsStore();
  const { speak: ttsSpeak, stop: ttsStop, initialize: ttsInitialize, isInitialized: isTtsInitialized } = useTts();

  const isLoading = ref(true);
  const systemWarningKey = ref<MessageKey | ''>('');
  const systemWarning = computed(() =>
    systemWarningKey.value
      ? t(systemWarningKey.value, {
          language: LOCALE_LABELS[locale.value],
        })
      : ''
  );
```

`dismissSystemWarning` passa a limpar a chave:

```ts
  const dismissSystemWarning = () => {
    systemWarningKey.value = '';
  };
```

- [ ] **Step 4: Atualizar rotinas e inicialização**

`getRoutineItemsForPeriod`:

```ts
  const getRoutineItemsForPeriod = (period: string): RoutineItem[] =>
    mergeRoutineItems(
      getRoutineItems(period, settingsStore.settings.language),
      getActiveCustomRoutineItems(
        customRoutineItems.value,
        period as RoutinePeriod
      )
    );
```

Em `initialize`:

```ts
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
```

- [ ] **Step 5: Adicionar `prepareVoice` e passar o locale ao falar**

```ts
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
```

Em `speakText`, passe o locale de fala:

```ts
    await ttsSpeak(text, {
      lang: speechLocale.value,
      rate: settingsStore.settings.speechRate,
      pitch: settingsStore.settings.speechPitch,
    });
```

- [ ] **Step 6: Exportar o novo estado**

No retorno do store, troque `systemWarning` por:

```ts
    systemWarningKey,
    systemWarning,
```

E adicione `prepareVoice` às ações:

```ts
    prepareVoice,
```

- [ ] **Step 7: Rodar testes e typecheck**

Run: `npx vitest run src/stores/app.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/stores/app.ts src/stores/app.test.ts
git commit -m "Usa locale ativo nos avisos e nas rotinas"
```

---

### Task 11: App e tela inicial localizados

**Files:**
- Modify: `src/App.vue`
- Modify: `src/views/HomeView.vue`

**Interfaces:**
- Consumes: `useI18n(): { t, locale }`.

- [ ] **Step 1: Localizar `App.vue`**

No script, adicione:

```ts
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useI18n } from './i18n/useI18n';

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
```

Remova o `const navItems = [...]` estático e importe `computed` uma única vez.

No template, substitua:

```vue
<h1 class="loading-title">{{ t('app.title') }}</h1>
<p class="loading-text">{{ t('app.loading') }}</p>
```

Banner de instalação:

```vue
<strong>{{ t('app.installTitle') }}</strong>
<small v-if="!isIOS">{{ t('app.installHint') }}</small>
<small v-else>{{ t('app.installIosHint') }}</small>
<button v-if="!isIOS" class="install-btn" @click="installApp">{{ t('app.install') }}</button>
<button class="install-close" @click="dismissInstall" :aria-label="t('app.close')">✕</button>
```

Aviso do sistema:

```vue
<button class="warning-close" @click="store.dismissSystemWarning" :aria-label="t('app.closeWarning')">✕</button>
```

- [ ] **Step 2: Localizar `HomeView.vue`**

No script:

```ts
import { useI18n } from '../i18n/useI18n';

const { t } = useI18n();

const features = computed(() => [
  { title: t('home.featureConversationTitle'), description: t('home.featureConversationDescription'), icon: '💬', color: '#4D94FF', route: '/conversation' },
  { title: t('home.featureRoutinesTitle'), description: t('home.featureRoutinesDescription'), icon: '📅', color: '#FFB84D', route: '/routines' },
  { title: t('home.featureWriterTitle'), description: t('home.featureWriterDescription'), icon: '✏️', color: '#A78BFA', route: '/writer' },
  { title: t('home.featureInteractiveTitle'), description: t('home.featureInteractiveDescription'), icon: '🎮', color: '#4DFF88', route: '/interactive' },
]);

const achievements = computed(() => [
  { key: 'morningRoutine', label: t('home.achievementMorning'), icon: '🌅', unlocked: store.dailyAchievements.morningRoutine },
  { key: 'afternoonRoutine', label: t('home.achievementAfternoon'), icon: '☀️', unlocked: store.dailyAchievements.afternoonRoutine },
  { key: 'nightRoutine', label: t('home.achievementNight'), icon: '🌙', unlocked: store.dailyAchievements.nightRoutine },
  { key: 'usedConversation', label: t('home.achievementConversation'), icon: '💬', unlocked: store.dailyAchievements.usedConversation },
  { key: 'quizStreak', label: t('home.achievementQuiz'), icon: '🎯', unlocked: store.dailyAchievements.quizStreak },
]);
```

Ajuste o ARIA:

```vue
:aria-label="t('home.achievementStatus', {
  label: achievement.label,
  status: achievement.unlocked
    ? t('home.achievementUnlocked')
    : t('home.achievementPending'),
})"
```

No template, substitua os textos fixos:

```vue
<h1 class="app-title">{{ t('app.title') }}</h1>
<button class="parent-btn" :aria-label="t('home.parentAria')" @click="openParentArea">⚙️</button>
<h2 class="welcome-title">{{ t('home.welcome') }}</h2>
<span class="stars-title">{{ t('home.starsTitle') }}</span>
<p v-if="unlockedCount === 5" class="all-stars-msg">{{ t('home.allStars') }}</p>
<p class="description-text">{{ t('home.description') }}</p>
<p class="nav-hint">{{ t('home.navHint') }}</p>
```

Troque `:key="feature.title"` por `:key="feature.route"` e o rodapé por:

```vue
<p class="footer-message">{{ t('home.footer') }}</p>
```

- [ ] **Step 3: Rodar testes e typecheck**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.vue src/views/HomeView.vue
git commit -m "Localiza navegação, avisos e tela inicial"
```

---

### Task 12: Conversa, montar frase e escrever localizados

**Files:**
- Modify: `src/views/ConversationView.vue`
- Modify: `src/views/ConversationCategoryView.vue`
- Modify: `src/views/SentenceBuilderView.vue`
- Modify: `src/views/WriterView.vue`

**Interfaces:**
- Consumes: `useI18n`, `getAllConversationCategories(locale)`, `getConversationItems(category, locale)`, `getQuickPhrases(locale)`, `getCoreVocabulary(locale)`, `getAlphabetItems(locale)`, `getCommunicationEntry(id, locale)`.

- [ ] **Step 1: Atualizar `ConversationView.vue`**

No script:

```ts
import { useI18n } from '../i18n/useI18n';
import { getQuickPhrases } from '../data/quickPhrases';

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
```

No template, troque os títulos e ARIA:

```vue
<h1 class="screen-title">{{ t('conversation.title') }}</h1>
<p class="screen-subtitle">{{ t('conversation.subtitle') }}</p>
<button class="builder-btn" @click="openBuilder">{{ t('conversation.builder') }}</button>
<h2 class="section-title">{{ t('conversation.quick') }}</h2>
<h2 class="section-title">{{ t('conversation.favorites') }}</h2>
<h2 class="section-title">{{ t('conversation.recents') }}</h2>
<h2 class="section-title">{{ t('conversation.categories') }}</h2>
:aria-label="t('common.speakAria', { text: entry.text })"
```

- [ ] **Step 2: Atualizar `ConversationCategoryView.vue`**

No script:

```ts
import { useI18n } from '../i18n/useI18n';
import { getAllConversationCategories } from '../data/conversation';

const { t, locale } = useI18n();

const conversationItems = computed<DisplayItem[]>(() => {
  const baseItems = getConversationItems(
    categoryId.value as ConversationCategory,
    locale.value
  ).map((item) => ({
    id: item.id,
    icon: item.icon,
    text: item.text,
    color: item.color,
  }));

  const customItems = store.customCards
    .filter((card) => card.category === categoryId.value)
    .map((card) => ({
      id: card.id,
      icon: card.icon,
      text: card.text,
      color: card.color,
    }));

  return [...baseItems, ...customItems];
});

const categoryInfo = computed(() => {
  const category = getAllConversationCategories(locale.value).find(
    (item) => item.id === categoryId.value
  );

  return category ?? {
    id: categoryId.value,
    name: t('conversation.fallbackTitle'),
    icon: '💬',
    color: '#4D94FF',
  };
});
```

Remova o mapa `categoryTitles` e o import de `getConversationEntryId`. Troque `categoryInfo.title` por `categoryInfo.name` no título, `:key="index"` por `:key="item.id"` e os ARIA:

```vue
<h1 class="screen-title">{{ categoryInfo.icon }} {{ categoryInfo.name }}</h1>
<p class="screen-subtitle">{{ t('conversation.categorySubtitle') }}</p>
:aria-label="t('common.speakAria', { text: item.text })"
:aria-label="
  t(
    isFavorite(index)
      ? 'conversation.removeFavoriteAria'
      : 'conversation.addFavoriteAria',
    { text: item.text }
  )
"
```

- [ ] **Step 3: Atualizar `SentenceBuilderView.vue`**

No script:

```ts
import { getCoreVocabulary, type CoreWord } from '../data/coreVocabulary';
import { useI18n } from '../i18n/useI18n';

const { t, locale } = useI18n();
const vocabulary = computed(() => getCoreVocabulary(locale.value));
```

No template, use `vocabulary` no `v-for`, e troque os textos:

```vue
<button class="back-btn" :aria-label="t('builder.backAria')" @click="goBack">←</button>
<h1 class="screen-title">{{ t('builder.title') }}</h1>
<p class="screen-subtitle">{{ t('builder.subtitle') }}</p>
<p v-if="!selected.length" class="empty-sentence">{{ t('builder.empty') }}</p>
:aria-label="t('builder.removeAria', { word: word.label })"
<button class="action-btn clear" @click="clearSentence" :disabled="!selected.length">
  {{ t('common.clear') }}
</button>
<button class="action-btn speak" :disabled="!canSpeak" @click="speakSentence">
  {{ t('builder.speak') }}
</button>
<h2 class="section-title">{{ t('builder.words') }}</h2>
:aria-label="t('builder.addAria', { word: word.label })"
```

- [ ] **Step 4: Atualizar `WriterView.vue`**

No script:

```ts
import { useI18n } from '../i18n/useI18n';

const { t, locale } = useI18n();
const alphabetItems = computed(() => getAlphabetItems(locale.value));

const speakLetter = (letter: string, word: string) => {
  store.speakText(t('writer.letterWord', { letter, word }));
};
```

No template:

```vue
<h1 class="screen-title">{{ t('writer.title') }}</h1>
<button class="clear-btn" @click="clearText" :aria-label="t('writer.clearAria')">🗑️</button>
<p class="screen-subtitle">{{ t('writer.subtitle') }}</p>
<textarea
  v-model="writerText"
  class="text-input"
  :placeholder="t('writer.placeholder')"
  rows="4"
  maxlength="500"
></textarea>
<span class="btn-text">{{ t('writer.speak') }}</span>
<span class="tip-text">{{ t('writer.tip') }}</span>
<h2 class="section-title">{{ t('writer.alphabet') }}</h2>
:aria-label="t('writer.letterAria', { letter: item.letter, word: item.word })"
```

- [ ] **Step 5: Rodar testes e typecheck**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/views/ConversationView.vue src/views/ConversationCategoryView.vue src/views/SentenceBuilderView.vue src/views/WriterView.vue
git commit -m "Localiza conversa, montagem de frase e escrita"
```

---

### Task 13: Rotinas e interação localizadas

**Files:**
- Modify: `src/views/RoutinesView.vue`
- Modify: `src/views/InteractiveView.vue`

**Interfaces:**
- Consumes: `useI18n`, `formatDate`, `getPeriodName(period, locale)`, `getInteractiveItems(category, locale)`, `getAllInteractiveCategories(locale)`, IDs estáveis do quiz.

- [ ] **Step 1: Atualizar `RoutinesView.vue`**

No script:

```ts
import { useI18n } from '../i18n/useI18n';

const { t, locale, formatDate } = useI18n();

const periods = computed(() => [
  { id: 'morning' as const, name: t('routines.tabMorning'), color: '#FF6B35', achievement: 'morningRoutine' as AchievementKey },
  { id: 'afternoon' as const, name: t('routines.tabAfternoon'), color: '#FFC107', achievement: 'afternoonRoutine' as AchievementKey },
  { id: 'night' as const, name: t('routines.tabNight'), color: '#7B68EE', achievement: 'nightRoutine' as AchievementKey },
]);

const currentPeriod = computed(() => store.currentRoutineTab);
const routineItems = computed(() =>
  store.getRoutineItemsForPeriod(currentPeriod.value)
);
const progress = computed(() => store.getRoutineProgressData(currentPeriod.value));

const periodColor = computed(() => {
  const period = periods.value.find((item) => item.id === currentPeriod.value);
  return period?.color || '#4D94FF';
});

const todayLabel = computed(() => {
  const [year, month, day] = store.routineDate.split('-').map(Number);
  return formatDate(new Date(year, month - 1, day));
});
```

No `watch`, troque:

```ts
      const period = periods.value.find((p) => p.id === currentPeriod.value);
      if (period) store.unlockAchievement(period.achievement);
      store.speakText(t('routines.speakCongrats'));
```

No template:

```vue
<p class="celebration-text">{{ t('routines.celebrationTitle') }}</p>
<p class="celebration-sub">{{ t('routines.celebrationSub') }}</p>
<p class="modal-title">{{ t('routines.clearTitle') }}</p>
<p class="modal-text">
  {{ t('routines.clearText', { period: getPeriodName(currentPeriod, locale) }) }}
</p>
<button class="modal-btn cancel" @click="cancelClear">{{ t('common.cancel') }}</button>
<button class="modal-btn confirm" @click="confirmClear">{{ t('common.clear') }}</button>
<h1 class="screen-title">{{ t('routines.title') }}</h1>
<button class="clear-btn" @click="clearProgress" :aria-label="t('routines.clearAria')">🗑️</button>
<p class="screen-subtitle">{{ t('routines.subtitle') }}</p>
<p class="today-label">{{ t('routines.today', { date: todayLabel }) }}</p>
<span class="progress-label">{{ t('routines.progress') }}</span>
<p v-if="progress.isCompleted" class="completed-msg">{{ t('routines.completed') }}</p>
:aria-label="t('common.listenAria', { text: item.text })"
:aria-label="
  t(
    progress.completedItems[index]
      ? 'routines.markUndone'
      : 'routines.markDone',
    { item: item.text }
  )
"
```

- [ ] **Step 2: Atualizar `InteractiveView.vue`**

No script:

```ts
import { useI18n } from '../i18n/useI18n';

const { t, locale } = useI18n();

const categories = computed(() => getAllInteractiveCategories(locale.value));
const interactiveItems = computed(() =>
  getInteractiveItems(currentCategory.value, locale.value)
);

watch([currentCategory, locale], () => {
  if (quizMode.value) resetQuiz();
});
```

Remova o `watch(currentCategory, ...)` antigo e coloque o novo `watch` depois da definição de `resetQuiz`. Em `generateQuizQuestion`:

```ts
  const items = getInteractiveItems(currentCategory.value, locale.value);
```

E a fala da pergunta:

```ts
    store.speakText(
      t(
        currentCategory.value === 'shapes'
          ? 'interactive.askShapes'
          : 'interactive.askItem'
      )
    );
```

Em `answerQuiz`, compare IDs e traduza mensagens:

```ts
  if (option.id === quizCurrentItem.value?.id) {
    quizAnswered.value = 'correct';
    quizScore.value++;
    store.incrementQuizStreak();
    store.speakText(t('interactive.correct', { name: option.name }));
  } else {
    quizAnswered.value = 'wrong';
    store.resetQuizStreak();
    store.speakText(
      t('interactive.wrong', { name: quizCurrentItem.value?.name ?? '' })
    );
  }
```

No template:

```vue
<h1 class="screen-title">{{ t('interactive.title') }}</h1>
<p class="screen-subtitle">{{ t('interactive.subtitle') }}</p>
🎯 {{ quizMode ? t('interactive.quizOn') : t('interactive.quiz') }}
<div class="category-grid" role="group" :aria-label="t('interactive.quizGroupAria')">
:aria-label="t('interactive.categoryAria', { name: category.name })"
<p class="quiz-prompt">{{ t('interactive.question') }}</p>
:key="option.id"
:class="{
  correct: quizAnswered && option.id === quizCurrentItem?.id,
  wrong: quizAnswered === 'wrong' && quizAnsweredIndex === index && option.id !== quizCurrentItem?.id,
  disabled: !!quizAnswered
}"
<span v-if="quizAnswered && option.id === quizCurrentItem?.id" class="option-result">✅</span>
<button class="quiz-skip" @click="generateQuizQuestion">{{ t('interactive.skip') }}</button>
:key="item.id"
:aria-label="t('common.listenAria', { text: item.name })"
v-if="currentCategory === 'shapes' && item.id !== 'interactive:shapes:trapezio'"
v-else-if="currentCategory === 'shapes' && item.id === 'interactive:shapes:trapezio'"
```

- [ ] **Step 3: Rodar testes e typecheck**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/views/RoutinesView.vue src/views/InteractiveView.vue
git commit -m "Localiza rotinas e quiz por IDs estáveis"
```

---

### Task 14: Área dos responsáveis com seletor de idioma

**Files:**
- Modify: `src/views/ParentView.vue`

**Interfaces:**
- Consumes: `useI18n`, `LOCALES`, `LOCALE_LABELS`, `Locale`, `store.prepareVoice()`, `settings.update({ language })`.

- [ ] **Step 1: Atualizar imports e dados derivados**

No script:

```ts
import { useI18n } from '../i18n/useI18n';
import { LOCALE_LABELS, LOCALES, type Locale } from '../i18n/types';

const { t, locale, formatDate } = useI18n();

const categories = computed(() =>
  getAllConversationCategories(locale.value)
);

const routinePeriods = computed<{ id: RoutinePeriod; name: string }[]>(() => [
  { id: 'morning', name: getPeriodName('morning', locale.value) },
  { id: 'afternoon', name: getPeriodName('afternoon', locale.value) },
  { id: 'night', name: getPeriodName('night', locale.value) },
]);
```

- [ ] **Step 2: Adicionar a troca de idioma**

```ts
const languageFeedback = ref('');

const changeLanguage = async (language: Locale) => {
  if (settings.settings.language === language) return;

  await settings.update({ language });
  const exactVoice = await store.prepareVoice();

  languageFeedback.value = exactVoice
    ? t('parent.languageChanged')
    : t('parent.languageUnsupported');
};
```

- [ ] **Step 3: Atualizar datas, históricos e mensagens**

```ts
const formatDay = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  return formatDate(new Date(year, month - 1, day), {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};
```

Nas ações:

```ts
  gateError.value = t('parent.gateError');
```

```ts
const testVoice = () => {
  void store.speakText(t('parent.testPhrase'));
};
```

```ts
  if (!text) {
    cardError.value = t('parent.cardError');
    return;
  }
```

```ts
const deleteCard = async (id: string) => {
  if (!window.confirm(t('parent.deleteCardConfirm'))) return;
  await store.removeCustomCard(id);
};
```

```ts
  if (!text) {
    routineItemError.value = t('parent.itemError');
    return;
  }
```

```ts
const deleteRoutineItem = async (id: string) => {
  if (!window.confirm(t('parent.removeItemConfirm'))) {
    return;
  }

  await store.removeCustomRoutineItem(id);
  void loadHistory();
};
```

```ts
  exportFeedback.value = t('parent.backupGenerated');
```

```ts
    exportFeedback.value = t('parent.backupCopied');
```

```ts
    exportFeedback.value = t('parent.backupCopyError');
```

```ts
  const confirmed = window.confirm(t('parent.resetConfirm'));
```

Ajuste as funções que consultam os novos computeds:

```ts
const categoryName = (id: ConversationCategory): string =>
  categories.value.find((category) => category.id === id)?.name || id;

const routinePeriodName = (period: RoutinePeriod): string =>
  routinePeriods.value.find((entry) => entry.id === period)?.name || period;
```

- [ ] **Step 4: Adicionar o painel de idioma no topo do dashboard**

Logo após `<div v-else class="dashboard">`:

```vue
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
```

Adicione ao final do `<style scoped>`:

```css
.language-active {
  background: #4D94FF;
  border-color: #4D94FF;
  color: white;
}
```

- [ ] **Step 5: Localizar o template**

Substitua os textos fixos:

```vue
<button class="back-btn" :aria-label="t('parent.backAria')" @click="goBack">←</button>
<h1 class="parent-title">{{ t('parent.title') }}</h1>
<p class="parent-subtitle">{{ t('parent.subtitle') }}</p>
<h2>{{ t('parent.gateTitle') }}</h2>
<p class="gate-text">{{ t('parent.gateText') }}</p>
:aria-label="t('parent.gateAria')"
<button class="primary-btn" @click="unlock">{{ t('parent.enter') }}</button>
<button class="link-btn" @click="newChallenge">{{ t('parent.newChallenge') }}</button>
<h2 class="panel-title">{{ t('parent.voiceTitle') }}</h2>
<span>{{ t('parent.speechRate') }}</span>
<span>{{ t('parent.speechPitch') }}</span>
<span>{{ t('parent.sound') }}</span>
<span>{{ t('parent.reduceMotion') }}</span>
<span>{{ t('parent.largeText') }}</span>
<span>{{ t('parent.highContrast') }}</span>
<button class="secondary-btn" @click="testVoice">{{ t('parent.testVoice') }}</button>
<button class="secondary-btn" @click="resetSettings">{{ t('parent.resetSettings') }}</button>
<h2 class="panel-title">{{ t('parent.historyTitle') }}</h2>
<p v-if="historyLoading" class="panel-hint">{{ t('parent.historyLoading') }}</p>
<span>{{ getPeriodName(entry.period, locale) }}</span>
<h2 class="panel-title">{{ t('parent.customRoutinesTitle') }}</h2>
<p class="panel-hint">{{ t('parent.customRoutinesHint') }}</p>
<span>{{ t('common.period') }}</span>
<span>{{ t('common.emoji') }}</span>
:aria-label="t('parent.itemEmojiAria')"
<span>{{ t('parent.itemName') }}</span>
:placeholder="t('parent.itemPlaceholder')"
<button class="primary-btn" type="submit">{{ t('parent.addItem') }}</button>
<button class="delete-btn" @click="deleteRoutineItem(item.id)">{{ t('common.remove') }}</button>
<p v-else class="panel-hint">{{ t('parent.noCustomItems') }}</p>
<h2 class="panel-title">{{ t('parent.customCardsTitle') }}</h2>
<p class="panel-hint">{{ t('parent.customCardsHint') }}</p>
<span>{{ t('common.category') }}</span>
<span>{{ t('common.emoji') }}</span>
:aria-label="t('parent.cardEmojiAria')"
<span>{{ t('parent.cardText') }}</span>
:placeholder="t('parent.cardPlaceholder')"
<span>{{ t('common.color') }}</span>
<button class="primary-btn" type="submit">{{ t('parent.addCard') }}</button>
<button class="delete-btn" @click="deleteCard(card.id)">{{ t('common.delete') }}</button>
<p v-else class="panel-hint">{{ t('parent.noCustomCards') }}</p>
<h2 class="panel-title">{{ t('parent.dataTitle') }}</h2>
<button class="secondary-btn" @click="downloadExport">{{ t('parent.downloadBackup') }}</button>
<button class="secondary-btn" @click="copyExport">{{ t('parent.copyBackup') }}</button>
{{ resetting ? t('parent.deleting') : t('parent.resetAll') }}
```

Troque `{{ period.name }}` no `<select>` de rotina por `{{ period.name }}` (já vem de `routinePeriods` computado) e mantenha `{{ category.icon }} {{ category.name }}` no select de cartões.

- [ ] **Step 6: Rodar testes, typecheck e build**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/views/ParentView.vue
git commit -m "Adiciona seletor de idioma e localiza área dos responsáveis"
```

---

### Task 15: Verificação final e limpeza

**Files:**
- Create: `src/i18n/content-completeness.test.ts`
- Review: todos os arquivos modificados
- Modify somente se a verificação encontrar problemas

- [ ] **Step 1: Criar o teste de completude do conteúdo nativo**

Crie `src/i18n/content-completeness.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LOCALES } from './types';
import {
  CONVERSATION_CATEGORIES,
  getConversationItems,
} from '../data/conversation';
import { getQuickPhrases } from '../data/quickPhrases';
import { getCoreVocabulary } from '../data/coreVocabulary';
import { getAlphabetItems } from '../data/alphabet';
import { getAllRoutineItems } from '../data/routines';
import {
  getAllInteractiveCategories,
  getInteractiveItems,
} from '../data/interactive';

const expectFilled = (values: string[]) => {
  for (const value of values) {
    expect(value.trim().length).toBeGreaterThan(0);
  }
};

const interactiveCategories = [
  'shapes',
  'colors',
  'animals',
  'fruits',
  'foods',
  'numbers',
  'vegetables',
  'household',
] as const;

for (const locale of LOCALES) {
  describe(`native content in ${locale}`, () => {
    it('has no empty translated texts', () => {
      for (const category of CONVERSATION_CATEGORIES) {
        expectFilled(
          getConversationItems(category, locale).map((item) => item.text)
        );
      }

      expectFilled(getQuickPhrases(locale).map((item) => item.text));
      expectFilled(getCoreVocabulary(locale).map((item) => item.label));
      expectFilled(getAlphabetItems(locale).map((item) => item.word));
      expectFilled(getAllRoutineItems(locale).map((item) => item.text));
      expectFilled(
        getAllInteractiveCategories(locale).map((item) => item.name)
      );

      for (const category of interactiveCategories) {
        expectFilled(
          getInteractiveItems(category, locale).map((item) => item.name)
        );
      }
    });
  });
}
```

- [ ] **Step 2: Rodar a suíte completa**

Run: `npm test`
Expected: todos os testes passam, incluindo os 52 anteriores e os novos testes de i18n.

- [ ] **Step 3: Rodar typecheck e build**

Run: `npm run typecheck && npm run build`
Expected: PASS sem erros.

- [ ] **Step 4: Procurar strings de interface restantes**

Run:

```bash
rg -n "toLocaleDateString\('pt-BR'\)|aria-label=\"|placeholder=\"|window\.confirm\('" src/App.vue src/views
```

Expected: nenhum `toLocaleDateString('pt-BR')`; todo `aria-label`, `placeholder` e `window.confirm` usa `t()` ou conteúdo personalizado.

Run:

```bash
rg -n "'pt-BR'" src --glob '!src/i18n/**' --glob '!**/*.test.ts'
```

Expected: nenhuma ocorrência fora do núcleo de i18n e dos testes.

- [ ] **Step 5: Verificação manual no navegador**

Execute `npm run dev` e confirme:

- Idioma inicial é português e `<html lang="pt-BR">`.
- A trava de adulto abre a área dos responsáveis e o painel “Idioma” aparece no topo.
- Alternar para English e Español traduz navegação, Home, Conversar, Montar frase, Rotinas, Escrever, Interação e todos os painéis dos responsáveis.
- O idioma permanece após recarregar a página.
- Cartões personalizados, itens personalizados de rotina e textos digitados continuam no idioma original.
- Favoritos e recentes continuam abrindo os mesmos itens após trocar o idioma.
- O progresso das rotinas continua por índice e não reinicia ao trocar o idioma.
- No quiz, a resposta correta é comparada por ID e continua correta após trocar o idioma.
- O alfabeto mostra palavras no idioma ativo.
- A voz usa o idioma ativo; se a voz exata não existir, usa o idioma base ou `pt-BR` e mostra aviso não bloqueante.
- Datas do histórico usam o locale ativo.
- Banner de instalação e aviso do sistema aparecem traduzidos.

- [ ] **Step 6: Verificar o estado do git**

Run: `git status --short`
Expected: limpo ou apenas com correções intencionais da verificação.

Se houver correções, rode novamente `npm test && npm run typecheck && npm run build` e commite:

```bash
git add -A
git commit -m "Corrige pendências do suporte multilíngue"
```

Se não houver alterações, não crie commit vazio.

- [ ] **Step 7: Revisar a spec**

Confira cada item de `docs/superpowers/specs/2026-10-28-i18n-multilingual-design.md` e marque como concluído somente o que foi verificado com evidência.

---
