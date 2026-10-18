export type Vendor = { id: string; name: string; campus: string; location: string; instructions: string };
export type Profile = { id: string; displayName: string; phone: string };
export type Offer = {
  id: string; vendorId: string; name: string; description: string; portion: string;
  image: string; location?: string; instructions?: string; dietaryNotes?: string; vendorPriceSen: number; feeSen: number;
  remainingStock: number; serviceDate: string; bookingCutoff: string; cancellationCutoff: string;
  pickupStart: string; pickupEnd: string; status: 'published' | 'unpublished' | 'withdrawn' | 'closed';
};
export type Reservation = { id: string; customerId: string; offerId: string; status: 'reserved' | 'completed' | 'cancelled' | 'no_show'; requestKey: string; reference: string; quantity: 1; createdAt: string; completedAt?: string; cancelledAt?: string; reason?: string; meal: Offer; vendor: Vendor };
export const profile: Profile = { id: 'sample-profile', displayName: 'Muaz', phone: '' };
export const vendor: Vendor = { id: 'sample-vendor', name: 'Cabin Vendor', campus: 'UNITEN', location: 'Sample collection point · UNITEN campus', instructions: 'For this demo, imagine collecting at the vendor counter. The exact cabin and collection directions must be confirmed before a live pilot.' };
export const defaultTime = '2026-10-01T13:15:00Z';
const timing = { serviceDate: '2026-10-01', bookingCutoff: '2026-10-01T13:40:00Z', cancellationCutoff: '2026-10-01T13:40:00Z', pickupStart: '2026-10-01T13:40:00Z', pickupEnd: '2026-10-01T13:55:00Z' };
export const offers: Offer[] = [
  { id: 'chicken-rice', vendorId: vendor.id, name: 'Chicken rice', description: 'Tender sliced chicken over fragrant rice, with cucumber and a separate chilli sauce. A simple, satisfying evening meal.', portion: 'One meal unit · one individual portion', image: '/chicken-rice.webp', dietaryNotes: 'Sample vendor note: contains soy and wheat in the sauce. Prepared in a shared kitchen; other allergens may be present.', vendorPriceSen: 700, feeSen: 50, remainingStock: 4, status: 'published', ...timing },
  { id: 'fish-rice', vendorId: vendor.id, name: 'Fish rice', description: 'Grilled fish with rice, cucumber and a spoonful of sambal. Photo is illustrative; the actual meal may differ.', portion: 'One meal unit · one individual portion', image: '/fish-rice.webp', vendorPriceSen: 600, feeSen: 50, remainingStock: 3, status: 'published', ...timing },
];
export const scenarios = ['Available', 'Sold out', 'Closed', 'Unpublished', 'Withdrawn', 'Empty list', 'Loading', 'Load error', 'Failed image', 'Long names', 'Last meal taken', 'Duplicate confirmation', 'Submission failure', 'Response lost', 'Cancellation failure', 'Stale reservation', 'Vendor cancellation', 'Existing active reservation', 'Empty history', 'Sign-in error', 'Sign-in cancelled', 'Staff action failure', 'Permission denied', 'Server error', 'No-show review', 'Withdrawal review'] as const;
export type Scenario = typeof scenarios[number];
export function scenarioOffer(offer: Offer, scenario: Scenario): Offer {
  return { ...offer, remainingStock: scenario === 'Sold out' ? 0 : offer.remainingStock,
    status: scenario === 'Closed' ? 'closed' : scenario === 'Unpublished' ? 'unpublished' : scenario === 'Withdrawn' ? 'withdrawn' : offer.status,
    image: scenario === 'Failed image' ? '/missing-demo-image.webp' : offer.image,
    name: scenario === 'Long names' ? `${offer.name} with fragrant rice, cucumber and house-style sauce` : offer.name };
}
export function availability(offer: Offer, now: string): string {
  if (offer.status === 'unpublished') return 'Not published';
  if (offer.status === 'withdrawn') return 'Offer withdrawn';
  if (offer.status === 'closed') return 'Reservations closed';
  const timestamp = Date.parse(now);
  if (!Number.isFinite(timestamp) || timestamp >= Date.parse(offer.pickupEnd) || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(timestamp)) !== offer.serviceDate) return 'Reservations closed';
  if (timestamp >= Date.parse(offer.bookingCutoff)) return 'Reservations closed';
  if (offer.remainingStock <= 0) return 'Sold out';
  return 'Available';
}
export const totalSen = (offer: Offer) => offer.vendorPriceSen + offer.feeSen;
export const money = (sen: number) => `RM${(sen / 100).toFixed(2)}`;
export const time = (iso: string) => new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));
export const serviceDate = (date: string) => new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00+08:00`));
export const pickup = (offer: Offer) => `${time(offer.pickupStart).replace(/\s?pm/i, '')}–${time(offer.pickupEnd)}`;

export const storageKey = 'ecobiz-demo-v2';
export type DemoState = { version: 3; staff: { actorId: string; vendorId: string } | null; events: ReservationEvent[]; settlements: Settlement[]; adjustments: Adjustment[]; session: string | null; profiles: Profile[]; offers: Offer[]; reservations: Reservation[]; now: string; scenario: Scenario; attempts: Record<string, string> };
export function freshState(): DemoState {
  const history = (['completed', 'cancelled', 'no_show'] as const).map((status, index): Reservation => {
    const date = `2026-09-${28 - index}`;
    const meal = { ...offers[index % 2], serviceDate: date, bookingCutoff: `${date}T13:40:00Z`, cancellationCutoff: `${date}T13:40:00Z`, pickupStart: `${date}T13:40:00Z`, pickupEnd: `${date}T13:55:00Z` };
    return { id: `sample-${status}`, customerId: profile.id, offerId: meal.id, status, requestKey: `seed-${status}`, reference: `DEMO-${101 + index}`, quantity: 1, createdAt: `${date}T13:15:00Z`, meal, vendor: { ...vendor, location: meal.location ?? vendor.location, instructions: meal.instructions ?? vendor.instructions } };
  });
  return { version: 3, staff: null, events: [], settlements: [], adjustments: [], session: null, profiles: [{ ...profile }, { id: 'sample-other', displayName: 'Alex', phone: '0100000000' }], offers: structuredClone(offers), reservations: history, now: defaultTime, scenario: 'Available', attempts: {} };
}
export function safeReturn(path: unknown): string {
  return typeof path === 'string' && /^(\/(?:account|reservations|help|privacy|terms)?|\/(?:reserve|meals|reservations)\/[a-zA-Z0-9-]+)$/.test(path) ? path : '/';
}
export function profileErrors(name: string, phone: string) {
  return { displayName: name.trim().length < 2 || name.trim().length > 60 ? 'Enter a sample name of 2–60 characters.' : '', phone: !/^\+?[0-9][0-9 ()-]{7,19}$/.test(phone.trim()) || phone.replace(/\D/g, '').length < 9 || phone.replace(/\D/g, '').length > 15 ? 'Enter a sample phone with 9–15 digits, e.g. 0100000000.' : '' };
}
export const activeReservation = (state: DemoState) => state.reservations.find(r => r.customerId === state.session && r.status === 'reserved');
export const findRequest = (state: DemoState, key: string) => state.reservations.find(r => r.customerId === state.session && r.requestKey === key);
export function saveProfile(state: DemoState, name: string, phone: string) {
  const current = state.profiles.find(p => p.id === state.session);
  if (!current) throw new Error('Sign in to continue.');
  const errors = profileErrors(name, phone);
  if (errors.displayName || errors.phone) throw new Error(errors.displayName || errors.phone);
  current.displayName = name.trim(); current.phone = phone.trim();
}
// Local demo mutations only: no cross-tab or multi-user transaction guarantees.
export function book(state: DemoState, offerId: string, requestKey: string): Reservation {
  if (state.staff) throw new Error('Switch to customer mode to reserve.');
  const customer = state.profiles.find(p => p.id === state.session);
  if (!customer) throw new Error('Sign in to continue.');
  if (!requestKey || requestKey.length > 160) throw new Error('Invalid booking attempt.');
  const existing = findRequest(state, requestKey);
  if (existing) {
    if (existing.offerId !== offerId) throw new Error('This request key belongs to another meal.');
    return existing;
  }
  const errors = profileErrors(customer.displayName, customer.phone);
  if (errors.displayName || errors.phone) throw new Error('Complete your sample profile first.');
  if (activeReservation(state)) throw new Error('You already have an active reservation. Open My reservations to view it.');
  const source = state.offers.find(o => o.id === offerId);
  if (!source) throw new Error('Meal not found.');
  const meal = scenarioOffer(source, state.scenario);
  const status = availability(meal, state.now);
  if (status !== 'Available') throw new Error(status);
  const id = `demo-${crypto.randomUUID()}`;
  const reservation: Reservation = { id, customerId: customer.id, offerId, status: 'reserved', requestKey, reference: `DEMO-${id.slice(-8).toUpperCase()}`, quantity: 1, createdAt: state.now, meal: { ...meal }, vendor: { ...vendor, location: meal.location ?? vendor.location, instructions: meal.instructions ?? vendor.instructions } };
  state.reservations.push(reservation);
  source.remainingStock -= 1;
  return reservation;
}
export function cancel(state: DemoState, id: string) {
  if (state.staff) throw new Error('Use staff cancellation in Operations.');
  const record = state.reservations.find(r => r.id === id && r.customerId === state.session);
  if (!state.session || !record) throw new Error('Reservation unavailable.');
  if (record.status === 'cancelled') return;
  if (record.status !== 'reserved') throw new Error('This reservation is final and cannot be cancelled.');
  if (!Number.isFinite(Date.parse(state.now)) || Date.parse(state.now) >= Date.parse(record.meal.cancellationCutoff)) throw new Error('Cancellation cutoff has passed or the clock is invalid. Please contact support.');
  if (state.scenario === 'Cancellation failure') throw new Error('Cancellation failed. Nothing changed. Please retry.');
  state.events.push({ id: crypto.randomUUID(), reservationId: record.id, actorId: state.session, at: state.now, from: 'reserved', to: 'cancelled', reason: 'Cancelled by demo customer.' });
  record.status = 'cancelled'; record.cancelledAt = state.now; record.reason = 'Cancelled by demo customer.';
  const offer = state.offers.find(o => o.id === record.offerId);
  if (offer) offer.remainingStock += 1;
}
export function applyScenario(state: DemoState, scenario: Scenario) {
  state.scenario = scenario;

  // Keep records with audit/financial evidence; this control only clears untouched sample history.
  if (scenario === 'Empty history') state.reservations = state.reservations.filter(r => r.customerId !== state.session || r.status === 'reserved' || state.events.some(e => e.reservationId === r.id) || state.settlements.some(s => s.reservationIds.includes(r.id)) || state.adjustments.some(a => a.targetId === r.id));
  if (scenario === 'Existing active reservation' && state.session && !activeReservation(state)) {
    if (state.staff) throw new Error('Switch to customer mode to reserve.');
  const customer = state.profiles.find(p => p.id === state.session)!;
    if (!customer.phone) customer.phone = '0100000000';
    book(state, state.offers[0].id, `scenario-${crypto.randomUUID()}`);
  }
  if (scenario === 'Stale reservation' || scenario === 'Vendor cancellation') {
    const active = activeReservation(state);
    if (active) {
      state.offers.find(o => o.id === active.offerId)!.status = 'withdrawn';
      if (scenario === 'Vendor cancellation') { active.status = 'cancelled'; active.reason = 'Sample vendor cannot fulfil this meal.'; active.cancelledAt = state.now; state.offers.find(o => o.id === active.offerId)!.remainingStock += 1; }
    }
  }
}
// Validate the complete persisted shape before rendering it. Invalid/old demos reset together.
export function restoreState(raw: string | null): { state: DemoState; reset: boolean } {
  if (!raw) return { state: freshState(), reset: false };
  try {
    const value = JSON.parse(raw);
    // Retire review labels without discarding saved agreements or financial history.
    if (value?.scenario === 'Expired') value.scenario = 'Closed';
    if (['Settlement review', 'Correction review'].includes(value?.scenario)) value.scenario = 'Available';
    if (value?.version === 2) Object.assign(value, { version: 3, staff: null, events: [], settlements: [], adjustments: [] });
    const text = (v: unknown) => typeof v === 'string' && v.length <= 4000;
    const utc = (v: unknown) => typeof v === 'string' && /^\d{4}-\d\d-\d\dT.*Z$/.test(v) && Number.isFinite(Date.parse(v));
    const validOffer = (o: Offer) => o && ['id', 'vendorId', 'name', 'description', 'portion', 'image'].every(k => text(o[k as keyof Offer])) && [o.dietaryNotes, o.location, o.instructions].every(v => v === undefined || text(v)) && /^\d{4}-\d\d-\d\d$/.test(o.serviceDate) && Number.isFinite(Date.parse(o.serviceDate)) && [o.bookingCutoff, o.cancellationCutoff, o.pickupStart, o.pickupEnd].every(utc) && ['published', 'unpublished', 'withdrawn', 'closed'].includes(o.status) && [o.vendorPriceSen, o.feeSen, o.remainingStock].every(n => Number.isSafeInteger(n) && n >= 0) && o.vendorPriceSen > 0 && Number.isSafeInteger(o.vendorPriceSen + o.feeSen);
    if (value.version !== 3 || !Array.isArray(value.profiles) || !value.profiles.length || !value.profiles.every((p: Profile) => p && text(p.id) && text(p.displayName) && text(p.phone)) || !(value.session === null || value.profiles.some((p: Profile) => p.id === value.session)) || !Array.isArray(value.offers) || !value.offers.every((o: Offer) => validOffer(o) && o.vendorId === vendor.id && (o.location === undefined || text(o.location)) && (o.instructions === undefined || text(o.instructions))) || new Set(value.offers.map((o: Offer) => o.id)).size !== value.offers.length || !utc(value.now) || !scenarios.includes(value.scenario) || !value.attempts || typeof value.attempts !== 'object' || Array.isArray(value.attempts) || !Object.values(value.attempts).every(text) || !Array.isArray(value.reservations)) throw new Error();
    for (const r of value.reservations as Reservation[]) {
      if (!r || ![r.id, r.customerId, r.offerId, r.requestKey, r.reference].every(text) || !['reserved', 'completed', 'cancelled', 'no_show'].includes(r.status) || r.quantity !== 1 || !utc(r.createdAt) || (r.completedAt !== undefined && !utc(r.completedAt)) || (r.cancelledAt !== undefined && !utc(r.cancelledAt)) || (r.reason !== undefined && !text(r.reason)) || !validOffer(r.meal) || !r.vendor || !Object.values(r.vendor).every(text) || !['id', 'name', 'location', 'campus', 'instructions'].every(k => text(r.vendor[k as keyof Vendor])) || !value.profiles.some((p: Profile) => p.id === r.customerId) || !value.offers.some((o: Offer) => o.id === r.offerId) || r.meal.id !== r.offerId || r.vendor.id !== vendor.id) throw new Error();
    }
    const records = value.reservations as Reservation[];
    if (new Set(records.map(r => r.id)).size !== records.length || new Set(records.map(r => `${r.customerId}:${r.requestKey}`)).size !== records.length || new Set(records.filter(r => r.status === 'reserved').map(r => r.customerId)).size !== records.filter(r => r.status === 'reserved').length) throw new Error();
    if (!(value.staff === null || (value.staff?.actorId === 'demo-staff' && value.staff?.vendorId === vendor.id)) || !Array.isArray(value.events) || !Array.isArray(value.settlements) || !Array.isArray(value.adjustments)) throw new Error();
    for (const e of value.events as ReservationEvent[]) if (!e || !text(e.id) || !text(e.actorId) || !utc(e.at) || !text(e.reason) || e.from !== 'reserved' || !['completed', 'cancelled', 'no_show'].includes(e.to) || !records.some(r => r.id === e.reservationId)) throw new Error();
    const covered = new Set<string>();
    for (const s of value.settlements as Settlement[]) {
      if (!s || ![s.id, s.requestKey, s.actorId, s.evidence].every(text) || s.vendorId !== vendor.id || !utc(s.at) || !utc(s.recordedAt) || !Array.isArray(s.reservationIds) || !s.reservationIds.length || !Number.isSafeInteger(s.amountSen) || s.amountSen < 0) throw new Error();
      for (const id of s.reservationIds) { if (covered.has(id) || !records.some(r => r.id === id && r.status === 'completed' && r.meal.serviceDate === s.serviceDate)) throw new Error(); covered.add(id); }
      if (s.amountSen !== s.reservationIds.reduce((sum, id) => sum + records.find(r => r.id === id)!.meal.feeSen, 0)) throw new Error();
    }
    for (const a of value.adjustments as Adjustment[]) if (!a || ![a.id, a.requestKey, a.actorId, a.reason].every(text) || !utc(a.at) || a.vendorId !== vendor.id || ![a.vendorSen, a.feeSen].every(Number.isSafeInteger) || !(a.targetType === 'reservation' ? records.some(r => r.id === a.targetId && r.status === 'completed' && r.meal.serviceDate === a.serviceDate) : a.targetType === 'settlement' && a.vendorSen === 0 && value.settlements.some((s: Settlement) => s.id === a.targetId && s.serviceDate === a.serviceDate))) throw new Error();
    for (const items of [value.events, value.settlements, value.adjustments]) if (new Set(items.map((i: { id: string }) => i.id)).size !== items.length) throw new Error();
    for (const items of [value.settlements, value.adjustments]) if (new Set(items.map((i: { requestKey: string }) => i.requestKey)).size !== items.length) throw new Error();
    return { state: value, reset: false };
  } catch { return { state: freshState(), reset: true }; }
}


export type ReservationEvent = { id: string; reservationId: string; actorId: string; at: string; from: 'reserved'; to: Reservation['status']; reason: string };
export type Settlement = { id: string; requestKey: string; vendorId: string; serviceDate: string; reservationIds: string[]; amountSen: number; at: string; recordedAt: string; actorId: string; evidence: string };
export type Adjustment = { id: string; requestKey: string; vendorId: string; serviceDate: string; targetType: 'reservation' | 'settlement'; targetId: string; vendorSen: number; feeSen: number; reason: string; actorId: string; at: string };
export const supportContact: { label: string; href: string } | null = null;
export const malaysiaDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(iso));
export const localDateTime = (iso: string) => new Date(Date.parse(iso) + 8 * 3600000).toISOString().slice(0, 16);
export const fromMalaysia = (local: string) => { const date = new Date(`${local}:00+08:00`); return Number.isFinite(date.getTime()) ? date.toISOString() : ''; };

