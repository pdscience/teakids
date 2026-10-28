# TEA Kids — Finalidade de cada tela do aplicativo

Documento de apresentação do fluxo de telas do **TEA Kids**, aplicativo de comunicação assistida para crianças no espectro autista, preparado para explicação a gestores, parceiros e equipes de acompanhamento.

> **Resumo em uma frase:** o aplicativo organiza a rotina da criança em cinco experiências curtas (Conversar, Montar frase, Rotinas, Escrever e Interação), com uma área restrita a responsáveis para ajustes, histórico e personalização.

---

## 1. Visão geral do fluxo

```
Abertura do app
      │
      ▼
   INÍCIO ── logo, estrelas do dia, atalhos para as 5 áreas
      │
      ├──► CONVERSAR ──► CATEGORIA (cartões que falam) ──► FAVORITOS / RECENTES
      │            └──► MONTAR FRASE (combinar palavras e falar)
      │
      ├──► ROTINAS ──► checklists de Manhã / Tarde / Noite
      │
      ├──► ESCREVER ──► texto falado + alfabeto
      │
      ├──► INTERAÇÃO ──► aprender formas/cores + Quiz
      │
      └──► ⚙️ ÁREA DOS RESPONSÁVEIS (protegida por conta matemática)
                  ├── Idioma
                  ├── Voz e acessibilidade
                  ├── Histórico dos últimos 7 dias
                  ├── Rotinas personalizadas
                  ├── Cartões personalizados
                  └── Dados (backup / apagar tudo)
```

Barra de navegação fixa na parte inferior, disponível em todas as telas: **Início · Conversar · Rotinas · Escrever · Interação**.

---

## 2. Mapa das telas

| Tela | Rota | Quem usa | Para que serve |
|---|---|---|---|
| Início | `/home` | Criança | Ponto de partida: mostra o progresso do dia e abre todas as áreas com um toque |
| Conversar | `/conversation` | Criança | Escolher uma categoria de comunicação ou usar frases prontas |
| Categoria | `/conversation/:category` | Criança | Ver os cartões de uma categoria e tocar para ouvir a frase |
| Montar frase | `/conversation/builder` | Criança | Combinar palavras em uma frase e ouvir o que foi montado |
| Rotinas | `/routines` | Criança | Acompanhar e marcar as atividades do dia |
| Escrever | `/writer` | Criança | Digitar texto para ouvir e explorar o alfabeto |
| Interação | `/interactive` | Criança | Aprender vocabulary visual e testar o conhecimento no Quiz |
| Área dos responsáveis | `/parent` | Responsável | Ajustes, histórico, personalização e gestão de dados |

---

## 3. Detalhamento por tela

### 3.1 Início — `/home`
**Finalidade:** é a "central" do aplicativo. A criança reconhece imediatamente o que já conquistou e para onde pode ir.

- **Banner do aplicativo:** imagem institucional em largura total, com saudação e o counters de estrelas.
- **Estrelas de Hoje:** até cinco conquistas — Rotina da Manhã, Rotina da Tarde, Rotina da Noite, uso do módulo Conversar e o selo "Quiz Champion".
- **Atalhos em grade de duas colunas:** Conversar, Rotinas, Escrever e Interação, com ícone e descrição curta.
- **Portão para os responsáveis:** botão ⚙️ no topo, protegido por confirmação de adulto.

**Valor para o gestor:** mostra, em uma tela, o engajamento diário da criança e o uso de cada módulo.

---

### 3.2 Conversar — `/conversation`
**Finalidade:** é o módulo central do produto. Permite que a criança comunique necessidades e sentimentos por meio de toques, com leitura em voz alta.

- **Seis categorias de comunicação:** Saudações, Necessidades, Saúde, Atividades, Família e Locais.
- **Frases rápidas:** frases prontas de uso imediato, sem precisar navegar por categorias.
- **Favoritos:** as frases mais usadas pela criança, em um clique.
- **Recentes:** últimas frases abertas, também em um clique.
- **Atalho "Montar frase":** para mensagens que não existem prontas.

**Valor para o gestor:** amplia o repertório comunicativo da criança e reduz frustrações em situações do dia a dia (fome, sono, dor, querer ir para casa).

---

### 3.3 Categoria de comunicação — `/conversation/:category`
**Finalidade:** é o "banco de frases" visual de uma categoria.

- Cartões coloridos com emoji e texto, em grade.
- **Um toque = a frase é falada em voz alta** (a voz segue o idioma escolhido).
- Botão de favoritar em cada cartão.
- Itens criados pelos responsáveis aparecem aqui junto dos nativos.

**Valor para o gestor:** garante que a criança encontre rapidamente a frase certa no momento em que precisa se comunicar.

---

### 3.4 Montar frase — `/conversation/builder`
**Finalidade:** permitir que a criança monte mensagens que ainda não existem no aplicativo.

- Banco de palavras do vocabulário básico (≈26 palavras) organized em cartões.
- Toque para somar palavras à frase; toque again na palavra montada para removê-la.
- Botão **🔊 Falar frase** lê o que foi montado em voz alta.

**Valor para o gestor:** amplia a autonomia: a criança deixa de depender apenas de frases prontas.

---

### 3.5 Rotinas — `/routines`
**Finalidade:** dar estrutura previsível ao dia, reduzindo ansiedade e aumentando a autonomia.

- **Três períodos:** Manhã, Tarde e Noite — 23 atividades padrão no total.
- **Checklist visual:** cada item é marcado/desmarcado com um toque.
- **Barra de progresso** e data do dia no idioma ativo.
- **Comemoração ao concluir** um período inteiro (som e mensagem de parabéns).
- **Opção de limpar o progresso** do dia (com confirmação).
- **Itens extras** criados pelos responsáveis entram no mesmo checklist.

**Valor para o gestor:** é o indicador mais objetivo de adesão à rotina diária — cada item concluído é um registro de progresso.

---

### 3.6 Escrever — `/writer`
**Finalidade:** treinar leitura e escrita de forma breve e progressiva.

- **Campo de texto:** o que for digitado pode ser falado em voz alta.
- **Alfabeto interativo:** 26 letras, cada uma com uma palavra de exemplo e emoji, pronunciadas ao toque.
- Dica de uso de frases curtas para melhor compreensão.

**Valor para o gestor:** mantém a prática de alfabetização dentro da rotina do app, sem material extra.

---

### 3.7 Interação — `/interactive`
**Finalidade:** ampliar vocabulário e reconhecimento visual por meio de brincadeira.

- **Oito categorias:** Formas, Cores, Animais, Frutas, Alimentos, Números, Legumes e Casa (183 itens).
- Cada item é apresentado com emoji, nome e, quando aplicável, classificação (ex.: "Doméstico", "Fauna Brasileira").
- **Modo Quiz:** o app pergunta "Qual é este?" e a criança escolhe entre alternativas; o gabarito é conferido por identificador técnico, portanto as traduções não alteram o resultado.
- Botão de pular e leitura das perguntas em voz alta.

**Valor para o gestor:** funciona como sessão de estimulação cognitiva curta, com feedback imediato.

---

### 3.8 Área dos responsáveis — `/parent`
**Finalidade:** dar ao adulto o controle sobre o aplicativo, sem poluir a experiência da criança.

**Proteção de acesso:** a área abre apenas após resolver uma conta matemática — mecanismo simples para evitar acesso acidental pela criança.

| Painel | Finalidade |
|---|---|
| **🌐 Idioma** | Troca o idioma do aplicativo entre Português, English e Español. A troca é imediata e permanece salva no dispositivo. |
| **🔊 Voz e acessibilidade** | Ajuste de velocidade, tom e volume da voz; som ligado/desligado; redução de animações; texto ampliado; alto contraste; botão de teste da voz; restauração dos ajustes. |
| **📅 Histórico dos últimos 7 dias** | Panorama de uso por período (manhã/tarde/noite) e por módulo, com contadores de concluídos — base para acompanhar evolução semana a semana. |
| **📅 Rotinas personalizadas** | Adição de atividades extras (emoji + nome) em Manhã, Tarde ou Noite, sem alterar as atividades padrão. |
| **🃏 Cartões personalizados** | Criação de cartões extras de comunicação (categoria, emoji, texto e cor) para situações específicas da família. |
| **💾 Dados** | Geração de backup (download ou cópia), e função "apagar todos os dados" com confirmação explícita. |

**Valor para o gestor:** centraliza configuração, evidência de uso e personalização — tudo o que é necessário para escalar o uso a outras famílias ou salas.

---

## 4. Recursos que atravessam todas as telas

| Recurso | Descrição | Relevância |
|---|---|---|
| **Três idiomas** | Português (padrão), Inglês e Espanhol — interface e conteúdo nativo traduzidos | Amplia o público atendido e a parentalidade bilíngue |
| **Voz por idioma** | A leitura em voz alta acompanha o idioma escolhido; quando a voz exata não existe no aparelho, o app usa a voz mais próxima e **avisa sem travar** | Usabilidade contínua e sem erro percebido pelo usuário |
| **Acessibilidade** | Texto ampliado, alto contraste, menos animações, controle de velocidade/ tom da voz | Atende a diferentes perfis de sensibilidade e visão |
| **Funcionamento offline** | Após o primeiro carregamento, o app funciona sem internet (PWA instalável na tela inicial) | Continuidade do uso em qualquer lugar |
| **Dados no próprio aparelho** | Progresso, favoritos, ajustes e personalizações ficam no dispositivo (SQLite no app Android; armazenamento local do navegador na versão web) | Privacidade: nada é enviado a servidores externos |
| **Trilha de progresso** | Estrelas diárias e histórico de 7 dias | Evidência objetiva de uso para acompanhamento |
| **Compatibilidade de dados** | Trocar de idioma não reinicia progresso, favoritos ou rotinas | Segurança para o usuário |

---

## 5. Perfis de uso (leitura rápida para o gestor)

**Criança — jornada típica (5 a 10 minutos por sessão)**
1. Abre o app e vê as estrelas do dia.
2. Usa **Conversar** para pedir algo ou comentar.
3. Marca a **Rotina** do período.
4. Brinca no **Quiz** de **Interação**.

**Responsável — acompanhamento (5 minutos por semana)**
1. Abre **Área dos responsáveis** (com a conta).
2. Confere o **histórico dos 7 dias**.
3. Ajusta **idioma**, **voz** e **acessibilidade** conforme a necessidade.
4. Cria **itens de rotina** e **cartões de comunicação** personalizados.

---

## 6. Termos técnicos explicados

| Termo | Significado em linguagem simples |
|---|---|
| **PWA** | Aplicativo web que pode ser instalado na tela inicial do celular e funcionar sem internet |
| **TTS (síntese de voz)** | Conversão do texto em fala audível |
| **Fallback** | Escolha automática de uma opção próxima quando a ideal não está disponível (ex.: voz do idioma) |
| **SQLite** | Banco de dados leve que roda dentro do próprio aplicativo, no aparelho |
| **Offline** | Uso do aplicativo sem conexão com a internet |
| **Badge / selo** | Marcação de conquista, como o "Quiz Champion" |

---

*TEA Kids — Um mundo mais azul, um mundo com mais inclusão 💙*
