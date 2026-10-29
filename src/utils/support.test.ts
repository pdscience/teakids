import { describe, expect, it } from 'vitest';
import landingPage from '../../public/apoio/index.html?raw';
import { SUPPORT_EMAIL, SUPPORT_URL } from './support';

describe('support', () => {
  it('points to a public https landing page', () => {
    expect(SUPPORT_URL.startsWith('https://')).toBe(true);
    expect(SUPPORT_URL.endsWith('/apoio/')).toBe(true);
  });

  it('exposes a contact email for sponsorship requests', () => {
    expect(SUPPORT_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it('ships a landing page with a configured payment link', () => {
    expect(landingPage).toContain('CONFIG');
    expect(landingPage).toContain('paymentLink');
    expect(landingPage).toContain('https://link.mercadopago.com.br/aplicativoteakids');
    expect(landingPage).not.toContain('COLE_AQUI_O_LINK_DE_PAGAMENTO');
    expect(landingPage).not.toContain('chave-pix-configurar');
  });

  it('keeps the app contact email in sync with the landing page', () => {
    expect(landingPage).toContain(`email: '${SUPPORT_EMAIL}'`);
  });

  it('offers the suggested contribution amounts', () => {
    for (const amount of ['10', '25', '50', '100']) {
      expect(landingPage).toContain(`data-amount="${amount}"`);
    }
  });
});
