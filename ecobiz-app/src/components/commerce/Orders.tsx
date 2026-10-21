'use client';
import Link from 'next/link';
import { useCommerce } from './CommerceProvider';
import { rm } from '@/lib/commerce';
import { CommerceIcon as Icon } from './CommerceIcon';
import s from './Commerce.module.css';
export default function Orders() {
  const { state, ready } = useCommerce();
  return <><h1 className={s.pageTitle}>My Orders</h1><Link className={`${s.card} ${s.historyLink}`} href="/reservations"><Icon name="meals"/><span>Meal reservations</span><Icon name="chevron"/></Link><h2 className={s.sectionTitle}>Fertilizer</h2>{!ready ? <p role="status">Loading orders…</p> : state.orders.length ? <ul className={s.orderList}>{state.orders.map(order => <li key={order.id} className={s.card}><span className={s.badge}>Sample order</span><h2>Eco Fertilizer · {order.weight} kg</h2><div className={s.priceRow}><strong className={s.price}>{rm(order.priceSen)}</strong><span>{order.fulfillment === 'delivery' ? 'Campus delivery' : 'Campus pickup'}</span></div>{order.fulfillment === 'delivery' && <Link className={s.secondary} href="/delivery">View sample delivery <Icon name="arrow"/></Link>}</li>)}</ul> : <section className={s.card}><Icon name="bag"/><h2>No orders yet</h2><Link className={s.primary} href="/fertilizer">Browse fertilizer <Icon name="arrow"/></Link></section>}</>;
}
