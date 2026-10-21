'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { packPrice, rm, type Weight, type Fulfillment } from '@/lib/commerce';
import { useCommerce } from './CommerceProvider';
import { CommerceIcon as Icon } from './CommerceIcon';
import s from './Commerce.module.css';
import f from './Fertilizer.module.css';
const packPhotos: Record<Weight, string> = { 1: '/art/fertilizer/1kg.webp', 3: '/art/fertilizer/3kg.webp', 5: '/art/fertilizer/5kg.webp' };
const development = [
  { icon: 'leaf', title: 'Start with vegetables', text: 'Our trial uses bayam, carrots, cabbage and cauliflower scraps.' },
  { icon: 'check', title: 'Ferment with bokashi', text: 'Bokashi uses inoculated bran and a sealed container to ferment food scraps.' },
  { icon: 'bag', title: 'Finish, then test', text: 'Fermented scraps need further breakdown in soil or compost. Our next step is to test the finished material and its suitability for plants.' },
];
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
  return <div className={f.page}>
    <div className={f.introScene}>
    <div className={f.heroFlow} aria-hidden="true"><img src="/art/fertilizer/organic-flow.svg" width="1040" height="1300" alt=""/></div>
    <div className={`${s.fertilizerTitle} ${f.intro}`}>
      <p className={s.eyebrow}>EcoBiz Fertilizer</p><h1>Grow<br/>something good.</h1>
      <p className={f.lead}>Good food deserves a second chance. Suitable organic material could have a useful next chapter, too.</p>
      <a className={f.storyLink} href="#fertilizer-story-title">A little of our story <Icon name="arrow"/></a>
    </div>
    </div>
    <div className={f.storyScene}>
    <section className={f.story} aria-labelledby="fertilizer-story-title">
      <p className={f.kicker}>The idea behind the bag</p><h2 id="fertilizer-story-title">Our story</h2>
      <p>EcoBiz brings two ideas together: making surplus meals more accessible to our campus community, and exploring a useful next step for suitable organic material.</p>
      <p>Our trial starts with bokashi and familiar vegetable scraps: bayam, carrots, cabbage and cauliflower. We’re exploring their next chapter, one small batch at a time.</p>
    </section>
    <div className={f.storyBridge} aria-hidden="true"><img src="/art/fertilizer/organic-flow-tail.svg" width="760" height="540" alt=""/></div>
    <figure className={f.feature}>
      <img src={packPhotos[3]} width="1600" height="1073" alt="EcoBiz’s selected green 3 kg fertilizer packaging beside soil and a leafy potted plant"/>
      <figcaption>A greener direction, inside and out.<span>Packaging concept · 3 kg</span></figcaption>
    </figure>
    <div className={f.processScene}>
    <div className={f.processFlow} aria-hidden="true"><img src="/art/fertilizer/organic-flow-contours.svg" width="1040" height="1300" alt="" loading="lazy"/></div>
    <section className={f.process} aria-labelledby="fertilizer-process-title">
      <p className={f.kicker}>From an idea to a product</p><h2 id="fertilizer-process-title">How we’re developing it</h2>
      <p className={f.processIntro}>A small experiment with a bigger purpose. Here’s the approach we’re developing, with testing still ahead.</p>
      <ol className={f.steps}>{development.map((step, index) => <li key={step.title}><span className={f.stepIcon}><Icon name={step.icon}/></span><div><span className={f.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
    </section>
    </div>
    </div>
    <section className={f.order} aria-labelledby="fertilizer-order-title">
      <p className={f.kicker}>Find your size</p><h2 id="fertilizer-order-title">Choose your pack</h2><p className={f.orderIntro}>One design. Three sizes. Choose what suits your space.</p>
      <div className={`${s.card} ${s.product} ${f.orderCard}`}>
        <img className={f.packPhoto} data-testid="fertilizer-pack-photo" src={packPhotos[weight]} width="1600" height="1073" alt={`EcoBiz ${weight} kg fertilizer packaging with soil and a potted plant`}/>
        <h3 id="product-name" className={f.productName}>Eco Fertilizer</h3>
        <div className={s.weights} aria-label="Pack size">{([1, 3, 5] as const).map(size => <button key={size} aria-pressed={weight === size} onClick={() => chooseWeight(size)}>{size} kg</button>)}</div>
        <div className={s.priceRow}><strong className={s.price} data-testid="product-price">{rm(packPrice(weight))}</strong><span className={s.stock}><i/>Sample stock</span></div>
        <div className={s.fulfillment} aria-label="Collection method">{(['pickup', 'delivery'] as const).map(method => <button key={method} aria-pressed={fulfillment === method} onClick={() => { setFulfillment(method); setAdded(false); }}><Icon name={method === 'pickup' ? 'bag' : 'delivery'}/>{method === 'pickup' ? 'Pickup' : 'Delivery'}</button>)}</div>
        <button ref={add} className={s.primary} disabled={!ready} onClick={() => { dialog.current?.showModal(); cancel.current?.focus(); }}><Icon name="cart"/>Add to order</button>
        {added && <p role="status" className={s.feedback}>Added. <Link href="/orders">View order →</Link></p>}
        <p className={f.orderNote}>Sample pricing and orders for this preview.</p>
      </div>
    </section>
    <section className={f.guide} aria-labelledby="fertilizer-guide-title">
      <p className={f.kicker}>Before you plant</p><h2 id="fertilizer-guide-title">Get to know the product</h2>
      <p>The details that matter, before it reaches your garden.</p>
      <details><summary>What goes into it?</summary><p>Bokashi and vegetable scraps, including bayam, carrots, cabbage (kubis) and cauliflower (kubis bunga). The final formulation is still being tested.</p></details>
      <details><summary>What about protein scraps?</summary><p>Bokashi can also process meat and dairy. These are possible future inputs; we haven’t tested them in our trial, so they aren’t part of our confirmed recipe.</p></details>
      <details><summary>Where can I use it?</summary><p>Plant and soil suitability will be confirmed through testing, then published with the product information.</p></details>
      <details><summary>How should I apply it?</summary><p>Application amounts and frequency will be published after the formulation has been validated.</p></details>
      <a className={f.source} href="https://extension.wsu.edu/kitsap/bokashi-composting/" target="_blank" rel="noreferrer">About bokashi · WSU Extension ↗</a>
    </section>
    <dialog ref={dialog} className={s.dialog} onCancel={close} aria-labelledby="order-dialog-title"><h2 id="order-dialog-title">Your sample order</h2><p>Eco Fertilizer · {weight} kg</p><p>{rm(packPrice(weight))} · {fulfillment === 'pickup' ? 'Campus pickup' : 'Campus delivery'}</p><small>Sample only. No payment or real order.</small><div className={s.dialogActions}><button ref={cancel} className={s.secondary} onClick={close}>Cancel</button><button className={s.primary} onClick={() => { dispatch({ type: 'order', id: crypto.randomUUID(), weight, fulfillment }); setAdded(true); close(); }}>Confirm sample order</button></div></dialog>
  </div>;
}
