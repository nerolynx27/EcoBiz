'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { DemoProvider } from '@/components/DemoProvider';
import { Header, Navigation } from '@/components/EcoBiz';
import { LeafBackdrop } from '@/components/LeafDecoration';
import leaves from '@/components/LeafDecoration.module.css';
import legacy from '@/components/EcoBiz.module.css';
import { CommerceProvider, useCommerce } from './CommerceProvider';
import { CommerceIcon as Icon } from './CommerceIcon';
import s from './Commerce.module.css';
const links = [ ['/', 'Meals', 'meals'], ['/fertilizer', 'Fertilizer', 'leaf'], ['/delivery', 'Delivery', 'delivery'], ['/orders', 'My Orders', 'orders'], ['/account', 'Account', 'account'] ];
export function CommerceNavigation({ active, wide = false }: { active: string; wide?: boolean }) {
  return <nav className={`${s.nav} ${wide ? s.wideNav : ''}`} aria-label="Main navigation">{links.map(([href, label, icon]) => <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}><Icon name={icon}/><span>{label}</span></Link>)}</nav>;
}
export function CommerceHeader() {
  return <header className={s.header}><Link href="/" className={s.wordmark} aria-label="EcoBiz home">EcoBiz<span aria-hidden="true">⌁</span></Link><span className={s.campus}>UNITEN</span><Link className={s.account} href="/account" aria-label="Account"><Icon name="account"/></Link></header>;
}
export function CommerceFrame({ children, active, board = false }: { children: ReactNode; active: string; board?: boolean }) {
  const { notice } = useCommerce();
  return <div className={`${s.screen} ${board ? s.boardScreen : ''}`}><div className={s.leaves} aria-hidden="true"/><CommerceHeader/><div className={s.content}>{children}</div>{notice && <p className={s.notice} role="status">{notice}</p>}<div className={s.sample}>Sample demo</div><CommerceNavigation active={active}/></div>;
}
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const commerce = path === '/fertilizer' || path.startsWith('/delivery') || path === '/orders';
  const board = path === '/sandbox';
  let content: ReactNode;
  if (board) content = <main id="main" className={s.boardRoot}>{children}</main>;
  else if (commerce) content = <main id="main" className={s.standalone}><CommerceFrame active={path.startsWith('/delivery') ? '/delivery' : path}>{children}</CommerceFrame></main>;
  else content = <><div className={legacy.shell}><Header/><div className={leaves.stage}><LeafBackdrop/><main id="main" className={leaves.content}>{children}</main></div></div><Navigation/></>;
  return <DemoProvider hideControls={commerce || board}><CommerceProvider>{content}</CommerceProvider></DemoProvider>;
}
export function DeliveryTabs({ runner = false }: { runner?: boolean }) {
  return <div className={s.tabs} aria-label="Delivery views"><Link href="/delivery" aria-current={!runner ? 'page' : undefined}>My deliveries</Link><Link href="/delivery/runner" aria-current={runner ? 'page' : undefined}>Earn as runner</Link></div>;
}
