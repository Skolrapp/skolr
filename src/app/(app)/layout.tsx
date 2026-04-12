import type { ReactNode } from 'react';
import '@/styles/responsive.css';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
