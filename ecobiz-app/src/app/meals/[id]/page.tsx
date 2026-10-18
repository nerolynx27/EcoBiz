import MealDetail from '@/components/MealDetail';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MealDetail id={(await params).id} />;
}
