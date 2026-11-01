import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { config, DISCOUNT_PERCENT } from '../site/config.mjs';
import { createTemplates, escape } from '../site/templates.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(project, process.env.OUTPUT_DIR || 'dist');
const source = resolve(project, 'site');
if (!Number.isFinite(DISCOUNT_PERCENT) || DISCOUNT_PERCENT < 0 || DISCOUNT_PERCENT > 100) throw new Error('DISCOUNT_PERCENT must be between 0 and 100.');
const siteUrl = new URL(config.siteUrl);
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
if (!['http:', 'https:'].includes(siteUrl.protocol) || siteUrl.search || siteUrl.hash) throw new Error('SITE_URL must be an HTTP(S) URL without a query or fragment.');
config.siteUrl = siteUrl.href;
const load = async name => JSON.parse(await readFile(resolve(source, 'data', name + '.json'), 'utf8'));
const [prices, portfolio, services, faq, reviews, imageSizes] = await Promise.all(['prices', 'portfolio', 'services', 'faq', 'reviews', 'images'].map(load));

// Only the agreed services are published. The full snapshot remains in site/data.
const publicPrices = {
  ...prices,
  source: undefined,
  groups: prices.groups.map(group => ({ ...group, rows: group.rows.filter(row => !row.referenceOnly) })).filter(group => group.rows.length),
};
const hash = createHash('sha256');
hash.update(JSON.stringify(config));
async function hashSources(folder) {
  for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) await hashSources(path);
    else hash.update(await readFile(path));
  }
}
await hashSources(source);
const version = hash.digest('hex').slice(0, 12);
await mkdir(output, { recursive: true });
const templates = createTemplates({ config, prices: publicPrices, portfolio, services, faq, reviews, discount: DISCOUNT_PERCENT, version, imageSizes });
const pages = new Map([
  ['', templates.home()], ['ceny/', templates.pricePage()],
  ['kalkulyator/', templates.calculatorPage()], ['raboty/', templates.portfolioPage()],
  ['obo-mne/', templates.aboutPage()], ['kontakty/', templates.contactsPage()],
  ['usloviya/', templates.termsPage()], ['404.html', templates.notFound()],
]);
for (const service of services) pages.set(service.slug + '/', templates.servicePage(service));
for (const work of portfolio.cases) pages.set('raboty/' + work.slug + '/', templates.casePage(work));
for (const [path, html] of pages) {
  const file = resolve(output, path.endsWith('.html') ? path : path + 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html + '\n');
}
for (const file of ['styles.css', 'gallery.js', 'app.js', 'pricing.mjs']) await copyFile(resolve(source, file), resolve(output, file));
await writeFile(resolve(output, 'calculator.mjs'), (await readFile(resolve(source, 'calculator.mjs'), 'utf8')).replaceAll('__VERSION__', version));
await writeFile(resolve(output, 'calculator-data.json'), JSON.stringify({ prices: publicPrices, discount: DISCOUNT_PERCENT, services: services.map(({ id, short }) => ({ id, short })), contacts: { phone: config.phoneLabel, messengers: config.messengers } }));
const indexed = [...pages.keys()].filter(path => path !== '404.html');
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexed.map(path => `<url><loc>${escape(new URL(path, siteUrl).href)}</loc></url>`).join('')}</urlset>\n`);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
await writeFile(resolve(output, '.nojekyll'), '');
// A custom domain is configured only by an explicit SITE_URL, never by a draft name.
if (!siteUrl.hostname.endsWith('github.io') && !['localhost', '127.0.0.1'].includes(siteUrl.hostname)) await writeFile(resolve(output, 'CNAME'), siteUrl.hostname + '\n');
else {
  const { unlink } = await import('node:fs/promises');
  await unlink(resolve(output, 'CNAME')).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
console.log(`Built ${pages.size} HTML pages (${indexed.length} indexed), base path ${siteUrl.pathname}, assets ${version}.`);
