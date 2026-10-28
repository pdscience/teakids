# Design — Suporte multilíngue (PT-BR, EN-US, ES-ES)

**Data:** 2026-10-28
**Status:** aprovado para planejamento
**Escopo:** traduzir o app inteiro para português, inglês e espanhol, com seletor na área dos responsáveis.

## Objetivos

- Permitir que o responsável escolha entre **Português**, **English** e **Español**.
- Traduzir toda a interface e todo o conteúdo nativo do app, incluindo telas infantis, textos falados, `aria-label`s, diálogos, avisos e datas.
- Manter a experiência atual em português como padrão.
- Preservar favoritos, recentes, progresso e conteúdos personalizados ao trocar de idioma.
- Fazer a voz do app acompanhar o idioma escolhido.

## Fora de escopo

- Traduzir automaticamente textos criados pelos responsáveis.
- Detectar automaticamente o idioma do aparelho.
- Traduzir metadados estáticos de loja/PWA em tempo real; o nome do app continua sendo a marca `TEA Kids` e o manifesto mantém o locale padrão.
- Adicionar idiomas além de português, inglês e espanhol nesta entrega.

## Decisões aprovadas

1. **Escopo total:** interface + conteúdo nativo.
2. **Conteúdo personalizado:** permanece exatamente como foi digitado em qualquer idioma.
3. **Voz:** acompanha o idioma selecionado, com aviso e fallback quando não houver voz compatível.
4. **Idioma inicial:** `pt-BR` para todos; a escolha fica persistida.
5. **Implementação:** i18n próprio e tipado, sem nova dependência.

## Arquitetura

### Locales

Criar em `src/i18n/`:

- `types.ts`: `Locale = 'pt-BR' | 'en-US' | 'es-ES'`, `LocalizedText = Record<Locale, string>` e tipos auxiliares.
- `messages/pt-BR.ts`, `messages/en-US.ts`, `messages/es-ES.ts`: dicionários de interface com as mesmas chaves.
- `messages/index.ts`: mapa `messagesByLocale` e fallback para `pt-BR`.
- `content.ts`: helpers `localized(pt, en, es)` e `localize(text, locale)`.
- `useI18n.ts`: composable que lê o locale das configurações e expõe:
  - `locale: ComputedRef<Locale>`
  - `t(key, params?): string`
  - `formatDate(date, options?): string`
  - `speechLocale: ComputedRef<string>`

As chaves de interface serão planas e tipadas, por exemplo `home.welcome`, `parent.languageTitle` e `routines.progress`. A interpolação usará o formato `{name}`. Chaves ausentes em um locale cairão para `pt-BR` em runtime; os tipos e testes exigirão paridade completa entre os três dicionários.

### Configurações

Adicionar `language: Locale` a `AppSettings`, com padrão `'pt-BR'`.

- `parseSettings` valida o campo e ignora valores desconhecidos, usando `pt-BR`.
- `useSettingsStore.apply()` atualiza `document.documentElement.lang`.
- A troca de idioma é imediata, sem recarregar a página, e persiste em `teakids_settings`.
- `reset()` volta o idioma para `pt-BR`.
- O título do documento passa a ser atualizado pelo composable/`App.vue` conforme o locale.

### Conteúdo nativo

Todo item nativo terá **ID estável e explícito**, independente do texto exibido:

- Conversa: `ConversationItem` ganha `id`. Os IDs serão iguais aos IDs atuais derivados do texto em português (ex.: `greetings:sim`), preservando favoritos e recentes existentes.
- Frases rápidas e vocabulário central: já possuem IDs estáveis; manter.
- Alfabeto: o ID estável é a letra; a palavra e o ícone podem variar por idioma.
- Rotinas padrão: ID estável por período e índice (ex.: `routine:morning:0`), sem alterar o progresso salvo por índice.
- Interativos/quiz: `InteractiveItem` ganha `id` estável; o quiz compara IDs, não nomes traduzidos.
- Categorias, períodos e tipos também terão textos localizados centralizados.

Os dados nativos passarão a armazenar `LocalizedText` no campo de texto/nome, usando o helper `localized(pt, en, es)`. Funções de acesso recebem ou consultam o locale atual e retornam os tipos existentes com o texto já resolvido. A seleção de conteúdo nunca depende de comparação de textos traduzidos.

### Migração e compatibilidade

- Como os IDs de conversa serão mantidos iguais aos atuais, favoritos e recentes continuam válidos sem migração obrigatória.
- Ainda assim, ao carregar favoritos/recentes, IDs legados que não existam no novo índice serão normalizados pelo mapa de IDs antigos para os novos; se houver mudança, os valores corrigidos serão persistidos.
- Cartões personalizados, itens personalizados de rotina, progresso diário e histórico permanecem inalterados.
- O índice de comunicação (`communication.ts`) deixará de derivar IDs do texto e passará a usar o `id` estável do item.
- Textos personalizados continuam no idioma em que foram digitados.

### Voz

- `useTts` deixa de assumir `pt-BR` fixo na inicialização nativa.
- `speakText` passa o locale atual (`pt-BR`, `en-US` ou `es-ES`) em todas as falas.
- A verificação `isLanguageSupported` será feita para o locale escolhido. Estratégia de fallback: locale exato → idioma base (`en`, `es`, `pt`) → `pt-BR`.
- Se nenhuma voz compatível existir, o app mostra um aviso não bloqueante e continua usando a voz disponível.
- Ao trocar de idioma, qualquer fala em andamento é interrompida e a nova voz é preparada.
- Textos falados (parabéns, quiz, letras, confirmações) vêm do mesmo dicionário/conteúdo do texto exibido.

### Interface

- Na área dos responsáveis, após a trava, inserir um painel **“🌐 Idioma”** no topo.
- O painel terá três botões: **Português**, **English** e **Español**, com o atual destacado e `aria-pressed`.
- A troca não exige confirmação e mostra feedback curto de sucesso.
- Todas as views, navegação, mensagens do sistema, `window.confirm`, placeholders, títulos e `aria-label`s usarão `t()`.
- Datas usarão `Intl.DateTimeFormat` com o locale atual.
- O banner de instalação e o aviso do sistema também serão traduzidos.
- Não haverá seletor de idioma nas telas infantis.

## Conteúdo a traduzir

- Interface: aproximadamente 130–150 strings em `App.vue`, views, store e avisos.
- Conversa: 110 itens.
- Frases rápidas: 8 itens.
- Vocabulário central: 26 itens.
- Rotinas: 23 itens, 3 períodos.
- Alfabeto: 26 letras/palavras.
- Interativos: 183 itens, 8 categorias e cerca de 11 tipos.
- Rótulos de categorias, períodos, datas e mensagens faladas.

As traduções serão autorais e adequadas ao público infantil, não literais quando a adaptação fizer sentido. Associações do alfabeto e agrupamentos culturais (por exemplo, tipos de animais) serão escolhidos por idioma.

## Testes

Testes unitários puros, seguindo o padrão atual do projeto:

- Paridade de chaves e ausência de strings vazias nos três dicionários.
- Interpolação e fallback para `pt-BR`.
- Completude dos textos localizados de todos os conteúdos nativos.
- Unicidade e estabilidade dos IDs de conversa e interativos.
- Compatibilidade dos IDs atuais de favoritos/recentes.
- Validação de `language` em `parseSettings` (válido, inválido e ausente).
- `useTts` usando o locale escolhido e aplicando fallback.
- Testes existentes atualizados para os novos formatos de dados.

## Critérios de aceite

- A área dos responsáveis exibe o seletor com os três idiomas.
- A troca é imediata, persiste após recarregar e atualiza `<html lang>`.
- Todas as telas e conteúdos nativos aparecem no idioma escolhido, sem mistura de português.
- Conteúdos personalizados permanecem como digitados.
- Favoritos e recentes existentes continuam funcionando.
- A voz segue o idioma e informa quando não há suporte.
- Datas e diálogos usam o locale atual.
- `npm test`, `npm run typecheck` e `npm run build` passam.
