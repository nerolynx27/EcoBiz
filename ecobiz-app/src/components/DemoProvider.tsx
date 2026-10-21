'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { activeReservation, applyScenario, book, cancel, defaultTime, findRequest, freshState, profile, restoreState, saveProfile, scenarios, storageKey, time, type DemoState, type Scenario } from '@/lib/demo';
import * as ops from '@/lib/operations';
import { vendor, type Offer } from '@/lib/demo';
import s from './EcoBiz.module.css';

function useDemoState() {
  const [state, setState] = useState<DemoState>(freshState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [persistent, setPersistent] = useState(true);
  // Browser-only restore intentionally follows the identical server/client loading render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let restored = freshState();
    try {
      const result = restoreState(localStorage.getItem(storageKey));
      restored = result.state;
      if (result.reset) setNotice('Invalid or outdated sample state was reset.');
      localStorage.setItem(storageKey, JSON.stringify(restored, (key, value) => key === 'image' && typeof value === 'string' && value.startsWith('blob:') ? '/missing-demo-image.webp' : value));
    } catch { setPersistent(false); }
    current.current = restored;
    setState(restored); setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  function change<T,>(mutate: (draft: DemoState) => T): T {
    const draft = structuredClone(current.current);
    const result = mutate(draft);
    current.current = draft; setState(draft);
    try { localStorage.setItem(storageKey, JSON.stringify(draft, (key, value) => key === 'image' && typeof value === 'string' && value.startsWith('blob:') ? '/missing-demo-image.webp' : value)); setPersistent(true); }
    catch { setPersistent(false); }
    return result;
  }
  return {
    state, ready, notice, persistent, signedIn: !!state.session, scenario: state.scenario, now: state.now,
    profile: state.profiles.find(p => p.id === state.session) ?? profile,
    active: activeReservation(state),
    session: (id: string | null) => change(d => { d.session = id; d.staff = null; }),
    staffSession: () => change(d => { d.staff = { actorId: 'demo-staff', vendorId: vendor.id }; }),
    saveOffer: (offer: Offer) => change(d => ops.saveOffer(d, offer)),
    complete: (id: string, collected: boolean, paid: boolean) => change(d => ops.complete(d, id, collected, paid)),
    staffCancel: (id: string, reason: string) => change(d => ops.staffCancel(d, id, reason)),
    withdraw: (id: string, reason: string, confirmed: boolean) => change(d => ops.withdraw(d, id, reason, confirmed)),
    closeEvening: (date: string, confirmed: boolean) => change(d => ops.closeEvening(d, date, confirmed)),
    exportCsv: (date: string) => ops.exportCsv(current.current, date),
    setScenario: (value: Scenario) => {
      try { change(d => { applyScenario(d, value); ops.prepareStaffScenario(d, value); }); }
      catch (error) { setNotice(`Scenario could not run: ${(error as Error).message} Reset and sign in before trying again.`); }
    },
    setTime: (value: string) => change(d => { d.now = value; }),
    saveProfile: (name: string, phone: string) => change(d => saveProfile(d, name, phone)),
    requestKey: (mealId: string) => change(d => {
      if (!d.session) throw new Error('Sign in to continue.');
      const slot = `${d.session}:${mealId}`;
      const previous = d.attempts[slot];
      const record = previous && findRequest(d, previous);
      if (!previous || (record && record.status !== 'reserved')) d.attempts[slot] = crypto.randomUUID();
      return d.attempts[slot];
    }),
    book: (mealId: string, key: string) => {
      if (current.current.session !== state.session) throw new Error('Your demo session changed. Reopen review before confirming.');
      if (current.current.scenario === 'Submission failure') throw new Error('Submission failed before creation. Nothing reserved. Retry with the same attempt.');
      if (current.current.scenario === 'Last meal taken') change(d => { const meal = d.offers.find(o => o.id === mealId); if (meal) meal.remainingStock = 0; });
      const result = change(d => book(d, mealId, key));
      if (current.current.scenario === 'Duplicate confirmation') change(d => book(d, mealId, key));
      if (current.current.scenario === 'Response lost') throw new Error('UNKNOWN_OUTCOME');
      return result;
    },
    recover: (key: string) => findRequest(current.current, key),
    cancel: (id: string) => change(d => cancel(d, id)),
    reset: () => { change(d => Object.assign(d, freshState())); setNotice('Demo reset to guest, available offers and before cutoff.'); },
  };
}
const DemoContext = createContext<ReturnType<typeof useDemoState> | null>(null);
export function useDemo() { const value = useContext(DemoContext); if (!value) throw new Error('DemoProvider is required'); return value; }
export function DemoProvider({ children, hideControls = false }: { children: ReactNode; hideControls?: boolean }) {
  const demo = useDemoState();
  const router = useRouter();
  return <DemoContext.Provider value={demo}>
    {demo.ready ? children : <main className={s.panel} aria-busy="true"><p role="status">Restoring sample session and reservations…</p></main>}
    {demo.ready && !hideControls && <aside className={s.controls} aria-label="Prototype review controls">
      {!demo.persistent && <p role="alert">Browser storage is unavailable. This booking is in memory only; refresh recovery is unavailable.</p>}
      <p role="status">{demo.notice}</p>
      <details><summary>Demo controls <span>· {demo.state.staff ? 'Staff demo' : demo.signedIn ? 'Sample session' : 'Guest'} · {demo.scenario}</span></summary>
      <p>Sample data only. No Google authentication, real stock or bookings. Saved only in this browser. Reset before replaying a scenario.</p>
      <div className={s.controlGrid}>
        <label>Demo session<select value={demo.state.staff ? 'staff' : demo.state.session ?? 'guest'} onChange={e => { if (e.target.value === 'staff') { demo.staffSession(); router.push('/ops'); } else { const wasStaff = !!demo.state.staff; demo.session(e.target.value === 'guest' ? null : e.target.value); if (wasStaff) router.push('/'); } }}><option value='staff'>Staff demo · Cabin Vendor</option><option value="guest">Guest</option><option value={profile.id}>Muaz (sample)</option><option value="sample-other">Alex (sample, separate history)</option></select></label>
        <label>Review scenario<select value={demo.scenario} onChange={e => demo.setScenario(e.target.value as Scenario)}>{scenarios.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Demo clock<select value={demo.now} onChange={e => demo.setTime(e.target.value)}><option value={defaultTime}>Before cutoff · 9:15 pm</option><option value="2026-10-01T13:40:00Z">Exactly at cutoff · 9:40 pm</option><option value="2026-10-01T13:41:00Z">After cutoff · 9:41 pm</option><option value="2026-10-01T14:00:00Z">After pickup · 10 pm</option></select></label>
        <button className={s.outlineButton} onClick={() => { demo.reset(); router.push('/'); }}>Reset demo</button>
      </div></details><p className={s.clock}>Simulated time · 1 October 2026, {time(demo.now)} MYT</p>
    </aside>}
  </DemoContext.Provider>;
}
