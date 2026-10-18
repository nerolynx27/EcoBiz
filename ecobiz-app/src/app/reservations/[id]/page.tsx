import PickupPass from '@/components/PickupPass';
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ recovered?: string }> }) {
  return <PickupPass id={(await params).id} recovered={(await searchParams).recovered === '1'} />;
}
