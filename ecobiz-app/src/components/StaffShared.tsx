'use client';
import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import { useDemo } from './DemoProvider';
import { pause } from './CustomerShared';
import { vendor } from '@/lib/demo';
import s from './EcoBiz.module.css';

export function StaffOnly({ children }: { children: ReactNode }) {
  const demo = useDemo();
  if (!demo.state.staff || demo.state.staff.vendorId !== vendor.id || demo.scenario === 'Permission denied') return <section className={s.panel}><h1>Permission denied</h1><p>Operations is available only in Staff demo mode for Cabin Vendor. Use the separate Demo controls below to enter that review mode.</p><p>These frontend checks are a review aid, not secure production authorisation.</p><Link className={s.button} href="/">Return to meals</Link></section>;
  if (demo.scenario === 'Loading') return <section className={s.panel} aria-busy="true"><h1>Loading operations</h1><p role="status">Loading sample records…</p><button className={s.button} onClick={() => demo.setScenario('Available')}>Finish loading preview</button></section>;
  if (demo.scenario === 'Load error' || demo.scenario === 'Server error') return <section className={s.panel}><h1>{demo.scenario === 'Load error' ? 'Connection failed' : 'Server error simulation'}</h1><p role="alert">Sample records could not be loaded. No action has been applied.</p><button className={s.button} onClick={() => demo.setScenario('Available')}>Retry operations</button></section>;
  return children;
}
export function ConfirmAction({ label, description, run, disabled = false, validate, children }: { label: string; description: string; run: () => string | void; disabled?: boolean; validate?: () => boolean; children?: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null); const trigger = useRef<HTMLButtonElement>(null); const result = useRef<HTMLParagraphElement>(null); const lock = useRef(false);
  const [pending, setPending] = useState(false); const [message, setMessage] = useState('');
  async function submit() {
    if (lock.current) return; lock.current = true; setPending(true); setMessage('Applying sample action…');
    await pause();
    try { setMessage(run() || 'Sample action saved.'); } catch (error) { setMessage((error as Error).message); }
    dialog.current?.close(); lock.current = false; setPending(false);
    setTimeout(() => { if (trigger.current && !trigger.current.disabled) trigger.current.focus(); else result.current?.focus(); }, 0);
  }
  return <div className={s.confirmAction}><button type="button" ref={trigger} className={s.button} disabled={disabled || pending} onClick={() => { if (!validate || validate()) dialog.current?.showModal(); }}>{label}</button><p ref={result} tabIndex={-1} role="status" aria-live="polite">{message}</p><dialog ref={dialog} className={s.dialog} onCancel={e => { if (pending) e.preventDefault(); }}><h2>{label}?</h2><p>{description}</p>{children}<div className={s.actions}><button type="button" className={s.button} autoFocus disabled={pending} onClick={() => { dialog.current?.close(); trigger.current?.focus(); }}>Go back</button><button type="button" className={s.button} disabled={pending} onClick={submit}>{pending ? 'Saving…' : `Confirm ${label.toLowerCase()}`}</button></div><p role="status">{pending ? 'Saving sample changes…' : ''}</p></dialog></div>;
}
