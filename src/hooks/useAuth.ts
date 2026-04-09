'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const fetchUser = useCallback(async () => {
    try {
      const res  = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setState({ user: data.user, loading: false });
      } else {
        if (data.code === 'SESSION_INVALID') router.push('/login?reason=session_ended');
        setState({ user: null, loading: false });
      }
    } catch {
      setState({ user: null, loading: false });
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 60_000);
    return () => clearInterval(interval);
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setState({ user: null, loading: false });
    router.push('/login');
  }, [router]);

  return { ...state, logout, refetch: fetchUser };
}
