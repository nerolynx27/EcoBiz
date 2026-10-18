'use client';

import { usePathname } from 'next/navigation';
import s from './LeafDecoration.module.css';

export function LeafBackdrop() {
  const path = usePathname();
  const variant = path === '/' ? 'home'
    : path.startsWith('/ops/offers/new') ? 'newOffer'
    : path.startsWith('/ops/offers/') ? 'editOffer'
    : path === '/ops' ? 'operations'
    : path.startsWith('/meals/') ? 'meal'
    : path.startsWith('/reservations/') ? 'pass'
    : path === '/reservations' ? 'history'
    : path === '/help' ? 'help'
    : path === '/privacy' ? 'privacy'
    : path === '/terms' ? 'terms'
    : 'quiet';
  return <div className={`${s.backdrop} ${s[variant]}`} aria-hidden="true">
    <span className={s.corner} /><span className={s.side} /><span className={s.closing} />
  </div>;
}

export function LeafCardRibbon() {
  return <div className={s.cardRibbon} aria-hidden="true" />;
}

export function LeafSectionAccent() {
  return <div className={s.sectionAccent} aria-hidden="true" />;
}
