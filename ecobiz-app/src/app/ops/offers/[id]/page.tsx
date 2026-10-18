import OfferEditor from '@/components/OfferEditor';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OfferEditor id={(await params).id} />; }
