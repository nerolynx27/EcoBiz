import { chromium, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:3001'; const errors = []; page.on('pageerror', e => errors.push(e.message));
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('ecobiz-demo-v2')));
async function controls() { const details = page.getByRole('complementary').locator('details'); if (await details.getAttribute('open') === null) await details.locator('summary').click(); }
async function role(value) { await controls(); await page.getByLabel('Demo session').selectOption(value); }
async function scenario(value) { await controls(); await page.getByLabel('Review scenario').selectOption(value); }
async function confirm(label) { await page.getByRole('button', { name: label, exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Go back', exact: true }).focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); }
async function capture(name) { const size = page.viewportSize(); await page.evaluate(() => window.scrollTo(0,0)); await page.setViewportSize({ width: size.width, height: await page.evaluate(() => document.documentElement.scrollHeight) }); await page.screenshot({ path: `screenshots/part3-${name}.png`, fullPage: true }); await page.setViewportSize(size); }
async function noOverflow() { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
try {
  await page.goto(`${base}/ops`); await expect(page.getByRole('heading', { name: 'Permission denied' })).toBeVisible();
  await role('staff'); await expect(page.getByRole('heading', { name: 'Evening operations' })).toBeVisible();
  await page.getByLabel('Service date to review').fill('2026-10-02');
  await page.getByRole('link', { name: 'Create sample offer', exact: true }).click();
  await expect(page.getByText(/Service date: 2026-10-02/)).toBeVisible();
  await page.goto(base + '/ops'); await page.getByRole('link', { name: 'Create sample offer', exact: true }).click();
  const editor = page.getByRole('form', { name: 'Meal editor' });
  const cards = page.getByRole('region', { name: 'Published meals' }).locator('article');
  await expect(editor).toHaveCount(1);
  for (const meal of ['Nasi ayam goreng', 'Nasi ayam masak merah', 'Nasi ayam kicap', 'Nasi ayam masak lemak']) {
    await page.getByLabel('Meal', { exact: true }).selectOption(meal);
    await expect(page.getByLabel('Meal name', { exact: true })).toHaveValue(meal);
    await expect(page.getByLabel('Meal name', { exact: true })).toHaveAttribute('readonly', '');
    await expect(editor.getByText('Photo unavailable', { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Add custom meal' }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByLabel('Meal name', { exact: true })).toBeFocused();
  for (const field of await editor.locator('input:not([type=file]), textarea').all()) { await expect(field).toHaveValue(''); expect(await field.getAttribute('placeholder')).toBeNull(); }
  await page.getByLabel('Meal name', { exact: true }).fill('Sample evening rice'); await page.getByLabel('Description', { exact: true }).fill('A sample meal for the connected staff and customer journey.');
  await page.getByLabel('Pickup location', { exact: true }).fill('Sample counter'); await page.getByLabel('Collection instructions', { exact: true }).fill('Show your pickup reference.');
  await page.getByLabel('Vendor price (RM)').fill('7.00'); await page.getByLabel('Available quantity').fill('4');
  await page.getByLabel('Pickup start (Malaysia time)').fill('21:40'); await page.getByLabel('Pickup end (Malaysia time)').fill('21:55');
  await page.getByLabel(/Meal photo/).setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') }); await expect(page.getByText('Choose a JPEG, PNG or WebP image no larger than 5 MB.')).toBeVisible();
  await page.getByLabel(/Meal photo/).setInputFiles({ name: 'meal.webp', mimeType: 'image/webp', buffer: await readFile('public/chicken-rice.webp') });
  for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(); await capture(`offer-form-${width}`); }
  const beforePublish = await cards.count();
  await page.getByLabel('Pickup end (Malaysia time)').fill('21:30'); await confirm('Publish meal'); await expect(editor.getByRole('alert')).toContainText('pickup end must follow start'); await expect(cards).toHaveCount(beforePublish);
  await page.getByLabel('Pickup end (Malaysia time)').fill('21:55');
  await scenario('Staff action failure'); await confirm('Publish meal'); await expect(editor.getByRole('alert')).toContainText('Staff action failed');
  await expect(cards).toHaveCount(beforePublish); await expect(page.getByLabel('Meal name', { exact: true })).toHaveValue('Sample evening rice');
  await scenario('Available'); await confirm('Publish meal'); await expect(cards).toHaveCount(beforePublish + 1); await expect(editor).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Publish meal', exact: true })).toBeDisabled();
  expect(await cards.first().evaluate(el => !!(document.querySelector('form[aria-label="Meal editor"]').compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const meal = (await stored()).offers.find(o => o.name === 'Sample evening rice'); expect(meal).toBeTruthy(); expect(meal.bookingCutoff).toBe(meal.pickupStart); expect(meal.cancellationCutoff).toBe(meal.pickupStart); expect(meal.image).toBe('/missing-demo-image.webp');
  await page.getByRole('button', { name: 'Create another offer' }).click(); await page.getByLabel('Meal', { exact: true }).selectOption('Nasi ayam goreng');
  await page.getByLabel('Description', { exact: true }).fill('Meal description supplied by staff.'); await page.getByLabel('Pickup location').fill('Sample counter'); await page.getByLabel('Collection instructions', { exact: true }).fill('Show your reference.');
  await page.getByLabel('Vendor price (RM)').fill('6.25'); await page.getByLabel('Available quantity').fill('2'); await page.getByLabel('Pickup start (Malaysia time)').fill('21:40'); await page.getByLabel('Pickup end (Malaysia time)').fill('21:55');
  await confirm('Publish meal'); await expect(cards).toHaveCount(beforePublish + 2); await expect(editor).toHaveCount(1); expect((await stored()).offers.at(-1).vendorPriceSen).toBe(625);
  await page.goto(`${base}/meals/${meal.id}`); await page.reload(); await expect(page.getByText('Photo unavailable', { exact: true })).toBeVisible();
  await role('guest'); await page.getByRole('link', { name: 'View Sample evening rice', exact: true }).click(); await page.getByRole('link', { name: 'Reserve', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click(); await expect(page).toHaveURL(`${base}/reserve/${meal.id}`);
  await page.getByLabel('Sample phone', { exact: true }).fill('0100000000'); await page.getByRole('button', { name: 'Save sample profile' }).click(); await page.getByRole('button', { name: 'Confirm sample reservation' }).click(); await expect(page.getByRole('heading', { name: 'Your pickup pass' })).toBeVisible();
  const pass = page.url(); const reservation = (await stored()).reservations.at(-1); await page.reload(); await expect(page.getByText(reservation.reference, { exact: true })).toBeVisible();
  await role('staff'); await page.getByLabel('Find by pickup reference (all service dates)').fill(reservation.reference);
  await expect(page.getByRole('button', { name: 'Complete collected and paid', exact: true })).toBeDisabled(); await page.getByLabel('Meal handed over', { exact: true }).check(); await expect(page.getByRole('button', { name: 'Complete collected and paid', exact: true })).toBeDisabled(); await page.getByLabel('Payment received', { exact: true }).check();
  await scenario('Staff action failure'); await confirm('Complete collected and paid'); await expect(page.getByText(/Staff action failed/)).toBeVisible(); expect((await stored()).reservations.at(-1).status).toBe('reserved');
  await scenario('Available'); await confirm('Complete collected and paid'); await expect(page.getByRole('button', { name: 'Complete collected and paid', exact: true })).toHaveCount(0); expect((await stored()).events.filter(e => e.to === 'completed')).toHaveLength(1);
  await page.reload(); await expect(page.getByTestId('Completed units')).toHaveText('1'); await expect(page.getByTestId('Vendor proceeds')).toHaveText('RM7.00'); await expect(page.getByTestId('EcoBiz fees owed')).toHaveText('RM0.50'); await expect(page.getByTestId('Fees settled')).toHaveText('RM0.00'); await expect(page.getByTestId('Outstanding balance')).toHaveText('RM0.50');
  await role('sample-profile'); await page.goto(pass); await expect(page.getByRole('heading', { name: 'Completed', exact: true })).toBeVisible(); await page.goto(base); await expect(page.getByRole('heading', { name: 'No active reservation' })).toBeVisible(); await page.goto(`${base}/reservations`); await expect(page.getByRole('heading', { name: 'Sample evening rice' })).toBeVisible();
  await role('staff');
  await expect(page.getByRole('heading', { name: 'Record fee settlement' })).toHaveCount(0); await expect(page.getByRole('heading', { name: 'Record a signed correction' })).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download sample CSV' }).click(); const download = await downloadPromise; const csv = await readFile(await download.path(), 'utf8'); expect(csv).toContain('"TOTAL"'); expect(csv).toContain('"1","700","50","0","50","RM7.00","RM0.50","RM0.00","RM0.50"'); expect(csv).not.toContain('0100000000');
  await expect(page.getByRole('heading', { name: 'Settlement and correction evidence' })).toHaveCount(0);
  await expect(page.locator('main section section').last().getByRole('heading', { name: 'Evening close', exact: true })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Staff navigation' });
  await expect(nav.getByRole('link')).toHaveText(['Operations', 'Offers', 'Help']);
  for (const label of ['Operations', 'Offers', 'Help']) {
    const link = nav.getByRole('link', { name: label, exact: true }); await link.click(); await expect(link).toHaveAttribute('aria-current', 'page');
    if (label === 'Operations') await expect(page.getByRole('heading', { name: 'Evening operations' })).toBeVisible();
    if (label === 'Offers') { await expect(page.getByRole('form', { name: 'Meal editor' })).toHaveCount(1); await expect(page.getByRole('link', { name: 'Edit Chicken rice', exact: true })).toBeVisible(); }
    if (label === 'Help') await expect(page.locator('main details')).toHaveCount(10);
    expect(await link.evaluate(el => el.querySelector('svg').getBoundingClientRect().bottom <= el.querySelector('span').getBoundingClientRect().top)).toBe(true);
  }
  await page.goto(base + '/help'); const faqs = page.locator('main details'); await expect(faqs).toHaveCount(10);
  await faqs.nth(0).locator('summary').focus(); await page.keyboard.press('Enter'); await faqs.nth(1).locator('summary').click();
  await expect(faqs.nth(0)).toHaveAttribute('open', ''); await expect(faqs.nth(1)).toHaveAttribute('open', '');
  await capture('faq'); await page.goto(base + '/ops');
  for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(); await capture(`operations-${width}`); }
  await page.goto(`${base}/ops/offers/${meal.id}`); await page.getByLabel('Vendor price (integer sen)').fill('800'); await confirm('Save offer'); await expect(page).toHaveURL(`${base}/ops`); expect((await stored()).reservations.at(-1).meal.vendorPriceSen).toBe(700);
  for (const route of ['/ops', '/ops/offers/new', `/ops/offers/${meal.id}`, '/help', '/privacy', '/terms', '/auth/callback']) { await page.goto(base + route); await page.reload(); await expect(page.locator('main h1')).toBeVisible(); await noOverflow(); }
  await page.goto(`${base}/ops/offers/unknown`); await expect(page.getByRole('heading', { name: 'Offer not found' })).toBeVisible();
  await page.goto(`${base}/ops`); await page.getByLabel('Find by pickup reference (all service dates)').fill('MISSING-REFERENCE'); await expect(page.getByText(/No matching sample reservation/)).toBeVisible();
  for (const value of ['Loading', 'Load error', 'Server error', 'Permission denied']) { await scenario(value); await expect(page.locator('main h1')).toBeVisible(); } await scenario('Available');
  await role('sample-profile'); await page.goto(`${base}/reserve/chicken-rice`); await page.getByRole('button', { name: 'Confirm sample reservation' }).click(); await expect(page.getByRole('heading', { name: 'Your pickup pass' })).toBeVisible(); const active = (await stored()).reservations.at(-1);
  await role('staff'); await page.goto(`${base}/ops/offers/chicken-rice`); await expect(page.getByLabel('Meal name', { exact: true })).toHaveAttribute('readonly', ''); await page.getByLabel('Available unreserved stock').fill('5'); await confirm('Save offer'); await expect(page).toHaveURL(`${base}/ops`);
  await page.goto(`${base}/ops/offers/chicken-rice`); await page.getByLabel('Withdrawal reason', { exact: true }).fill('Sample kitchen unavailable'); await confirm('Withdraw offer'); await expect(page.getByText('This offer is withdrawn. Create a new offer to publish again.')).toBeVisible(); expect((await stored()).reservations.find(r => r.id === active.id).status).toBe('cancelled');
  await role('sample-profile'); await page.goto(`${base}/reservations/${active.id}`); await expect(page.getByText(/Vendor withdrawal: Sample kitchen unavailable/)).toBeVisible();
  await page.goto(`${base}/reserve/fish-rice`); await page.getByRole('button', { name: 'Confirm sample reservation' }).click(); await expect(page.getByRole('heading', { name: 'Your pickup pass' })).toBeVisible();
  await role('staff'); await page.getByLabel('I have reconciled all handovers for this service date').check(); await confirm('Close evening'); await expect(page.getByText(/Evening close is allowed only after all pickup windows end/)).toBeVisible();
  await scenario('No-show review'); await page.getByLabel('I have reconciled all handovers for this service date').check(); await confirm('Close evening'); await expect(page.getByText(/Evening closed: 1 new no-show/)).toBeVisible(); const eventCount = (await stored()).events.length; await confirm('Close evening'); await expect(page.getByText(/Evening closed: 0 new no-show/)).toBeVisible(); expect((await stored()).events.length).toBe(eventCount);
  await role('guest'); await page.goto(`${base}/ops/offers/${meal.id}`); await expect(page.getByRole('heading', { name: 'Permission denied' })).toBeVisible(); expect(errors).toEqual([]);
  console.log('PASS: staff publish → customer booking/refresh → collected AND paid → history → reports → CSV; templates/custom cards, publish retry, FAQ, navigation, withdrawal, no-show, permissions, failure, routes, images, keyboard and 320/390/1440px layouts');
} finally { await browser.close(); }


