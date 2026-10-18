'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useDemo } from './DemoProvider';
import { Agreement, CustomerOnly, pause, statusLabel, Support } from './CustomerShared';
import s from './EcoBiz.module.css';
export default function PickupPass({ id, recovered }: { id: string; recovered: boolean }) { return <CustomerOnly><Pass id={id} recovered={recovered} /></CustomerOnly>; }
function Pass({ id, recovered }: { id: string; recovered: boolean }) {
  const demo = useDemo(); const dialog = useRef<HTMLDialogElement>(null); const cancelButton = useRef<HTMLButtonElement>(null); const lock = useRef(false);
  const [pending, setPending] = useState(false); const [message, setMessage] = useState(recovered ? 'Reservation recovered. Stock was reserved once.' : '');
  const record = demo.state.reservations.find(r => r.id === id && r.customerId === demo.state.session);
  if (!record) return <section className={s.panel}><h1>Reservation unavailable</h1><p>This reservation is missing or is not part of your demo account.</p><Link className={s.button} href="/reservations">My reservations</Link></section>;
  const canCancel = record.status === 'reserved' && Date.parse(demo.now) < Date.parse(record.meal.cancellationCutoff);
  const withdrawn = demo.state.offers.find(o => o.id === record.offerId)?.status === 'withdrawn';
  const stale = record.status === 'reserved' && (withdrawn || Date.parse(demo.now) >= Date.parse(record.meal.pickupEnd));
  async function confirmCancellation() {
    if (lock.current) return; lock.current = true; setPending(true); setMessage('Cancelling sample reservation…'); await pause();
    try { demo.cancel(id); setMessage('Reservation cancelled. Stock restored once.'); }
    catch (error) { setMessage((error as Error).message); }
    dialog.current?.close(); lock.current = false; setPending(false);
    setTimeout(() => { if (cancelButton.current) cancelButton.current.focus(); else document.getElementById('pass-status')?.focus(); }, 0);
  }
  return <><Link className={s.back} href="/reservations">← My reservations</Link><section className={s.panel}><p className={s.eyebrow}>Sample pickup pass</p><h1>Your pickup pass</h1><p className={s.reference}>{record.reference}</p><h2 id="pass-status" tabIndex={-1}>{statusLabel[record.status]}</h2>
    <p role="status" aria-live="polite">{message}</p>
    {!demo.persistent && <p role="alert">Saved in memory only. Browser storage failed; this sample pass cannot be recovered after refresh.</p>}
    {record.status === 'reserved' && <p>A reservation does not confirm payment or collection. Show this reference at the sample vendor counter.</p>}
    {stale && <p role="alert">{withdrawn ? 'Offer withdrawn — this pass is stale. Do not rely on it for collection.' : 'Pickup window has ended — this reservation is stale and needs staff review.'}</p>}
    {record.reason && <p><strong>Cancellation reason:</strong> {record.reason}</p>}
    <Agreement meal={record.meal} vendor={record.vendor} />
    {canCancel && <button ref={cancelButton} className={s.button} onClick={() => dialog.current?.showModal()}>Cancel reservation</button>}
    {record.status === 'reserved' && !canCancel && <p>Cancellation cutoff has passed. Contact support for assistance.</p>}
    <Support /><Link className={s.textLink} href="/">Browse meals</Link>
    <dialog ref={dialog} className={s.dialog} onCancel={e => { if (pending) e.preventDefault(); }}><h2>Cancel this reservation?</h2><p>Your meal will be released. No payment has been taken.</p><div className={s.actions}><button className={s.button} disabled={pending} autoFocus onClick={() => { dialog.current?.close(); cancelButton.current?.focus(); }}>Keep reservation</button><button className={s.button} disabled={pending} onClick={confirmCancellation}>{pending ? 'Cancelling…' : 'Yes, cancel reservation'}</button></div><p role="status">{pending ? 'Cancelling sample reservation…' : ''}</p></dialog>
  </section></>;
}
