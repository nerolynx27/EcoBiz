import type { ReactNode } from 'react';
const paths: Record<string, ReactNode> = {
  meals: <><path d="M4 3v6c0 3 6 3 6 0V3M7 3v18M19 3c-4 3-4 9 0 9V3Zm0 9v9" /></>,
  leaf: <><path d="M4 20C0 8 12 3 21 3c0 12-5 19-15 15M4 21 17 8M8 16v-6m0 6h6" /></>,
  delivery: <><path d="M2 5h12v12H2zM14 9h4l4 4v4h-8M5 17v1m14-1v1" /><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  orders: <><path d="M6 3h14v18H6zM3 6v15M9 7h8M9 11h8M9 15h8" /></>,
  account: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/></>,
  bag: <><path d="M5 7h14l1 14H4L5 7ZM8 8V6a4 4 0 0 1 8 0v2"/><path d="m10 13 2 2 3-3"/></>,
  cart: <><path d="M2 3h3l3 13h11l3-9H6M9 20h.01M18 20h.01"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>,
  pin: <><path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2.5"/></>,
  arrow: <path d="M3 12h17m-6-6 6 6-6 6"/>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  message: <><path d="M3 3h18v14H9l-6 5V3Z"/><path d="M7 7h10M7 11h7"/></>,
  key: <><circle cx="16" cy="7" r="5"/><path d="m12 11-9 9v2h4v-3h3v-3h3"/></>,
  copy: <><rect x="7" y="6" width="13" height="16" rx="2"/><path d="M16 6V2H3v16h4"/></>,
  wallet: <><path d="m4 6 14-4 2 5M3 7h18v14H3V7ZM16 12h5v5h-5z"/></>,
  box: <><path d="m12 2 10 5v10l-10 5L2 17V7l10-5ZM2 7l10 5 10-5M12 12v10M7 4l10 5v5"/></>,
  bike: <><circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-10 6 10H5l7-7h5M9 7H7m9-3h3l-2 6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
};
export function CommerceIcon({ name, className }: { name: string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.leaf}</svg>;
}
