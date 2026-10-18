'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { profile, safeReturn } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { pause } from './CustomerShared';
import s from './EcoBiz.module.css';
export default function SignIn({ destination }: { destination: string }) {
  const demo = useDemo(); const router = useRouter(); const lock = useRef(false);
  const [pending, setPending] = useState(false); const [message, setMessage] = useState('');
  async function signIn() {
    if (lock.current) return; lock.current = true; setPending(true); setMessage('Opening sample account…'); await pause();
    if (demo.scenario === 'Sign-in error' || demo.scenario === 'Sign-in cancelled') { setMessage(demo.scenario === 'Sign-in error' ? 'Demo sign-in failed. Select Available in Demo controls and retry.' : 'Demo sign-in cancelled. Your selected destination is preserved. You can retry.'); setPending(false); lock.current = false; return; }
    demo.session(profile.id); router.replace(safeReturn(destination));
  }
  return <section className={s.panel}><p className={s.eyebrow}>EcoBiz · sample journey</p><h1>Sign in to reserve</h1><p>An account links your reservation to your pickup pass so you can reopen or cancel it.</p><button className={s.button} disabled>Continue with Google · not connected</button><p>Real Google authentication is not connected. The separate demo account below only simulates a session in this browser.</p><button className={s.button} disabled={pending} onClick={signIn}>{pending ? 'Signing in…' : 'Continue with demo account'}</button><p role="status" aria-live="polite">{message}</p><Link className={s.textLink} href={destination.startsWith('/reserve/') ? destination.replace('/reserve/', '/meals/') : '/'}>Back to browsing</Link></section>;
}
