import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LandingPage from './landing/page';

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'instructor' ? '/instructor' : '/dashboard');
  return <LandingPage />;
}
