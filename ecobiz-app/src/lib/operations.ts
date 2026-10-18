import { money, vendor, malaysiaDate, type DemoState, type Offer, type Reservation, type Settlement, type Adjustment } from './demo.ts';

export function requireStaff(state: DemoState) {
  if (!state.staff || state.staff.actorId !== 'demo-staff' || state.staff.vendorId !== vendor.id || state.scenario === 'Permission denied') throw new Error('Permission denied. Enter staff demo mode for the sample vendor.');
  return state.staff;
}
function mutateStaff(state: DemoState) {
  const staff = requireStaff(state);
  if (state.scenario === 'Staff action failure' || state.scenario === 'Server error' || state.scenario === 'Load error') throw new Error('Staff action failed (simulation). Nothing changed. Select Available and retry.');
  if (!Number.isFinite(Date.parse(state.now))) throw new Error('Invalid demo clock.');
  return staff;
}
const required = (value: unknown, label: string, max = 500) => { if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label} is required (maximum ${max} characters).`); };
const integer = (value: number, label: string, min = 0, max = 1000000) => { if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${label} must be a whole number from ${min} to ${max}.`); };
export function validateOffer(offer: Offer) {
  required(offer.id, 'Offer ID', 80); if (!/^[a-zA-Z0-9-]+$/.test(offer.id)) throw new Error('Invalid offer ID.');
  required(offer.name, 'Meal name', 120); required(offer.description, 'Description', 1500); if (offer.portion) required(offer.portion, 'Portion', 200);
  required(offer.location ?? vendor.location, 'Location', 300); required(offer.instructions ?? vendor.instructions, 'Collection instructions', 1000);
  if (offer.dietaryNotes && offer.dietaryNotes.length > 1000) throw new Error('Allergen notes must be at most 1000 characters.');
  integer(offer.remainingStock, 'Available stock', 0, 10000); integer(offer.vendorPriceSen, 'Vendor price in sen', 1); integer(offer.feeSen, 'Fee in sen');
  if (!/^\d{4}-\d\d-\d\d$/.test(offer.serviceDate) || !Number.isFinite(Date.parse(offer.serviceDate)) || new Date(offer.serviceDate).toISOString().slice(0, 10) !== offer.serviceDate) throw new Error('Choose a valid service date.');
  const dates = [offer.bookingCutoff, offer.cancellationCutoff, offer.pickupStart, offer.pickupEnd];
  if (!dates.every(d => /Z$/.test(d) && Number.isFinite(Date.parse(d)) && malaysiaDate(d) === offer.serviceDate) || Date.parse(offer.bookingCutoff) > Date.parse(offer.pickupStart) || Date.parse(offer.cancellationCutoff) > Date.parse(offer.pickupStart) || Date.parse(offer.pickupStart) >= Date.parse(offer.pickupEnd)) throw new Error('Cutoffs must be on the service date, no later than pickup start; pickup end must follow start.');
  if (!['published', 'unpublished', 'closed', 'withdrawn'].includes(offer.status)) throw new Error('Invalid publication status.');
  if (typeof offer.image !== 'string' || !(offer.image === '' || /^\/[a-zA-Z0-9_./-]+$/.test(offer.image) && !offer.image.startsWith('//') || offer.image.startsWith('blob:'))) throw new Error('Use a local sample image or a selected photo.');
}
export function saveOffer(state: DemoState, input: Offer) {
  const staff = mutateStaff(state);
  // Provisional demo policy: only new offers derive both cutoffs from pickup start.
  if (!state.offers.some(o => o.id === input.id)) input = { ...input, bookingCutoff: input.pickupStart, cancellationCutoff: input.pickupStart };
  validateOffer(input);
  if (input.vendorId !== staff.vendorId) throw new Error('Permission denied for this vendor.');
  const existing = state.offers.find(o => o.id === input.id);
  if (existing && existing.vendorId !== staff.vendorId) throw new Error('Permission denied for this offer.');
  if (input.status === 'withdrawn' || existing?.status === 'withdrawn') throw new Error('Withdrawn offers cannot be edited or republished. Create a new offer.');
  if (existing && state.reservations.some(r => r.offerId === input.id && r.status === 'reserved')) {
    const material: (keyof Offer)[] = ['name', 'description', 'portion', 'image', 'dietaryNotes', 'vendorPriceSen', 'feeSen', 'serviceDate', 'bookingCutoff', 'cancellationCutoff', 'pickupStart', 'pickupEnd', 'location', 'instructions'];
    const value = (o: Offer, key: keyof Offer) => ['bookingCutoff', 'cancellationCutoff', 'pickupStart', 'pickupEnd'].includes(key) ? Date.parse(String(o[key])) : o[key] ?? (key === 'location' ? vendor.location : key === 'instructions' ? vendor.instructions : '');
    if (material.some(key => value(existing, key) !== value(input, key))) throw new Error('This offer has active reservations. Only unreserved stock and publication status may change. Withdraw/cancel and publish a new offer to change the agreement.');
  }
  const saved = { ...input };
  if (existing) state.offers[state.offers.indexOf(existing)] = saved; else state.offers.push(saved);
  return saved;
}
function staffRecord(state: DemoState, id: string) {
  const staff = mutateStaff(state); const record = state.reservations.find(r => r.id === id && r.vendor.id === staff.vendorId);
  if (!record) throw new Error('Reservation unavailable for this vendor.');
  return record;
}
function transition(state: DemoState, record: Reservation, to: 'completed' | 'cancelled' | 'no_show', reason: string) {
  record.status = to;
  if (to === 'completed') record.completedAt = state.now;
  if (to === 'cancelled') { record.cancelledAt = state.now; record.reason = reason; }
  state.events.push({ id: crypto.randomUUID(), reservationId: record.id, actorId: state.staff!.actorId, at: state.now, from: 'reserved', to, reason });
}
export function complete(state: DemoState, id: string, collected: boolean, paid: boolean) {
  const record = staffRecord(state, id);
  if (collected !== true || paid !== true) throw new Error('Confirm both meal handed over and payment received.');
  if (record.status === 'completed') return record;
  if (record.status !== 'reserved') throw new Error('Only a reserved meal can be completed.');
  if (state.offers.find(o => o.id === record.offerId)?.status === 'withdrawn') throw new Error('Offer withdrawn. Do not hand over using this stale pass.');
  transition(state, record, 'completed', 'Staff confirmed collected AND paid.'); return record;
}
export function staffCancel(state: DemoState, id: string, reason: string) {
  const record = staffRecord(state, id); required(reason, 'Cancellation reason');
  if (record.status === 'cancelled') return;
  if (record.status !== 'reserved') throw new Error('Only a reserved meal can be cancelled.');
  const offer = state.offers.find(o => o.id === record.offerId);
  transition(state, record, 'cancelled', reason.trim());
  if (offer && offer.status !== 'withdrawn' && Date.parse(state.now) < Date.parse(offer.pickupEnd)) offer.remainingStock += 1;
}
export function withdraw(state: DemoState, id: string, reason: string, confirmed: boolean) {
  const staff = mutateStaff(state); required(reason, 'Withdrawal reason');
  if (confirmed !== true) throw new Error('Confirm withdrawal and affected reservations.');
  const offer = state.offers.find(o => o.id === id && o.vendorId === staff.vendorId);
  if (!offer) throw new Error('Offer unavailable for this vendor.');
  if (offer.status === 'withdrawn') return;
  offer.status = 'withdrawn';
  for (const record of state.reservations.filter(r => r.offerId === id && r.status === 'reserved')) transition(state, record, 'cancelled', `Vendor withdrawal: ${reason.trim()}`);
}
export function closeEvening(state: DemoState, date: string, reconciled: boolean) {
  const staff = mutateStaff(state);
  if (reconciled !== true) throw new Error('Confirm handovers have been reconciled.');
  const offers = state.offers.filter(o => o.vendorId === staff.vendorId && o.serviceDate === date);
  const records = state.reservations.filter(r => r.vendor.id === staff.vendorId && r.meal.serviceDate === date && r.status === 'reserved');
  const ends = [...offers.map(o => o.pickupEnd), ...records.map(r => r.meal.pickupEnd)];
  if (!ends.length || ends.some(end => Date.parse(state.now) <= Date.parse(end))) throw new Error('Evening close is allowed only after all pickup windows end.');
  for (const record of records) transition(state, record, 'no_show', 'Evening close: handovers reconciled; pickup missed.');
  return records.length;
}
export function settle(state: DemoState, reservationIds: string[], amountSen: number, evidence: string, requestKey: string, at: string): Settlement {
  const staff = mutateStaff(state); required(evidence, 'Evidence/reference'); required(requestKey, 'Request key', 160); integer(amountSen, 'Settlement amount', 1);
  if (!/Z$/.test(at) || !Number.isFinite(Date.parse(at)) || Date.parse(at) > Date.parse(state.now)) throw new Error('Settlement time must be valid and no later than the demo clock.');
  const ids = [...new Set(reservationIds)].sort();
  if (!ids.length || ids.length !== reservationIds.length) throw new Error('Select distinct completed reservations.');
  const previous = state.settlements.find(s => s.vendorId === staff.vendorId && s.requestKey === requestKey);
  if (previous) { if (JSON.stringify(previous.reservationIds) !== JSON.stringify(ids) || previous.amountSen !== amountSen || previous.evidence !== evidence.trim() || previous.at !== at) throw new Error('Request key already used for different settlement details.'); return previous; }
  const records = ids.map(id => state.reservations.find(r => r.id === id && r.status === 'completed' && r.vendor.id === staff.vendorId));
  if (records.some(r => !r) || new Set(records.map(r => r!.meal.serviceDate)).size !== 1) throw new Error('Select completed meals for one vendor and service date.');
  if (state.settlements.some(s => s.reservationIds.some(id => ids.includes(id)))) throw new Error('A selected reservation is already covered by a settlement.');
  if (amountSen !== records.reduce((sum, r) => sum + r!.meal.feeSen, 0)) throw new Error('Pilot rule: settle the full original EcoBiz fee for each selected reservation, once.');
  const settlement: Settlement = { id: `settlement-${crypto.randomUUID()}`, requestKey, vendorId: staff.vendorId, serviceDate: records[0]!.meal.serviceDate, reservationIds: ids, amountSen, at, recordedAt: state.now, actorId: staff.actorId, evidence: evidence.trim() };
  state.settlements.push(settlement); return settlement;
}
export function adjust(state: DemoState, targetType: Adjustment['targetType'], targetId: string, vendorSen: number, feeSen: number, reason: string, requestKey: string): Adjustment {
  const staff = mutateStaff(state); required(reason, 'Adjustment reason'); required(requestKey, 'Request key', 160);
  integer(vendorSen, 'Vendor adjustment', -1000000); integer(feeSen, 'Fee adjustment', -1000000);
  if (!vendorSen && !feeSen) throw new Error('Enter a non-zero correction.');
  const reservation = targetType === 'reservation' && state.reservations.find(r => r.id === targetId && r.status === 'completed' && r.vendor.id === staff.vendorId);
  const settlement = targetType === 'settlement' && state.settlements.find(s => s.id === targetId && s.vendorId === staff.vendorId);
  if (!reservation && !settlement) throw new Error('Select an original completed reservation or settlement.');
  if (settlement && vendorSen !== 0) throw new Error('Settlement corrections change settled fees only; vendor adjustment must be zero.');
  const previous = state.adjustments.find(a => a.vendorId === staff.vendorId && a.requestKey === requestKey);
  if (previous) { if (previous.targetType !== targetType || previous.targetId !== targetId || previous.vendorSen !== vendorSen || previous.feeSen !== feeSen || previous.reason !== reason.trim()) throw new Error('Request key already used for a different correction.'); return previous; }
  const adjustment: Adjustment = { id: `adjustment-${crypto.randomUUID()}`, requestKey, vendorId: staff.vendorId, serviceDate: reservation ? reservation.meal.serviceDate : (settlement as Settlement).serviceDate, targetType, targetId, vendorSen, feeSen, reason: reason.trim(), actorId: staff.actorId, at: state.now };
  state.adjustments.push(adjustment); return adjustment;
}
export function report(state: DemoState, date: string) {
  const staff = requireStaff(state);
  const records = state.reservations.filter(r => r.vendor.id === staff.vendorId && r.meal.serviceDate === date);
  const completed = records.filter(r => r.status === 'completed');
  const settlements = state.settlements.filter(s => s.vendorId === staff.vendorId && s.serviceDate === date);
  const adjustments = state.adjustments.filter(a => a.vendorId === staff.vendorId && a.serviceDate === date);
  const vendorSen = completed.reduce((sum, r) => sum + r.meal.vendorPriceSen, 0) + adjustments.reduce((sum, a) => sum + (a.targetType === 'reservation' ? a.vendorSen : 0), 0);
  const feeSen = completed.reduce((sum, r) => sum + r.meal.feeSen, 0) + adjustments.reduce((sum, a) => sum + (a.targetType === 'reservation' ? a.feeSen : 0), 0);
  const settledSen = settlements.reduce((sum, s) => sum + s.amountSen, 0) + adjustments.reduce((sum, a) => sum + (a.targetType === 'settlement' ? a.feeSen : 0), 0);
  return { records, completed, settlements, adjustments, units: completed.length, vendorSen, feeSen, settledSen, outstandingSen: feeSen - settledSen, cancelled: records.filter(r => r.status === 'cancelled').length, noShow: records.filter(r => r.status === 'no_show').length, unresolved: records.filter(r => r.status === 'reserved').length };
}
export function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === 'string' && /^[\s\u0000-\u001f\u007f-\u009f]*[=+\-@]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function exportCsv(state: DemoState, date: string) {
  const totals = report(state, date);
  const rows: (string | number)[][] = [['data', 'vendor', 'service_date', 'timezone', 'record_type', 'reference', 'status_or_target', 'meal_or_evidence', 'units', 'vendor_sen', 'fee_owed_sen', 'settled_sen', 'outstanding_sen', 'vendor_MYR', 'fee_owed_MYR', 'settled_MYR', 'outstanding_MYR', 'actor', 'timestamp_UTC', 'reason']];
  const add = (type: string, ref: string, status: string, text: string, units: number, v: number, f: number, paid: number, actor: string, at: string, reason: string) => rows.push(['SAMPLE DEMO', vendor.name, date, 'Asia/Kuala_Lumpur (UTC+08:00)', type, ref, status, text, units, v, f, paid, f - paid, money(v), money(f), money(paid), money(f - paid), actor, at, reason]);
  for (const r of totals.records) add('reservation', r.reference, r.status, r.meal.name, r.status === 'completed' ? 1 : 0, r.status === 'completed' ? r.meal.vendorPriceSen : 0, r.status === 'completed' ? r.meal.feeSen : 0, 0, '', r.completedAt ?? r.cancelledAt ?? r.createdAt, r.reason ?? '');
  for (const s of totals.settlements) add('settlement', s.id, s.reservationIds.map(id => totals.records.find(r => r.id === id)?.reference).join('; '), s.evidence, 0, 0, 0, s.amountSen, s.actorId, s.at, `Recorded ${s.recordedAt}`);
  for (const a of totals.adjustments) add('adjustment', a.id, `${a.targetType}:${a.targetId}`, '', 0, a.vendorSen, a.targetType === 'reservation' ? a.feeSen : 0, a.targetType === 'settlement' ? a.feeSen : 0, a.actorId, a.at, a.reason);
  add('TOTAL', '', `cancelled=${totals.cancelled}; no_show=${totals.noShow}; unresolved=${totals.unresolved}`, 'Original completed amounts plus signed adjustments', totals.units, totals.vendorSen, totals.feeSen, totals.settledSen, '', state.now, 'Negative outstanding is a credit/discrepancy to reconcile.');
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

// Reproducible review fixtures use the same mutations and records as the screens.
export function prepareStaffScenario(state: DemoState, scenario: string) {
  if (!['No-show review', 'Withdrawal review'].includes(scenario)) return;
  const staff = requireStaff(state);
  state.now = '2026-10-01T13:15:00Z';
  const record = state.reservations.find(r => r.status === 'reserved' && r.vendor.id === staff.vendorId && r.meal.serviceDate === '2026-10-01');
  if (!record) throw new Error('Reserve a sample meal first, then enter staff demo mode and choose this scenario.');
  if (scenario === 'No-show review') state.now = '2026-10-01T14:00:00Z';
  if (scenario === 'Withdrawal review') withdraw(state, record.offerId, 'Sample vendor withdrawal review.', true);
}
