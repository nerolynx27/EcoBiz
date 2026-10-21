import Fertilizer from '@/components/commerce/Fertilizer';
import Delivery from '@/components/commerce/Delivery';
import Runner from '@/components/commerce/Runner';
import { CommerceFrame } from '@/components/commerce/CommerceShell';
import { CommerceProvider } from '@/components/commerce/CommerceProvider';
import s from '@/components/commerce/Commerce.module.css';
export default function Page() {
  return <div className={s.board}><div className={s.boardHeading}><span>EcoBiz / Sandbox</span><span>Approved concept · Live UI</span></div><div className={s.phones}>{[
    { title: '01 / Fertilizer', active: '/fertilizer', content: <Fertilizer/> },
    { title: '02 / My delivery', active: '/delivery', content: <Delivery/> },
    { title: '03 / Student runner', active: '/delivery', content: <Runner/> },
  ].map(screen => <section key={screen.title} className={s.phoneColumn} aria-label={screen.title}><p className={s.phoneLabel}>{screen.title}</p><div className={s.phone}><div className={s.statusBar}><span>9:41</span><span aria-label="Full signal and battery">▮▮▮ ◉ ▰</span></div><CommerceProvider preview><CommerceFrame board active={screen.active}>{screen.content}</CommerceFrame></CommerceProvider></div></section>)}</div></div>;
}
