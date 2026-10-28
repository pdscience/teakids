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

  it('ships a landing page with a configurable payment link', () => {
    expect(landingPage).toContain('CONFIG');
    expect(landingPage).toContain('paymentLink');
    expect(landingPage).toContain('COLE_AQUI_O_LINK_DE_PAGAMENTO');
  });

  it('offers the suggested contribution amounts', () => {
    for (const amount of ['10', '25', '50', '100']) {
      expect(landingPage).toContain(`data-amount="${amount}"`);
    }
  });
});
