'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { supportContact, money, pickup, profileErrors, safeReturn, serviceDate, time, totalSen, type Offer, type Vendor } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import s from './EcoBiz.module.css';

export function CustomerOnly({ children }: { children: ReactNode }) {
  const { signedIn } = useDemo(); const router = useRouter(); const path = usePathname();
  const hadSession = useRef(signedIn);
  useEffect(() => {
    if (!signedIn) router.replace(hadSession.current ? '/' : `/sign-in?returnTo=${encodeURIComponent(safeReturn(path))}`);
    hadSession.current = signedIn;
  }, [signedIn, router, path]);
  return signedIn ? children : <section className={s.panel}><p role="status">Opening demo sign-in…</p></section>;
}
export function ProfileForm({ onSaved, label = 'Save sample profile' }: { onSaved?: () => void; label?: string }) {
  const demo = useDemo();
  const [name, setName] = useState(demo.profile.displayName);
  const [phone, setPhone] = useState(demo.profile.phone);
  const [errors, setErrors] = useState({ displayName: '', phone: '' });
  const [message, setMessage] = useState('');
  return <form className={s.form} noValidate onSubmit={e => {
    e.preventDefault(); const next = profileErrors(name, phone); setErrors(next); setMessage('');
    if (next.displayName || next.phone) { (e.currentTarget.elements.namedItem(next.displayName ? 'displayName' : 'phone') as HTMLInputElement).focus(); return; }
    try { demo.saveProfile(name, phone); setMessage('Sample profile saved.'); onSaved?.(); } catch (error) { setMessage((error as Error).message); }
  }}>
    <p id="profile-purpose">Use sample details only. A name identifies your pickup; a phone would let the team contact you about it. Do not enter real personal data. Example: Sample Student / 0100000000.</p>
    <label htmlFor="displayName">Sample display name</label><input id="displayName" name="displayName" value={name} maxLength={60} autoComplete="off" aria-describedby={`profile-purpose${errors.displayName ? ' name-error' : ''}`} aria-invalid={!!errors.displayName} onChange={e => setName(e.target.value)} />
    {errors.displayName && <p id="name-error" className={s.fieldError} role="alert">{errors.displayName}</p>}
    <label htmlFor="phone">Sample phone</label><input id="phone" name="phone" type="tel" value={phone} maxLength={20} autoComplete="off" aria-describedby={`profile-purpose${errors.phone ? ' phone-error' : ''}`} aria-invalid={!!errors.phone} onChange={e => setPhone(e.target.value)} />
    {errors.phone && <p id="phone-error" className={s.fieldError} role="alert">{errors.phone}</p>}
    <button className={s.button}>{label}</button><p role="status">{message}</p>
  </form>;
}
export function Agreement({ meal, vendor }: { meal: Offer; vendor: Vendor }) {
  return <section className={s.detailSection}><h2>{meal.name}</h2><dl className={s.facts}>
    <dt>Quantity</dt><dd>1 meal unit</dd><dt>Vendor price</dt><dd>{money(meal.vendorPriceSen)}</dd><dt>EcoBiz fee</dt><dd>{money(meal.feeSen)}</dd><dt><strong>Total payable</strong></dt><dd><strong>{money(totalSen(meal))}</strong></dd>
    <dt>Vendor</dt><dd>{vendor.name} · sample</dd><dt>Location</dt><dd>{meal.location ?? vendor.location}</dd><dt>Service date</dt><dd>{serviceDate(meal.serviceDate)}</dd><dt>Pickup window</dt><dd>{pickup(meal)} MYT</dd><dt>Booking cutoff</dt><dd>{time(meal.bookingCutoff)} MYT</dd><dt>Cancel strictly before</dt><dd>{time(meal.cancellationCutoff)} MYT</dd>
  </dl><p className={s.pay}>Pay at pickup</p><p>{meal.instructions ?? vendor.instructions}</p></section>;
}
export function Support() { return <p className={s.note}>{supportContact ? <a className={s.textLink} href={supportContact.href}>{supportContact.label}</a> : 'Support contact not configured in this demo. No live assistance is available.'} <Link className={s.textLink} href="/help">Help and next steps</Link> · <Link className={s.textLink} href="/privacy">Privacy</Link> · <Link className={s.textLink} href="/terms">Terms</Link></p>; }
export const statusLabel = { reserved: 'Reserved — pay at pickup', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show — pickup missed' };
export const pause = () => new Promise(resolve => setTimeout(resolve, 650));

