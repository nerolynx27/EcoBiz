import ReservationReview from '@/components/ReservationReview';
export default async function Page({ params }: { params: Promise<{ mealId: string }> }) {
  return <ReservationReview id={(await params).mealId} />;
}
