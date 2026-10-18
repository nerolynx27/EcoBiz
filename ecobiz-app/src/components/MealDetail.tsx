'use client';
import Link from 'next/link';
import { availability, money, pickup, scenarioOffer, serviceDate, time, totalSen, vendor } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { Icon, MealPhoto, NotFoundContent } from './EcoBiz';
import s from './EcoBiz.module.css';

export default function MealDetail({ id }: { id: string }) {
  const { scenario, now, state, active, signedIn } = useDemo();
  const original = state.offers.find(offer => offer.id === id);
  if (!original) return <NotFoundContent />;
  const meal = scenarioOffer(original, scenario);
  const status = availability(meal, now);
  const available = status === 'Available';
  return <>
    <Link className={s.back} href="/">← All meals</Link>
    <article className={s.detail}>
      <MealPhoto meal={meal} />
      <div className={s.detailContent}><p className={s.eyebrow}>Sample offer · {vendor.name}</p><h1>{meal.name}</h1><p className={s.detailStatus}>{status} · {meal.remainingStock} left</p><p>{meal.description}</p><p><strong>{meal.portion}</strong></p>
      <section className={s.detailSection}><h2>Know your meal</h2><p>{meal.dietaryNotes ?? 'Dietary information not provided'}</p><small>Ingredient and allergen information is supplied by the sample vendor. No dietary certification is implied.</small></section>
      <section className={s.detailSection}><h2>Pickup details</h2><dl className={s.facts}><dt>Service date</dt><dd>{serviceDate(meal.serviceDate)}</dd><dt>Pickup window</dt><dd>{pickup(meal)} MYT</dd><dt>Book / cancel before</dt><dd>{time(meal.bookingCutoff)} / {time(meal.cancellationCutoff)} MYT</dd><dt>Location</dt><dd>{meal.location ?? vendor.location}</dd></dl><p>{meal.instructions ?? vendor.instructions}</p></section>
      <section className={s.detailSection}><h2>A clear total</h2><dl className={s.facts}><dt>Vendor price</dt><dd>{money(meal.vendorPriceSen)}</dd><dt>EcoBiz fee</dt><dd>{money(meal.feeSen)}</dd><dt><strong>Total · one meal</strong></dt><dd><strong>{money(totalSen(meal))}</strong></dd></dl><p className={s.pay}>Pay at pickup</p></section>
      {active?.offerId === id ? <Link className={s.button} href={`/reservations/${active.id}`}>View reservation</Link> : available ? <Link className={s.button} href={signedIn ? `/reserve/${meal.id}` : `/sign-in?returnTo=${encodeURIComponent(`/reserve/${meal.id}`)}`}>Reserve <Icon name="arrow" /></Link> : <div role="status"><button className={s.button} disabled>{status}</button><p>This offer cannot begin a booking. Return to meals to explore the other sample offers.</p></div>}
      <p className={s.note}>Sample data only. Reservations are simulated locally.</p></div>
    </article>
  </>;
}



