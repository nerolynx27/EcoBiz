'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { availability, profileErrors, scenarioOffer, vendor } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { NotFoundContent } from './EcoBiz';
import { Agreement, CustomerOnly, pause, ProfileForm, Support } from './CustomerShared';
import s from './EcoBiz.module.css';
export default function ReservationReview({ id }: { id: string }) { return <CustomerOnly><Review id={id} /></CustomerOnly>; }
function Review({ id }: { id: string }) {
  const demo = useDemo(); const router = useRouter(); const lock = useRef(false); const key = useRef('');
  const [pending, setPending] = useState(false); const [message, setMessage] = useState('');
  const confirm = useRef<HTMLButtonElement>(null);
  const source = demo.state.offers.find(o => o.id === id);
  if (!source) return <NotFoundContent />;
  const meal = scenarioOffer(source, demo.scenario); const status = availability(meal, demo.now);
  const errors = profileErrors(demo.profile.displayName, demo.profile.phone); const incomplete = !!(errors.displayName || errors.phone);
  async function submit() {
    if (lock.current) return; lock.current = true; setPending(true); setMessage('Confirming sample reservation…');
    try {
      if (!key.current) key.current = demo.requestKey(id);
      await pause();
      const record = demo.book(id, key.current); router.push(`/reservations/${record.id}`);
    } catch (error) {
      if ((error as Error).message === 'UNKNOWN_OUTCOME') {
        setMessage('Checking reservation'); await pause();
        const recovered = demo.recover(key.current);
        if (recovered) { router.push(`/reservations/${recovered.id}?recovered=1`); return; }
        setMessage('Checked: no reservation exists for this attempt. You can safely retry.');
      } else setMessage((error as Error).message);
      lock.current = false; setPending(false);
    }
  }
  return <><Link className={s.back} href={`/meals/${id}`}>← Back to meal</Link><section className={s.panel}><p className={s.eyebrow}>Sample reservation · review</p><h1>One meal, ready for pickup</h1><p>Viewing this review does not hold stock. Availability is checked when you confirm.</p>
    {incomplete && <section><h2>Complete your sample profile</h2><ProfileForm onSaved={() => setTimeout(() => confirm.current?.focus(), 0)} /></section>}
    <Agreement meal={meal} vendor={vendor} />
    {demo.active && <p role="status">You already have an active reservation. <Link className={s.textLink} href={`/reservations/${demo.active.id}`}>View reservation</Link></p>}
    {status !== 'Available' && <p role="status">{status}. <Link className={s.textLink} href="/">Browse meals</Link></p>}
    <button ref={confirm} className={s.button} disabled={pending || incomplete || !!demo.active || status !== 'Available'} onClick={submit}>{pending ? 'Please wait…' : 'Confirm sample reservation'}</button>
    <p role="status" aria-live="polite" aria-atomic="true">{message}</p><Support />
  </section></>;
}
