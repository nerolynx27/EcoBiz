'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { money, serviceDate, totalSen } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { CustomerOnly, ProfileForm, statusLabel } from './CustomerShared';
import s from './EcoBiz.module.css';
export function Reservations() { return <CustomerOnly><History /></CustomerOnly>; }
function History() {
  const demo = useDemo();
  const records = demo.state.reservations.filter(r => r.customerId === demo.state.session).sort((a, b) => Number(b.status === 'reserved') - Number(a.status === 'reserved') || b.createdAt.localeCompare(a.createdAt));
  return <section className={s.panel}><p className={s.eyebrow}>Your sample meals</p><h1>My reservations</h1><p>Active pickup first, followed by your dated sample history.</p>{records.length ? <ul className={s.history}>{records.map(record => <li key={record.id}><p className={s.eyebrow}>{statusLabel[record.status]}</p><h2>{record.meal.name}</h2><p>{serviceDate(record.meal.serviceDate)} · {money(totalSen(record.meal))}</p><Link className={s.textLink} href={`/reservations/${record.id}`}>{record.status === 'reserved' ? 'Open pickup pass' : 'View details'} <span className={s.note}>· {record.reference}</span></Link></li>)}</ul> : <><h2>No reservations yet</h2><p>Choose a sample meal to try your first pickup pass.</p></>}<Link className={s.button} href="/">Browse meals</Link></section>;
}
export function Account() { return <CustomerOnly><AccountContent /></CustomerOnly>; }
function AccountContent() {
  const demo = useDemo(); const router = useRouter();
  return <section className={s.panel}><p className={s.eyebrow}>Demo account</p><h1>Your account</h1><ProfileForm key={demo.profile.id} /><button className={s.button} onClick={() => { demo.session(null); router.push('/'); }}>Sign out</button><p>Signing out clears the sample session. Signing back into the same demo account restores its records in this browser.</p><div className={s.actions}>{['help', 'privacy', 'terms'].map(page => <Link className={s.textLink} key={page} href={`/${page}`}>{page.charAt(0).toUpperCase() + page.slice(1)}</Link>)}</div></section>;
}

