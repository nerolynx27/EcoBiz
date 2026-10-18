import type { Metadata, Viewport } from 'next';
import { DemoProvider } from '@/components/DemoProvider';
import { Header, Navigation } from '@/components/EcoBiz';
import { LeafBackdrop } from '@/components/LeafDecoration';
import leaves from '@/components/LeafDecoration.module.css';
import s from '@/components/EcoBiz.module.css';
import './globals.css';
export const metadata: Metadata = { title: 'EcoBiz · Tonight’s good food', description: 'EcoBiz meal discovery frontend prototype. Sample offers only.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#102C23' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><DemoProvider><div className={s.shell}><Header /><div className={leaves.stage}><LeafBackdrop /><main id="main" className={leaves.content}>{children}</main></div></div><Navigation /></DemoProvider></body></html>;
}
