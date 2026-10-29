# Apoie o projeto — como configurar a página de contribuições

Esta página é o "carrinho de Apoio" do TEA Kids: uma landing page estática que abre no link
`https://teakids.pages.dev/apoio/` e é chamada pelo botão **💙 Apoie o projeto** dentro da área dos
responsáveis do aplicativo.

Nenhuma alteração no app é necessária para trocar o provedor de pagamento: o link de pagamento
existe em **um único lugar**, o bloco `CONFIG` da própria landing page.

---

## 1. Onde ficam as coisas

| Item | Arquivo |
|---|---|
| Landing page (o que o doador vê) | `public/apoio/index.html` |
| Link do app para a landing page | `src/utils/support.ts` (`SUPPORT_URL`) |
| E-mail de contato do app | `src/utils/support.ts` (`SUPPORT_EMAIL`) |
| Textos do botão no app | `src/i18n/messages/pt-BR.ts`, `en-US.ts`, `es-ES.ts` (chaves `parent.support*`) |
| Testes que garantem que nada quebra | `src/utils/support.test.ts` |

---

## 2. Criar o link de pagamento

### Opção A — Mercado Pago (recomendado para Brasil)
1. Entrar em <https://www.mercadopago.com.br> e criar conta (pessoa física ou CNPJ).
2. **Criar link de pagamento** → *Cobrar com link de pagamento*.
3. Definir título "Apoio ao TEA Kids", escolher **Pix** e **cartão de crédito**.
4. Copiar a URL gerada (formato `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...`).
5. (Opcional) em *Planos*, criar um plano mensal para a opção de apoio recorrente.

### Opção B — Stripe
1. Entrar em <https://dashboard.stripe.com> e criar conta.
2. *Payment links* → *Create payment link* → valor fixo ou "customer chooses price".
3. Ative **Pix** e cartão nas formas de pagamento (Pix exige habilitação da conta).
4. Copie a URL `https://buy.stripe.com/...`.

### Opção C — Pix direto (sem taxa, sem provedor)
Use a chave Pix da pessoa jurídica/projeto no bloco `CONFIG.pixKey` e envie o comprovante por e-mail
para emitir o recibo.

---

## 3. Preencher a landing page

Abra `public/apoio/index.html` e edite o bloco de configuração:

```js
const CONFIG = {
  paymentLink: 'https://link.mercadopago.com.br/aplicativoteakids', // URL do passo 2
  email: 'portodatascience@gmail.com',                             // e-mail que recebe comprovantes
  whatsapp: '5561996911526',                                       // só números, com DDI
  pixKey: 'portodatascience@gmail.com',                            // chave Pix (e-mail, telefone ou CPF/CNPJ)
  pixName: 'TEA Kids',                                             // nome que aparece no comprovante
  appUrl: '../',                                                   // link para o aplicativo
};
```

Enquanto o `paymentLink` não for preenchido, os botões de valor mostram um aviso explicando o
que falta — a página não quebra.

### O link atual aceita valor aberto

O link configurado é um **link de pagamento do Mercado Pago com valor aberto**: o checkout mostra
"Insira o valor a pagar" e aceita **Pix ou cartão**. Por isso, os cartões de sugestão (R$ 10, 25,
50 e 100) da landing page servem como atalhos para o checkout, mas **o valor é digitado pelo
doador na tela do Mercado Pago** — o parâmetro `?amount=` não é aplicado por esse provedor.

Se quiser que o valor já venha preenchido ao clicar em um cartão, crie links de pagamento
separados no Mercado Pago (um por valor) e adicione um campo `paymentLinks` no `CONFIG`, ou
desative os cartões e deixe um único botão "Contribuir agora".

---

## 4. Ajustar o link do aplicativo

Em `src/utils/support.ts`:

```ts
export const SUPPORT_URL = 'https://teakids.pages.dev/apoio/';
export const SUPPORT_EMAIL = 'portodatascience@gmail.com';
```

Troque pelo domínio real do projeto (se o Cloudflare Pages usar outro nome) e pelo e-mail de contato
definitivo. Depois de alterar, rode:

```bash
npm test && npm run typecheck && npm run build
```

O teste `src/utils/support.test.ts` falha se a URL deixar de ser `https`, se o caminho `/apoio/` mudar
ou se a landing page sumir da pasta `public/`.

---

## 5. Publicar

```bash
git add public/apoio/index.html src/utils/support.ts
git commit -m "Configura link de pagamento do apoio"
git push origin main
```

O Cloudflare Pages publica automaticamente. A landing page fica disponível em
`https://<seu-dominio>/apoio/` (o botão do app abre essa mesma URL).

---

## 6. Checklist antes de divulgar

- [x] `CONFIG.paymentLink` preenchido e testado em um pagamento real de valor baixo.
- [x] `CONFIG.email` e `CONFIG.whatsapp` corretos (recebimento de comprovante e patrocínio).
- [ ] `CONFIG.pixKey` validada com um Pix de teste.
- [x] `SUPPORT_URL` no app apontando para o domínio final.
- [x] Página aberta no celular (responsividade) e no computador.
- [x] Título e descrição da página conferidos no compartilhamento (WhatsApp/Instagram).
- [ ] Decidido quem emite o recibo e como (a plataforma gera recibo; para nota fiscal é preciso CNPJ).
- [ ] Versão em português revisada por alguém do time (sem gírias ou erros de digitação).

---

## 7. Divulgação

- **WhatsApp/Instagram:** envie o link direto — a página tem botões de compartilhamento.
- **Escolas e clínicas:** envie a URL para o professor usar como link no grupo de famílias.
- **Impressão:** a página pode ser impressa como "folder" de apoio (o layout é responsivo).
- **No app:** o botão na área dos responsáveis mostra a URL no rodapé do aparelho, o que ajuda a
  família a encontrar a página depois.

---

## 8. Evoluções futuras (não implementadas ainda)

- Controle de meta mensal na landing page (ex.: "R$ 1.200 de R$ 3.000").
- Relatório de apoios recebidos (exige backend ou painel do provedor).
- Cupom de desconto para campanhas.
- Parceria com empresas exibindo logo na página de agradecimentos.
