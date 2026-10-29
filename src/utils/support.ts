export const SUPPORT_URL = 'https://teakids.pages.dev/apoio/';

export const SUPPORT_EMAIL = 'portodatascience@gmail.com';

export const sponsorMailto = (): string =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Quero patrocinar o TEA Kids')}`;
