// Change this value, then run: node scripts/build.mjs
export const DISCOUNT_PERCENT = 10;

export const config = {
  brand: 'CleanChaos',
  specialist: 'Мартин',
  siteUrl: process.env.SITE_URL || 'https://yesworld.github.io/martin/',
  phone: '+79251500233',
  phoneLabel: '+7 925 150-02-33',
  avito: 'https://www.avito.ru/brands/e24bf34f18a2df29dea4e1ee2382e018/all/predlozheniya_uslug?src=sharing&sellerId=c886c35a71d29529551e86b630a064da',
  // Add only confirmed contacts. Supported: { name, url, textParameter? }.
  messengers: [],
  legal: { name: null, inn: null, status: null },
};
