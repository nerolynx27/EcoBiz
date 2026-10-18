'use client';
import { useState } from 'react';
import { money } from '@/lib/demo';
import { report } from '@/lib/operations';
import { useDemo } from './DemoProvider';
import s from './EcoBiz.module.css';
import { LeafSectionAccent } from './LeafDecoration';
export default function OperationsReport({ date }: { date: string }) {
  const demo = useDemo(); const totals = report(demo.state, date);
  const [message, setMessage] = useState('');
  const metrics = [['Completed units', totals.units], ['Vendor proceeds', money(totals.vendorSen)], ['EcoBiz fees owed', money(totals.feeSen)], ['Fees settled', money(totals.settledSen)], ['Outstanding balance', money(totals.outstandingSen)], ['Cancellations', totals.cancelled], ['No-shows', totals.noShow], ['Unresolved reservations', totals.unresolved]];
  return <><LeafSectionAccent /><section className={s.detailSection} id="reports"><h2>Daily summary</h2><p>Cabin Vendor · {date} · Asia/Kuala_Lumpur. These are demo records, not real sales.</p><dl className={s.metrics}>{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd data-testid={String(label)}>{value}</dd></div>)}</dl>
    <p>Vendor proceeds and fees owed = completed price snapshots + reservation adjustments. Settled = settlement records + settlement adjustments. Outstanding = fees owed − settled. Completion alone does not settle the fee.</p>
    <p role="status">{totals.outstandingSen < 0 ? 'Credit / discrepancy: settled fees exceed adjusted fees owed. Reconcile the original evidence.' : totals.outstandingSen > 0 ? 'Unsettled balance remains.' : 'Recorded fee balance reconciles.'} {totals.unresolved > 0 ? `${totals.unresolved} reservation(s) still need handover reconciliation.` : ''}</p>
    <button className={s.button} onClick={() => { try { const blob = new Blob([demo.exportCsv(date)], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `ecobiz-SAMPLE-${date}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('Sample CSV downloaded. No customer contact details included.'); } catch (error) { setMessage((error as Error).message); } }}>Download sample CSV</button><p role="status">{message}</p>
  </section></>;
}
