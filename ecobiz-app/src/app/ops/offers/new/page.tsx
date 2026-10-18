import OfferEditor from '@/components/OfferEditor';
export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string | string[] }> }) {
  const { date } = await searchParams;
  const valid = typeof date === 'string' && /^\d{4}-\d\d-\d\d$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
  return <OfferEditor serviceDate={valid ? date : undefined} />;
}
