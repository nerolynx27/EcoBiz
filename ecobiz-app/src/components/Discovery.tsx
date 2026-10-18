'use client';
import Link from 'next/link';
import { availability, malaysiaDate, money, pickup, scenarioOffer, serviceDate, totalSen, vendor, type Offer } from '@/lib/demo';
import { useDemo } from './DemoProvider';
import { HeroArt, Icon, MealPhoto, ReservationStatus } from './EcoBiz';
import s from './EcoBiz.module.css';
import { LeafCardRibbon } from './LeafDecoration';
import leaves from './LeafDecoration.module.css';

function MealCard({ meal }: { meal: Offer }) {
  const { now } = useDemo();
  const status = availability(meal, now);
  return <article className={s.card}>
    <MealPhoto meal={meal} />
    <div className={s.cardBody}><h3>{meal.name}</h3><p className={s.vendorName}>{vendor.name} · sample</p>
      <div className={s.stock}><span>{meal.remainingStock} left</span><small>{status}</small></div>
      <p className={s.price}>{money(totalSen(meal))}</p><p className={s.fee}>Includes {money(meal.feeSen)} fee</p>
      <Link href={`/meals/${meal.id}`} className={s.button} aria-label={`View ${meal.name}`}>View meal <Icon name="arrow" /></Link>
    </div>
  </article>;
}
export default function Discovery() {
  const { signedIn, scenario, setScenario, profile, state } = useDemo();
  const offers = state.offers.filter(o => o.status !== 'unpublished' && o.serviceDate === malaysiaDate(state.now));
  return <div className={s.homeScene}>
    <HeroArt />
    <section className={s.hero}>
      <div className={s.heroCopy}><p className={s.greeting}>Good evening{signedIn ? ',' : ''}{signedIn && <strong>{profile.displayName}</strong>}</p><span className={s.shortRule} />
      <h1>Tonight’s<br />good food</h1><p className={s.tagline}>Reserve now. Pay at pickup.</p></div>
    </section>
    {offers[0] && <div className={s.pickup}><Icon name="clock" /><div><strong>Pickup {pickup(offers[0])}</strong><span>{serviceDate(offers[0].serviceDate)} · Malaysia time</span></div></div>}
    <section aria-labelledby="offers-heading" className={s.offers}>
      <div className={s.sectionHeading}><h2 id="offers-heading">{scenario === 'Available' || scenario === 'Long names' || scenario === 'Failed image' ? 'Available tonight' : 'Tonight’s sample offers'}</h2><span className={s.sampleTag}>Sample offers</span></div>
      <p className={s.vendor}><Icon name="shop" />{vendor.name}<span>Sample vendor</span></p>
      <div aria-live="polite" aria-atomic="true" className={leaves.cardGroup}>
        <LeafCardRibbon />
        {scenario === 'Loading' ? <div className={s.loading} role="status"><div className={s.skeleton} /><div className={s.skeleton} /><p>Loading sample meals… Choose another scenario to finish this preview.</p></div>
        : scenario === 'Load error' ? <div className={s.state}><h3>We couldn’t load tonight’s meals</h3><p>This is a simulated connection error. Give it another try.</p><button className={s.button} onClick={() => setScenario('Available')}>Retry loading meals <Icon name="arrow" /></button></div>
        : scenario === 'Empty list' || scenario === 'Unpublished' || !offers.length ? <div className={s.state}><Icon name="meals" /><h3>No meals listed tonight</h3><p>{scenario === 'Unpublished' ? 'Unpublished offers are not shown to customers.' : 'There are no sample offers in this scenario.'} Check back another evening.</p></div>
        : <div className={s.grid}>{offers.map(offer => <MealCard key={offer.id} meal={scenarioOffer(offer, scenario)} />)}</div>}
      </div>
    </section>
    <ReservationStatus />
    <p className={s.disclaimer}>Design preview · Sample meals<br />No confirmed vendor participation or university endorsement.</p>
  </div>;
}



