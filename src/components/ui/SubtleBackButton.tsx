'use client';

import { useRouter } from 'next/navigation';

type SubtleBackButtonProps = {
  fallbackHref: string;
  label?: string;
  light?: boolean;
};

export default function SubtleBackButton({
  fallbackHref,
  label = 'Back',
  light = false,
}: SubtleBackButtonProps) {
  const router = useRouter();
  const textColor = light ? 'rgba(255,255,255,0.82)' : '#5b6570';
  const borderColor = light ? 'rgba(255,255,255,0.14)' : '#e5e7eb';
  const background = light ? 'rgba(255,255,255,0.08)' : '#ffffff';

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          const hasHistory = window.history.length > 1;
          const referrer = document.referrer;

          if (referrer) {
            try {
              const previousUrl = new URL(referrer);
              if (previousUrl.origin === window.location.origin && hasHistory) {
                router.back();
                return;
              }
            } catch {
              // Fall through to the fallback route when the referrer cannot be parsed.
            }
          } else if (hasHistory) {
            router.back();
            return;
          }
        }
        router.push(fallbackHref);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 36,
        padding: '0 12px',
        borderRadius: 999,
        border: `1px solid ${borderColor}`,
        background,
        color: textColor,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        width: 'fit-content',
      }}
      aria-label={label}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
