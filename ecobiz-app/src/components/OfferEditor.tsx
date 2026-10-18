'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fromMalaysia, localDateTime, malaysiaDate, money, pickup, totalSen, vendor, type Offer } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { MealPhoto } from './EcoBiz';
import { ConfirmAction, StaffOnly } from './StaffShared';
import s from './EcoBiz.module.css';
import { LeafSectionAccent } from './LeafDecoration';
export default function OfferEditor({ id, serviceDate }: { id?: string; serviceDate?: string }) { return <StaffOnly>{id ? <Editor key={id} id={id} /> : <NewOffers serviceDate={serviceDate} />}</StaffOnly>; }
function Editor({ id }: { id?: string }) {
  const demo = useDemo(); const router = useRouter(); const form = useRef<HTMLFormElement>(null); const errorRef = useRef<HTMLParagraphElement>(null);
  const original = demo.state.offers.find(o => o.id === id); const date = malaysiaDate(demo.now);
  const [newId] = useState(() => `offer-${crypto.randomUUID()}`);
  const [image, setImage] = useState(original?.image ?? '/chicken-rice.webp'); const [error, setError] = useState(''); const [reason, setReason] = useState('');
  if (id && !original) return <section className={s.panel}><h1>Offer not found</h1><Link className={s.button} href="/ops">Return to operations</Link></section>;
  const active = demo.state.reservations.filter(r => r.offerId === id && r.status === 'reserved').length;
  const withdrawn = original?.status === 'withdrawn';
  function save() {
    const values = new FormData(form.current!); const text = (key: string) => String(values.get(key) ?? '').trim();
    const offer: Offer = { id: id ?? newId, vendorId: vendor.id, name: text('name'), description: text('description'), portion: text('portion'), dietaryNotes: text('dietaryNotes') || undefined, image, location: text('location'), instructions: text('instructions'), vendorPriceSen: Number(text('vendorPriceSen')), feeSen: Number(text('feeSen')), remainingStock: Number(text('remainingStock')), serviceDate: text('serviceDate'), bookingCutoff: fromMalaysia(text('bookingCutoff')), cancellationCutoff: fromMalaysia(text('cancellationCutoff')), pickupStart: fromMalaysia(text('pickupStart')), pickupEnd: fromMalaysia(text('pickupEnd')), status: text('status') as Offer['status'] };
    try { demo.saveOffer(offer); router.push('/ops'); } catch (error) { setError((error as Error).message); setTimeout(() => errorRef.current?.focus(), 0); throw error; }
  }
  const fields = [
    ['name', 'Meal name', original?.name ?? '', 'text', 120], ['description', 'Description', original?.description ?? '', 'textarea', 1500], ['portion', 'Portion information', original?.portion ?? 'One individual meal portion', 'text', 200], ['dietaryNotes', 'Vendor ingredient / allergen notes (optional)', original?.dietaryNotes ?? '', 'textarea', 1000],
    ['remainingStock', 'Available unreserved stock', original?.remainingStock ?? 4, 'number', 10000], ['vendorPriceSen', 'Vendor price (integer sen)', original?.vendorPriceSen ?? 700, 'number', 1000000], ['feeSen', 'EcoBiz fee (integer sen)', original?.feeSen ?? 50, 'number', 1000000], ['serviceDate', 'Service date', original?.serviceDate ?? date, 'date', 0],
    ['bookingCutoff', 'Booking cutoff (Malaysia time)', original ? localDateTime(original.bookingCutoff) : `${date}T21:40`, 'datetime-local', 0], ['cancellationCutoff', 'Cancellation cutoff (Malaysia time)', original ? localDateTime(original.cancellationCutoff) : `${date}T21:40`, 'datetime-local', 0], ['pickupStart', 'Pickup start (Malaysia time)', original ? localDateTime(original.pickupStart) : `${date}T21:40`, 'datetime-local', 0], ['pickupEnd', 'Pickup end (Malaysia time)', original ? localDateTime(original.pickupEnd) : `${date}T21:55`, 'datetime-local', 0],
    ['location', 'Collection location', original?.location ?? vendor.location, 'text', 300], ['instructions', 'Collection instructions', original?.instructions ?? vendor.instructions, 'textarea', 1000],
  ] as const;
  return <><Link href="/ops" className={s.back}>← Operations</Link><section className={s.panel}><p className={s.eyebrow}>Staff demo · Cabin Vendor</p><h1>{id ? 'Edit sample offer' : 'Create sample offer'}</h1><p>Amounts are in integer sen: 700 = RM7.00. All times use Asia/Kuala_Lumpur.</p>{!!active && <p role="status">{active} active reservation(s). Only unreserved stock and publication status can change. To change meal, price or pickup terms, withdraw/cancel and publish a new offer.</p>}{withdrawn && <p role="status">This offer is withdrawn. Create a new offer to publish again.</p>}
    <form ref={form} className={s.form} onSubmit={e => e.preventDefault()}>
      <p ref={errorRef} id="offer-error" tabIndex={-1} role="alert">{error}</p>
      {fields.map(([key, label, value, type, max]) => <div key={key}><label htmlFor={key}>{label}</label>{type === 'textarea' ? <textarea id={key} name={key} defaultValue={value} required={key !== 'dietaryNotes'} maxLength={max} readOnly={withdrawn || !!active} aria-describedby="offer-error" /> : <input id={key} name={key} type={type} defaultValue={value} required={key !== 'portion'} min={type === 'number' ? key === 'vendorPriceSen' ? 1 : 0 : undefined} max={type === 'number' ? max : undefined} step={type === 'number' ? 1 : undefined} maxLength={type === 'text' ? max : undefined} readOnly={withdrawn || (!!active && key !== 'remainingStock')} aria-describedby="offer-error" />}</div>)}
      <label htmlFor="status">Publication status</label><select id="status" name="status" defaultValue={original?.status ?? 'unpublished'} disabled={withdrawn}><option value="unpublished">Draft · hidden from discovery</option><option value="published">Published</option><option value="closed">Paused · no new bookings</option>{withdrawn && <option value="withdrawn">Withdrawn</option>}</select>
      <PhotoInput image={image} setImage={setImage} setError={setError} disabled={!!active || withdrawn} />
      <p className={s.note}>Selected photos stay in this tab only. No image bytes are saved to browser storage; after refresh a clearly labelled photo fallback appears. Use a sample image only.</p>
      <MealPhoto meal={{ ...(original ?? demo.state.offers[0]), name: original?.name ?? 'Selected sample meal', image }} />
      <ConfirmAction label="Save offer" description={`${id ? 'Update' : 'Create'} this sample offer. Published offers appear in customer discovery.`} disabled={withdrawn} validate={() => form.current!.reportValidity()} run={save} />
    </form>
    {id && !withdrawn && <LeafSectionAccent />}{id && !withdrawn && <section className={s.detailSection}><h2>Withdraw offer</h2><p>Stops bookings and cancels {active} outstanding reservation(s). Existing agreements remain in history.</p><label htmlFor="withdraw-reason">Withdrawal reason</label><textarea id="withdraw-reason" className={s.input} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /><ConfirmAction label="Withdraw offer" description={`Withdraw ${original!.name} and cancel ${active} active reservation(s), with reason: ${reason || '(reason required)'}.`} run={() => { demo.withdraw(id, reason, true); return 'Offer withdrawn. Affected reservations cancelled with the reason.'; }} /></section>}
  </section></>;
}


function PhotoInput({ image, setImage, setError, disabled = false }: { image: string; setImage: (value: string) => void; setError: (value: string) => void; disabled?: boolean }) {
  const demo = useDemo();
  return <>      <label htmlFor="image">Meal photo · JPEG, PNG or WebP, up to 5 MB</label><input id="image" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Choose a JPEG, PNG or WebP image no larger than 5 MB.'); e.target.value = ''; return; }
        try { const bitmap = await createImageBitmap(file); if (bitmap.width * bitmap.height > 24000000) { bitmap.close(); throw new Error(); } bitmap.close(); if (image.startsWith('blob:') && !demo.state.offers.some(o => o.image === image)) URL.revokeObjectURL(image); setImage(URL.createObjectURL(file)); setError(''); }
        catch { setError('Image could not be decoded, or exceeds the 24-megapixel demo limit. Choose a smaller valid photo.'); }
      }} />
</>;
}

const templates = ['Nasi ayam goreng', 'Nasi ayam masak merah', 'Nasi ayam kicap', 'Nasi ayam masak lemak'];
function NewOffers({ serviceDate }: { serviceDate?: string }) {
  const demo = useDemo(); const [selected, setSelected] = useState(templates[0]); const [revision, setRevision] = useState(0);
  const date = serviceDate ?? malaysiaDate(demo.now);
  const published = demo.state.offers.filter(o => o.vendorId === vendor.id && o.serviceDate === date && o.status === 'published');
  function choose(value: string) { setSelected(value); setRevision(n => n + 1); }
  return <><Link href="/ops" className={s.back}>← Operations</Link><section className={`${s.panel} ${s.opsPanel}`}>
    <p className={s.eyebrow}>New offer · {vendor.name}</p><h1>Publish a meal</h1>
    <p>Service date: {date} · Asia/Kuala_Lumpur · {vendor.campus}. Proposed EcoBiz fee: RM0.50 per meal.</p>
    <div className={s.mealChooser}><div><label htmlFor="meal-template">Meal</label><select className={s.input} id="meal-template" value={selected} onChange={e => choose(e.target.value)}>{templates.map(name => <option key={name}>{name}</option>)}<option value="custom">Custom meal</option></select></div><button className={s.button} aria-label="Add custom meal" onClick={() => choose('custom')}>＋</button></div>
    <NewMealCard key={`${revision}:${date}`} selected={selected} date={date} onNext={() => choose(selected)} />
    <LeafSectionAccent /><section className={s.detailSection} aria-label="Published meals"><h2>Published meals · {date}</h2><p>These shared offers also appear in customer discovery.</p><div className={s.publishedMeals}>{published.map(offer => <article className={s.staffRecord} key={offer.id}><MealPhoto meal={offer} /><h3>{offer.name}</h3><p>{money(totalSen(offer))} total · {offer.remainingStock} available · {pickup(offer)}</p><Link className={s.textLink} href={`/ops/offers/${offer.id}`}>Edit {offer.name}</Link></article>)}</div></section>
  </section></>;
}
function NewMealCard({ selected, date, onNext }: { selected: string; date: string; onNext: () => void }) {
  const demo = useDemo(); const form = useRef<HTMLFormElement>(null);
  const [id] = useState(() => `offer-${crypto.randomUUID()}`); const saved = useRef(false);
  const [published, setPublished] = useState(false); const [image, setImage] = useState(''); const [error, setError] = useState('');
  const custom = selected === 'custom';
  function publish() {
    if (saved.current) return 'Already published. Edit the shared card below.';
    const data = new FormData(form.current!); const text = (key: string) => String(data.get(key) ?? '').trim();
    const pickupStart = fromMalaysia(`${date}T${text('pickupStart')}`);
    const offer: Offer = { id, vendorId: vendor.id, name: text('name'), description: text('description'), portion: '', image, location: text('location'), instructions: text('instructions'), vendorPriceSen: Math.round(Number(text('price')) * 100), feeSen: 50, remainingStock: Number(text('quantity')), serviceDate: date, pickupStart, pickupEnd: fromMalaysia(`${date}T${text('pickupEnd')}`), bookingCutoff: '', cancellationCutoff: '', status: 'published' };
    try {
      if (!/^\d+(\.\d{1,2})?$/.test(text('price'))) throw new Error('Enter a price with at most two decimal places.');
      if (!form.current!.reportValidity()) throw new Error('Check the required fields before publishing.');
      demo.saveOffer(offer); saved.current = true; setPublished(true); setError('');
      return 'Meal published. Its shared card is below; select another meal or create another offer to continue.';
    } catch (err) { setError((err as Error).message); throw err; }
  }
  return <form ref={form} className={`${s.form} ${s.mealEditor}`} aria-label="Meal editor" onSubmit={e => e.preventDefault()}>
    <MealPhoto meal={{ ...demo.state.offers[0], name: custom ? 'Custom meal' : selected, image }} />
    {!custom && <p className={s.note}>Prepared photo unavailable for {selected}. A matching image has not been supplied.</p>}
    <fieldset disabled={published}><legend>Meal details</legend><div className={s.editorFields}>
      <div className={s.fullField}><label htmlFor="new-name">Meal name</label><input id="new-name" name="name" defaultValue={custom ? '' : selected} readOnly={!custom} maxLength={120} required autoFocus={custom} /></div>
      {([['description', 'Description', 'Describe the meal and what is included.', 1500], ['location', 'Pickup location', 'For example, the counter and building name.', 300], ['instructions', 'Collection instructions', 'Explain where to queue and how to show the pickup reference.', 1000]] as const).map(([key, label, hint, max]) => <div className={s.fullField} key={key}><label htmlFor={`new-${key}`}>{label}</label><textarea id={`new-${key}`} name={key} required maxLength={max} placeholder={custom ? undefined : hint} /></div>)}
      <div><label htmlFor="new-price">Vendor price (RM)</label><input id="new-price" name="price" type="number" min="0.01" max="10000" step="0.01" required /></div>
      <div><label htmlFor="new-quantity">Available quantity</label><input id="new-quantity" name="quantity" type="number" min="0" max="10000" step="1" required /></div>
      <div><label htmlFor="new-start">Pickup start (Malaysia time)</label><input id="new-start" name="pickupStart" type="time" required /></div>
      <div><label htmlFor="new-end">Pickup end (Malaysia time)</label><input id="new-end" name="pickupEnd" type="time" required /></div>
    </div>{custom && <><PhotoInput image={image} setImage={setImage} setError={setError} /><p className={s.note}>Photo previews stay in this tab only. After refresh, a labelled fallback appears.</p></>}</fieldset>
    <p className={s.note}>Provisional assumption: booking and customer cancellation both close exactly at pickup start. Existing agreements keep their stored deadlines. Dietary information not provided.</p>
    <p role="alert" className={s.fieldError}>{error}</p>
    <ConfirmAction label="Publish meal" description="Publish this meal to customer discovery and add its shared card below." disabled={published} validate={() => form.current!.reportValidity()} run={publish} />
    {published && <button type="button" className={s.button} onClick={onNext}>Create another offer</button>}
  </form>;
}

