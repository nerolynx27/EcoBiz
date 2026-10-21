'use client';
import { useState } from 'react';
import { jobs, rm, type JobId } from '@/lib/commerce';
import { useCommerce } from './CommerceProvider';
import { DeliveryTabs } from './CommerceShell';
import { CommerceIcon as Icon } from './CommerceIcon';
import s from './Commerce.module.css';
export default function Runner() {
  const { state, dispatch, ready } = useCommerce();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  function accept(id: JobId) { dispatch({ type: 'accept', id }); setComplete(false); setError(''); }
  return <><h1 className={s.pageTitle}>Your delivery</h1><DeliveryTabs runner/>
    <div className={`${s.card} ${s.availability}`}><span><i className={state.online ? s.onlineDot : s.offlineDot}/>Available for jobs</span><button role="switch" aria-checked={state.online} aria-label="Available for jobs" className={s.switch} disabled={!ready} onClick={() => dispatch({ type: 'online', value: !state.online })}><span/></button><small>{state.online ? 'Online' : 'Offline'}</small></div>
    <div className={`${s.card} ${s.earnings}`}><div><Icon name="wallet"/><span><small>Today</small><strong data-testid="runner-earnings">{rm(state.earningsSen)}</strong></span></div><div><Icon name="box"/><span><strong>{state.completedCount}</strong><small>deliveries</small></span></div></div>
    {complete && <p role="status" className={s.feedback}>Delivered. Earnings updated.</p>}
    {jobs.filter(job => !state.completedJobs.includes(job.id)).map((job, index) => {
      const active = state.activeJob?.id === job.id;
      return <section className={`${s.card} ${s.job}`} key={job.id} aria-label={job.title}>
        {(index === 0 || active) && <div className={s.jobTop}><span className={s.badge}><i/>{active ? state.activeJob?.stage === 'picked-up' ? 'Picked up' : 'Accepted' : 'New job'}</span><span><Icon name="pin"/>0.8 km</span></div>}
        <h2><Icon name={job.icon}/>{job.title}</h2>
        <div className={s.route}><div><Icon name="pin"/><span><small>Pickup</small>{job.pickup}</span></div><Icon name="arrow"/><div><Icon name="pin"/><span><small>Drop-off</small>{job.dropoff}</span></div></div>
        <strong className={s.price}>{rm(job.feeSen)}</strong>
        {!active ? <button className={s.primary} aria-label={`Accept ${job.title.toLowerCase()}`} disabled={!ready || !state.online || !!state.activeJob} onClick={() => accept(job.id)}><Icon name="bike"/>Accept job</button> : state.activeJob?.stage === 'accepted' ? <button className={s.primary} onClick={() => dispatch({ type: 'pickup' })}><Icon name="bag"/>Mark picked up</button> : <form onSubmit={event => { event.preventDefault(); if (code !== '4821') { setError('Check the code. Sample: 4821.'); return; } dispatch({ type: 'complete', code }); setCode(''); setError(''); setComplete(true); }}><label className={s.codeLabel}>Handover code<input value={code} inputMode="numeric" maxLength={4} pattern="[0-9]{4}" required aria-invalid={!!error} aria-describedby={error ? 'handover-error' : undefined} onChange={event => setCode(event.target.value)} placeholder="4-digit code"/></label>{error && <p id="handover-error" role="alert">{error}</p>}<button className={s.primary} type="submit"><Icon name="check"/>Complete delivery</button></form>}
      </section>;
    })}
    {!state.online && <p role="status" className={s.feedback}>You’re offline. Go online to accept jobs.</p>}
    {state.completedJobs.length === jobs.length && <div className={s.card}><h2>All done for now.</h2><p>Both sample deliveries completed.</p></div>}
  </>;
}
