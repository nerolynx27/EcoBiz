import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const base = process.env.BASE_URL || 'http://127.0.0.1:3001';
const errors = []; page.on('pageerror', e => errors.push(e.message));
await mkdir('screenshots', { recursive: true });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('ecobiz-demo-v2')));
async function controls() { if (await page.locator('details').getAttribute('open') === null) await page.locator('summary').click(); }
async function scenario(value) { await controls(); await page.getByLabel('Review scenario').selectOption(value); }
async function reset() { await controls(); await page.getByRole('button', { name: 'Reset demo', exact: true }).click(); await expect(page).toHaveURL(`${base}/`); }
async function review(meal = 'chicken-rice') {
  await page.goto(`${base}/reserve/${meal}`);
  await expect(page.getByRole('heading', { name: 'Sign in to reserve' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click();
  await expect(page).toHaveURL(`${base}/reserve/${meal}`);
  if (await page.getByLabel('Sample phone', { exact: true }).count()) {
    await page.getByLabel('Sample display name').fill('Sample Student');
    await page.getByLabel('Sample phone', { exact: true }).fill('0100000000');
    await page.getByRole('button', { name: 'Save sample profile' }).click();
  }
}
async function cancelBooking() {
  await page.getByRole('button', { name: 'Cancel reservation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep reservation' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Cancel reservation', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Yes, cancel reservation' }).click();
}
async function capture(name) { const viewport = page.viewportSize(); await page.evaluate(() => window.scrollTo(0, 0)); await page.setViewportSize({ width: viewport.width, height: await page.evaluate(() => document.documentElement.scrollHeight) }); await page.screenshot({ path: `screenshots/part2-${name}.png`, fullPage: true }); await page.setViewportSize(viewport); }
async function noOverflow() { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
try {
  await page.goto(base); await expect(page.getByRole('heading', { name: 'Tonight’s good food' })).toBeVisible();
  await page.getByRole('link', { name: 'View Chicken rice', exact: true }).click();
  await page.getByRole('link', { name: 'Reserve', exact: true }).click();
  await expect(page).toHaveURL(/sign-in\?returnTo=%2Freserve%2Fchicken-rice/);
  await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click();
  await expect(page).toHaveURL(`${base}/reserve/chicken-rice`);
  await page.getByLabel('Sample display name').fill('');
  await page.getByRole('button', { name: 'Save sample profile' }).click();
  await expect(page.getByLabel('Sample display name')).toBeFocused();
  await expect(page.locator('#name-error')).toBeVisible();
  for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(); await capture('profile-' + width); }
  await page.getByLabel('Sample display name').fill('Sample Student');
  await page.getByLabel('Sample phone', { exact: true }).fill('0100000000');
  await page.getByRole('button', { name: 'Save sample profile' }).click();
  await expect(page.getByRole('button', { name: 'Confirm sample reservation' })).toBeFocused();
  for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(); await capture(`review-${width}`); }
  await page.getByRole('button', { name: 'Confirm sample reservation' }).click();
  await expect(page.getByRole('heading', { name: 'Your pickup pass' })).toBeVisible();
  const passURL = page.url(); let state = await stored();
  expect(state.offers[0].remainingStock).toBe(3); expect(state.reservations.filter(r => r.status === 'reserved')).toHaveLength(1);
  await expect(page.getByText('RM7.50', { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByRole('heading', { name: 'Reserved — pay at pickup' })).toBeVisible();
  for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(); await capture(`pass-${width}`); }
  await page.getByRole('navigation').getByRole('link', { name: 'My reservations', exact: true }).click();
  await page.getByRole('link', { name: /Open pickup pass/ }).click(); await expect(page).toHaveURL(passURL);
  await page.goto(`${base}/reserve/fish-rice`); await expect(page.getByRole('button', { name: 'Confirm sample reservation' })).toBeDisabled();
  await expect(page.getByText(/You already have an active reservation/)).toBeVisible();
  await page.goto(base); await expect(page.getByRole('heading', { name: 'Your meal is reserved' })).toBeVisible();
  await page.getByRole('link', { name: /View reservation/ }).click();
  await cancelBooking(); await expect(page.getByRole('heading', { name: 'Cancelled', exact: true })).toBeVisible();
  expect((await stored()).offers[0].remainingStock).toBe(4);
  await page.reload(); expect((await stored()).offers[0].remainingStock).toBe(4);
  await page.goto(base); await expect(page.getByRole('heading', { name: 'No active reservation' })).toBeVisible();
  await page.goto(`${base}/reservations`); await expect(page.getByText('Completed', { exact: true })).toBeVisible(); await expect(page.getByText('No-show — pickup missed', { exact: true })).toBeVisible(); await capture('history');
  await page.goto(`${base}/account`); await page.getByLabel('Sample display name').fill('Updated Sample'); await page.getByRole('button', { name: 'Save sample profile' }).click();
  await page.goto(base); await expect(page.getByText('Updated Sample', { exact: true })).toBeVisible();
  await page.goto(`${base}/account`); await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.goto(passURL); await expect(page.getByRole('heading', { name: 'Sign in to reserve' })).toBeVisible(); await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click(); await expect(page).toHaveURL(passURL);
  await controls(); await page.getByLabel('Demo session').selectOption('sample-other'); await expect(page.getByRole('heading', { name: 'Reservation unavailable' })).toBeVisible();
  await page.goto(`${base}/reservations`); await expect(page.getByRole('heading', { name: 'No reservations yet' })).toBeVisible();
  await reset(); await review();
  await scenario('Submission failure'); await page.getByRole('button', { name: 'Confirm sample reservation' }).click(); await expect(page.getByText(/Submission failed before creation/)).toBeVisible(); expect((await stored()).offers[0].remainingStock).toBe(4);
  const attempt = (await stored()).attempts['sample-profile:chicken-rice'];
  await scenario('Response lost'); await page.getByRole('button', { name: 'Confirm sample reservation' }).click(); await expect(page.getByText('Checking reservation', { exact: true })).toBeVisible(); await expect(page.getByText('Reservation recovered. Stock was reserved once.')).toBeVisible();
  state = await stored(); expect(state.offers[0].remainingStock).toBe(3); expect(state.reservations.at(-1).requestKey).toBe(attempt);
  await scenario('Cancellation failure'); await cancelBooking(); await expect(page.getByText('Cancellation failed. Nothing changed. Please retry.')).toBeVisible(); expect((await stored()).offers[0].remainingStock).toBe(3);
  await scenario('Stale reservation'); await expect(page.getByText(/Offer withdrawn — this pass is stale/)).toBeVisible();
  await scenario('Available'); await cancelBooking(); await expect(page.getByRole('heading', { name: 'Cancelled', exact: true })).toBeVisible(); expect((await stored()).offers[0].status).toBe('withdrawn');
  await reset(); await review(); await scenario('Duplicate confirmation'); await page.getByRole('button', { name: 'Confirm sample reservation' }).dblclick(); await expect(page.getByRole('heading', { name: 'Your pickup pass' })).toBeVisible(); expect((await stored()).offers[0].remainingStock).toBe(3); expect((await stored()).reservations.filter(r => r.status === 'reserved')).toHaveLength(1);
  await controls(); await page.getByLabel('Demo clock').selectOption('2026-10-01T13:40:00Z'); await expect(page.getByRole('button', { name: 'Cancel reservation', exact: true })).toHaveCount(0); await expect(page.getByText('Cancellation cutoff has passed. Contact support for assistance.')).toBeVisible(); await page.getByLabel('Demo clock').selectOption('2026-10-01T13:15:00Z');
  await scenario('Vendor cancellation'); await expect(page.getByText('Sample vendor cannot fulfil this meal.')).toBeVisible();
  await reset(); await review('fish-rice'); await scenario('Existing active reservation'); await expect(page.getByRole('button', { name: 'Confirm sample reservation' })).toBeDisabled();
  await reset(); await review(); await scenario('Last meal taken'); await page.getByRole('button', { name: 'Confirm sample reservation' }).click(); await expect(page.locator('main').getByText('Sold out', { exact: true })).toBeVisible(); expect((await stored()).reservations.filter(r => r.status === 'reserved')).toHaveLength(0);
  await reset(); await review(); await controls(); await page.getByLabel('Demo clock').selectOption('2026-10-01T13:40:00Z'); await expect(page.getByRole('button', { name: 'Confirm sample reservation' })).toBeDisabled();
  await page.getByLabel('Demo clock').selectOption('2026-10-01T13:41:00Z'); await expect(page.getByRole('button', { name: 'Confirm sample reservation' })).toBeDisabled();
  await reset(); await page.goto(`${base}/meals/chicken-rice`);
  for (const value of ['Sold out', 'Closed', 'Unpublished', 'Withdrawn']) { await scenario(value); await expect(page.getByRole('link', { name: 'Reserve', exact: true })).toHaveCount(0); }
  await reset(); await page.goto(`${base}/meals/fish-rice`); await expect(page.getByText('Dietary information not provided', { exact: true })).toBeVisible();
  await page.goto(base); await scenario('Loading'); await expect(page.getByText(/Loading sample meals/)).toBeVisible();
  for (const value of ['Empty list', 'Unpublished']) { await scenario(value); await expect(page.getByRole('heading', { name: 'No meals listed tonight' })).toBeVisible(); }
  await scenario('Load error'); await page.getByRole('button', { name: 'Retry loading meals' }).click(); await expect(page.locator('article')).toHaveCount(2);
  await scenario('Failed image'); await expect(page.getByText('Photo unavailable', { exact: true })).toHaveCount(2);
  await scenario('Long names'); for (const width of [320, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(); }
  await reset();
  for (const value of ['Sign-in error', 'Sign-in cancelled']) { await scenario(value); await page.goto(`${base}/sign-in?returnTo=%2Freserve%2Ffish-rice`); await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click(); await expect(page.getByRole('button', { name: 'Continue with demo account', exact: true })).toBeEnabled(); expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/reserve/fish-rice'); }
  await scenario('Available'); await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click(); await expect(page).toHaveURL(`${base}/reserve/fish-rice`);
  for (const route of ['/help', '/privacy', '/terms', '/account', '/reservations']) { await page.goto(base + route); await page.reload(); await expect(page.locator('main h1')).toBeVisible(); await noOverflow(); }
  await page.goto(`${base}/meals/unknown`); await expect(page.getByRole('heading', { name: 'Meal not found' })).toBeVisible();
  await page.goto(base); await page.evaluate(() => localStorage.setItem('ecobiz-demo-v2', '{broken')); await page.reload(); await expect(page.getByText('Invalid or outdated sample state was reset.')).toBeVisible();
  await page.goto(`${base}/sign-in?returnTo=${encodeURIComponent('//example.com')}`); await page.getByRole('button', { name: 'Continue with demo account', exact: true }).click(); await expect(page).toHaveURL(`${base}/`);
  await page.goto(base); await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await controls(); await page.getByRole('button', { name: 'Reset demo', exact: true }).focus(); expect(await page.getByRole('button', { name: 'Reset demo', exact: true }).evaluate(el => el.getBoundingClientRect().bottom <= document.querySelector('nav').getBoundingClientRect().top)).toBe(true);
  const blocked = await browser.newContext(); await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; }); const blockedPage = await blocked.newPage(); await blockedPage.goto(base); await expect(blockedPage.getByText(/refresh recovery is unavailable/)).toBeVisible(); await blocked.close();
  expect(errors).toEqual([]);
  console.log('PASS: complete customer journey, refresh/sign-out recovery, one stock allocation/restoration, account ownership, all recovery scenarios, safe paths/storage, Part 1 discovery, responsive widths, keyboard dialog/errors/focus, nav clearance and no page errors.');
} finally { await browser.close(); }



await import('./staff-browser.mjs');


