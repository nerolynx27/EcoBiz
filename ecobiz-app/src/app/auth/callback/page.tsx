import Link from 'next/link';
import s from '@/components/EcoBiz.module.css';
export default function Page() { return <section className={s.panel}><h1>Authentication is not connected</h1><p>This technical callback has no OAuth provider or session exchange in the demo. No Google sign-in has occurred. Use the separately labelled demo account to review the frontend.</p><Link className={s.button} href="/sign-in">Open demo sign-in</Link><Link className={s.textLink} href="/">Browse meals</Link></section>; }
