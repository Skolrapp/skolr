type TurnstileVerificationResult = {
  success: boolean;
  error?: string;
};

function isTurnstileConfigured() {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !!process.env.TURNSTILE_SECRET_KEY;
}

export function isTurnstileEnabled() {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

export async function verifyTurnstileToken(token: string | null | undefined, remoteip?: string | null): Promise<TurnstileVerificationResult> {
  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      return { success: true };
    }
    return { success: false, error: 'Security check is unavailable right now. Please try again later.' };
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
