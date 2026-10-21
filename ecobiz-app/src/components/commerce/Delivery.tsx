'use client';
import { useRef, useState } from 'react';
import { CommerceIcon as Icon } from './CommerceIcon';
import { DeliveryTabs } from './CommerceShell';
import s from './Commerce.module.css';
export default function Delivery() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const message = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  async function copyCode() {
    try { await navigator.clipboard.writeText('4821'); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <><h1 className={s.pageTitle}>Your delivery</h1><DeliveryTabs/>
    <section className={`${s.card} ${s.tracking}`} aria-label="Sample delivery tracking">
      <div className={s.trackingTop}><span className={s.badge}><i/>On the way</span><div className={s.eta}><small>ETA</small><strong>10–15 min</strong></div></div>
      <div className={s.cyclistArt} role="img" aria-label="EcoBiz student runner riding a bicycle"/>
      <h2>Eco Fertilizer · 1 kg</h2>
      <div className={s.route}><div><Icon name="pin"/><span><small>Pickup</small>EcoBiz Hub</span></div><Icon name="arrow"/><div><Icon name="pin"/><span><small>Drop-off</small>Cendekiawan Lobby</span></div></div>
      <ol className={s.progress} aria-label="Delivery progress">{['Confirmed', 'Accepted', 'Picked up', 'Delivered'].map((step, index) => <li key={step} className={index < 2 ? s.done : index === 2 ? s.current : ''} aria-current={index === 2 ? 'step' : undefined}><span>{index < 2 && <Icon name="check"/>}</span><small>{step}</small></li>)}</ol>
      <div className={s.runnerContact}><span className={s.avatarArt} role="img" aria-label="Sample runner Amir"/><strong>Amir</strong><Icon name="chevron"/><button ref={message} aria-label="Message Amir" onClick={() => { dialog.current?.showModal(); close.current?.focus(); }}><Icon name="message"/></button></div>
    </section>
    <section className={`${s.card} ${s.handover}`} aria-label="Delivery handover code"><Icon name="key"/><div><small>Handover code</small><strong>4821</strong></div><button aria-label="Copy handover code" onClick={copyCode}><Icon name={copied ? 'check' : 'copy'}/></button></section>
    {(copied || copyError) && <p role="status" className={s.feedback}>{copyError ? 'Code: 4821. Copy unavailable.' : 'Code copied.'}</p>}
    <dialog ref={dialog} className={s.dialog} aria-labelledby="runner-contact-title" onClose={() => message.current?.focus()}><h2 id="runner-contact-title">Sample runner · Amir</h2><p>Your order is on the way.</p><small>Messaging is a demo preview.</small><button ref={close} className={s.primary} onClick={() => dialog.current?.close()}>Close</button></dialog>
  </>;
}
