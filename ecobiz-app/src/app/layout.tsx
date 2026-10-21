import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/commerce/CommerceShell';
import './globals.css';
export const metadata: Metadata = { title: 'EcoBiz · Campus, made greener', description: 'EcoBiz campus meals, fertilizer and student delivery. Frontend sandbox with sample data.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#062d20' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><AppShell>{children}</AppShell></body></html>;
}
