'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type Props = {
  onTokenChange: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
};

const SCRIPT_ID = 'cf-turnstile-script';

export default function TurnstileWidget({ onTokenChange, onExpire, theme = 'dark' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined') return;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          onTokenChange(token);
        },
        'expired-callback': () => {
          onTokenChange('');
          onExpire?.();
        },
        'error-callback': () => {
          onTokenChange('');
          onExpire?.();
        },
      });
      setReady(true);
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', renderWidget);
      return () => existingScript.removeEventListener('load', renderWidget);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderWidget);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', renderWidget);
    };
  }, [onExpire, onTokenChange, siteKey, theme]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!siteKey) return null;

  return (
    <div>
      <div ref={containerRef} />
      {!ready && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', marginTop: 8 }}
        >
          Loading security check...
        </div>
      )}
    </div>
  );
}
