'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { packPrice, rm, type Weight, type Fulfillment } from '@/lib/commerce';
import { useCommerce } from './CommerceProvider';
import { CommerceIcon as Icon } from './CommerceIcon';
import s from './Commerce.module.css';
export default function Fertilizer() {
  const [weight, setWeight] = useState<Weight>(1);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [added, setAdded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const add = useRef<HTMLButtonElement>(null);
  const { dispatch, ready } = useCommerce();
  function close() { dialog.current?.close(); add.current?.focus(); }
  function chooseWeight(value: Weight) { setWeight(value); setAdded(false); }
  return <>
    <div className={s.fertilizerTitle}><p className={s.eyebrow}>Fertilizer</p><h1>Grow<br/>something good.</h1></div>
    <section className={`${s.card} ${s.product}`} aria-labelledby="product-name">
      <div className={s.productArt} role="img" aria-label="EcoBiz kraft fertilizer pouch beside a leafy potted plant"/>
      <h2 id="product-name">Eco Fertilizer</h2>
      <div className={s.weights} aria-label="Pack size">{([1, 3, 5] as const).map(size => <button key={size} aria-pressed={weight === size} onClick={() => chooseWeight(size)}>{size} kg</button>)}</div>
      <div className={s.priceRow}><strong className={s.price} data-testid="product-price">{rm(packPrice(weight))}</strong><span className={s.stock}><i/>In stock</span></div>
      <div className={s.fulfillment} aria-label="Collection method">{(['pickup', 'delivery'] as const).map(method => <button key={method} aria-pressed={fulfillment === method} onClick={() => { setFulfillment(method); setAdded(false); }}><Icon name={method === 'pickup' ? 'bag' : 'delivery'}/>{method === 'pickup' ? 'Pickup' : 'Delivery'}</button>)}</div>
      <button ref={add} className={s.primary} disabled={!ready} onClick={() => { dialog.current?.showModal(); cancel.current?.focus(); }}><Icon name="cart"/>Add to order</button>
      {added && <p role="status" className={s.feedback}>Added. <Link href="/orders">View order →</Link></p>}
    </section>
    <button className={`${s.card} ${s.garden}`} onClick={() => { chooseWeight(3); document.getElementById('product-name')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }}><span className={s.gardenArt} aria-hidden="true"/><span><strong>Garden Pack</strong><small>3 kg</small></span><b>RM 20.00</b><Icon name="chevron"/></button>
    <dialog ref={dialog} className={s.dialog} onCancel={close} aria-labelledby="order-dialog-title"><h2 id="order-dialog-title">Your sample order</h2><p>Eco Fertilizer · {weight} kg</p><p>{rm(packPrice(weight))} · {fulfillment === 'pickup' ? 'Campus pickup' : 'Campus delivery'}</p><small>Sample only. No payment or real order.</small><div className={s.dialogActions}><button ref={cancel} className={s.secondary} onClick={close}>Cancel</button><button className={s.primary} onClick={() => { dispatch({ type: 'order', id: crypto.randomUUID(), weight, fulfillment }); setAdded(true); close(); }}>Confirm sample order</button></div></dialog>
  </>;
}
