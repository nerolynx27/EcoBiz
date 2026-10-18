import SignIn from '@/components/SignIn';
import { safeReturn } from '@/lib/demo';
export default async function Page({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  return <SignIn destination={safeReturn((await searchParams).returnTo)} />;
}
