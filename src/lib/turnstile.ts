type TurnstileVerificationResult = {
  success: boolean;
  error?: string;
};

function getTurnstileConfigState() {
  const hasSiteKey = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasSecretKey = !!process.env.TURNSTILE_SECRET_KEY;

  if (hasSiteKey && hasSecretKey) return 'configured';
  if (!hasSiteKey && !hasSecretKey) return 'disabled';
  return 'partial';
}

export function isTurnstileEnabled() {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

export async function verifyTurnstileToken(token: string | null | undefined, remoteip?: string | null): Promise<TurnstileVerificationResult> {
  const configState = getTurnstileConfigState();

  if (configState === 'disabled') {
    return { success: true };
  }

  if (configState === 'partial') {
    console.warn('[turnstile] Partial configuration detected. Bypassing verification until both keys are set.');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Please complete the security check.' };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Security check failed. Please try again.' };
    }

    const result = await response.json() as {
      success?: boolean;
      'error-codes'?: string[];
    };

    if (!result.success) {
      return { success: false, error: 'Security check failed. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('[turnstile]', error);
    return { success: false, error: 'Security check failed. Please try again.' };
  }
}
