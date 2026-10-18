'use client';
import Link from 'next/link';
import { useState } from 'react';
import { availability, malaysiaDate, money, serviceDate, totalSen, vendor, type Reservation } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { Agreement, statusLabel } from './CustomerShared';
import { ConfirmAction, StaffOnly } from './StaffShared';
import OperationsReport from './OperationsReport';
import s from './EcoBiz.module.css';
import { LeafSectionAccent } from './LeafDecoration';
export default function Operations() { return <StaffOnly><Dashboard /></StaffOnly>; }
function Handover({ record }: { record: Reservation }) {
  const demo = useDemo(); const [collected, setCollected] = useState(false); const [paid, setPaid] = useState(false); const [reason, setReason] = useState('');
  return <article className={s.staffRecord}><h3>{record.reference}</h3><p><strong>{statusLabel[record.status]}</strong> · {record.meal.name} · {money(totalSen(record.meal))}</p><p>Current shared demo state, checked at {demo.now}. A screenshot or reference alone does not establish an active reservation.</p><details><summary>View agreed meal, pickup and status events</summary><Agreement meal={record.meal} vendor={record.vendor} /><ul>{demo.state.events.filter(e => e.reservationId === record.id).map(e => <li key={e.id}>{e.from} → {e.to} · {e.at} UTC · {e.actorId} · {e.reason}</li>)}</ul></details>
    {record.status === 'reserved' ? <><fieldset><legend>Verify handover with the vendor</legend><label className={s.checkLabel}><input type="checkbox" checked={collected} onChange={e => setCollected(e.target.checked)} />Meal handed over</label><label className={s.checkLabel}><input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} />Payment received</label></fieldset><ConfirmAction label="Complete collected and paid" description={`Complete ${record.reference}, one ${record.meal.name}, ${money(totalSen(record.meal))}. Confirm that BOTH handover and payment occurred.`} disabled={!collected || !paid} run={() => { demo.complete(record.id, collected, paid); return 'Sample meal completed once. Fee is owed, not yet settled.'; }} />
    <label htmlFor={`reason-${record.id}`}>Staff cancellation reason</label><textarea className={s.input} id={`reason-${record.id}`} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /><ConfirmAction label="Cancel sample reservation" description={`Cancel ${record.reference} with reason: ${reason || '(reason required)'}. No fee is earned.`} run={() => { demo.staffCancel(record.id, reason); return 'Sample reservation cancelled. Eligible stock restored once.'; }} /></> : <p>{record.reason ?? 'Terminal record. Contact support about historical discrepancies.'}</p>}
  </article>;
}
function Dashboard() {
  const demo = useDemo(); const [date, setDate] = useState(malaysiaDate(demo.now)); const [reference, setReference] = useState(''); const [reconciled, setReconciled] = useState(false);
  const offers = demo.state.offers.filter(o => o.vendorId === vendor.id && o.serviceDate === date);
  const records = demo.state.reservations.filter(r => r.vendor.id === vendor.id && (reference.trim() ? r.reference.toLowerCase().includes(reference.trim().toLowerCase()) : r.meal.serviceDate === date));
  const outstanding = demo.state.reservations.filter(r => r.vendor.id === vendor.id && r.meal.serviceDate === date && r.status === 'reserved');
  return <section className={`${s.panel} ${s.opsPanel}`}><p className={s.eyebrow}>Staff demo · {vendor.name}</p><h1>Evening operations</h1><p>Sample records only. Role switching is a review aid, not production security. Changes here update the same customer demo.</p><Link className={s.textLink} href="/help">Operations help</Link><label htmlFor="report-date">Service date to review</label><input className={s.input} id="report-date" type="date" value={date} onChange={e => { if (e.target.value) setDate(e.target.value); }} />
    <section id="offers" className={s.detailSection}><h2>Offers · {serviceDate(date)}</h2><Link className={s.button} href={`/ops/offers/new?date=${date}`}>Create sample offer</Link>{offers.length ? <ul className={s.history}>{offers.map(offer => <li key={offer.id}><h3>{offer.name}</h3><p>{offer.status === 'unpublished' ? 'Draft' : offer.status} · {availability(offer, demo.now)} · {offer.remainingStock} unreserved · {money(totalSen(offer))}</p><Link className={s.textLink} href={`/ops/offers/${offer.id}`}>Edit {offer.name}</Link></li>)}</ul> : <p>No sample offers for this date. Create one to begin.</p>}</section>
    <LeafSectionAccent />
    <section id="handover" className={s.detailSection}><h2>Reservation lookup and handover</h2><label htmlFor="reference">Find by pickup reference (all service dates)</label><input className={s.input} id="reference" value={reference} onChange={e => setReference(e.target.value)} placeholder="DEMO-…" maxLength={80} /><p className={s.note}>Clear the lookup to see all reservations for the selected date. Verify the date on the agreement before handover.</p>{records.length ? records.map(record => <Handover key={record.id} record={record} />) : <p role="status">No matching sample reservation. Check the reference or selected date.</p>}</section>
    <OperationsReport key={date} date={date} />
    <section className={s.detailSection}><h2>Evening close</h2><p>{outstanding.length} unresolved reservation(s) for {serviceDate(date)}. Allowed only after all pickup windows end. Missed pickups earn no fee and do not reopen stock.</p><label className={s.checkLabel}><input type="checkbox" checked={reconciled} onChange={e => setReconciled(e.target.checked)} />I have reconciled all handovers for this service date</label><ConfirmAction label="Close evening" disabled={!reconciled} description={`Mark ${outstanding.length} remaining reserved meal(s) as no-show for ${date}. This is a terminal status.`} run={() => { const count = demo.closeEvening(date, reconciled); return `Evening closed: ${count} new no-show(s). Repeat close does not duplicate records.`; }} /></section>
  </section>;
}
