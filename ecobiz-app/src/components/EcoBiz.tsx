'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { type Offer } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import s from './EcoBiz.module.css';
import { CommerceNavigation } from './commerce/CommerceShell';

export function Icon({ name }: { name: 'meals' | 'calendar' | 'account' | 'clock' | 'shop' | 'arrow' | 'bag' | 'hand' | 'help' }) {
  const paths = {
    meals: <><path d="M4 3v6c0 3 6 3 6 0V3M7 3v18M19 3c-4 3-4 9 0 9V3Zm0 9v9" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v5m10-5v5M3 11h18" /></>,
    account: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 3" /></>,
    shop: <><path d="M3 10 5 3h14l2 7M4 13v8h16v-8M9 21v-7h6v7M3 10c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0ZM8 3l-1 7m9-7 1 7" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    hand: <path d="M7 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v7-3a2 2 0 0 1 3 0v5c0 5-3 7-7 7h-2c-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l3 3" />,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function Header({ compact = false }: { compact?: boolean }) {
  const { signedIn, profile, state } = useDemo();
  return <header className={`${s.header} ${compact ? s.compactHeader : ""}`}>
    <Link className={s.brand} href="/" aria-label="EcoBiz home"><img src="/logo.jpeg" width="88" height="64" alt="EcoBiz" /></Link>
    <span className={s.campus}><span className={`${s.brand} ${s.unitenBrand}`}><img src="/logo_uniten.png" width="428" height="165" alt="UNITEN — Universiti Tenaga Nasional" /></span></span>
    <Link className={s.avatar} href={state.staff ? "/ops" : "/account"} aria-label={state.staff ? "Staff demo operations" : "Account"}>{state.staff ? 'S' : signedIn ? profile.displayName.charAt(0) : <Icon name="account" />}</Link>
  </header>;
}
export function Navigation() {
  const { state } = useDemo();
  const path = usePathname();
  if (!state.staff) return <CommerceNavigation wide active={path === '/' || path.startsWith('/meals') || path.startsWith('/reserve/') ? '/' : path.startsWith('/reservations') ? '/orders' : '/account'}/>;
  const customerLinks = [{ href: '/', label: 'Meals', icon: 'meals' }, { href: '/reservations', label: 'My reservations', icon: 'calendar' }, { href: '/account', label: 'Account', icon: 'account' }] as const;
  const links = state.staff ? [{ href: '/ops', label: 'Operations', icon: 'hand' as const }, { href: '/ops/offers/new', label: 'Offers', icon: 'bag' as const }, { href: '/help', label: 'Help', icon: 'help' as const }] : customerLinks;
  return <nav className={s.nav} aria-label={state.staff ? "Staff navigation" : "Main navigation"}><div>{links.map(link => {
    const active = state.staff ? (link.href === '/ops' ? path === '/ops' : link.href === '/ops/offers/new' ? path.startsWith('/ops/offers/') : path === '/help') : link.href === '/' ? path === '/' || path.startsWith('/meals') || path.startsWith('/reserve/') : path.startsWith(link.href);
    return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined}><Icon name={link.icon} /><span>{link.label}</span></Link>;
  })}</div></nav>;
}
export function MealPhoto({ meal }: { meal: Offer }) {
  const [failedSource, setFailedSource] = useState('');
  return <div className={s.photo}>{!meal.image || failedSource === meal.image ? <div className={s.imageFallback} role="img" aria-label={`${meal.name}: photo unavailable`}><Icon name="meals" /><span>Photo unavailable</span><small>Meal details below</small></div> : <img src={meal.image} alt={`Illustrative ${meal.name} meal; actual serving may vary`} width="640" height="400" onError={() => setFailedSource(meal.image)} />}{meal.image && failedSource !== meal.image && <span className={s.photoLabel}>Illustrative photo</span>}</div>;
}
export function ReservationStatus() {
  const { active } = useDemo();
  return <section className={s.reservation} aria-label="Reservation status"><Icon name="calendar" /><div><h2>{active ? 'Your meal is reserved' : 'No active reservation'}</h2>{active ? <Link className={s.textLink} href={`/reservations/${active.id}`}>View reservation · {active.meal.name}</Link> : <p>Your pickup pass will appear here.</p>}</div></section>;
}
export function HeroArt() {
  return <img className={s.heroArt} src="/art/ecobiz-hero-reference.svg" width="1040" height="1300" alt="" aria-hidden="true" />;
}
export function NotFoundContent() { return <section className={s.panel}><p className={s.eyebrow}>Nothing on the menu here</p><h1>Meal not found</h1><p>This sample meal does not exist. Return to the current offers to choose a meal.</p><Link className={s.button} href="/">Return to meals <Icon name="arrow" /></Link></section>; }
