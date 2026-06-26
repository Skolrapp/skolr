const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;

type BunnyVideoDetails = {
  status?: number | string | null;
  encodeProgress?: number | null;
};

export type BunnyPlaybackStatus = {
  ready: boolean;
  message: string;
  status?: number | string | null;
  encodeProgress?: number | null;
};

function looksLikeBunnyHlsUrl(hlsUrl: string) {
  return /^https:\/\/.+\.b-cdn\.net\/.+\/playlist\.m3u8(?:\?.*)?$/i.test(hlsUrl);
}

async function checkPlaylistAvailability(hlsUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(hlsUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    });

    if (response.ok) return true;
    if (response.status !== 405) return false;

    const fallbackResponse = await fetch(hlsUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Range: 'bytes=0-0',
      },
    });

    return fallbackResponse.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBunnyVideoDetails(videoId: string): Promise<BunnyVideoDetails | null> {
  if (!BUNNY_STREAM_API_KEY || !BUNNY_STREAM_LIBRARY_ID) return null;

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          AccessKey: BUNNY_STREAM_API_KEY,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json() as BunnyVideoDetails;
    return data;
  } catch {
    return null;
  }
}

function formatWaitingMessage(details: BunnyVideoDetails | null) {
  if (typeof details?.encodeProgress === 'number') {
    const rounded = Math.max(0, Math.min(100, Math.round(details.encodeProgress)));
    if (rounded >= 100) {
      return 'Bunny finished encoding, but the stream is still propagating. Check again in a moment.';
    }
    return `Bunny is still processing this video (${rounded}% complete).`;
  }

  if (details?.status !== undefined && details?.status !== null) {
    return `Bunny is still preparing this video (status: ${details.status}).`;
  }

  return 'Bunny is still preparing this video. Try again in a moment.';
}

export async function getBunnyPlaybackStatus(videoId: string, hlsUrl: string): Promise<BunnyPlaybackStatus> {
  if (!hlsUrl?.trim() || !hlsUrl.endsWith('.m3u8')) {
    return { ready: false, message: 'A valid Bunny HLS playlist is required.' };
  }

  if (!looksLikeBunnyHlsUrl(hlsUrl)) {
    return { ready: true, message: 'Non-Bunny HLS URL detected. Skipping Bunny readiness check.' };
  }

  const isPlaylistReady = await checkPlaylistAvailability(hlsUrl);
  if (isPlaylistReady) {
    return { ready: true, message: 'Bunny stream is ready to play.' };
  }

  const details = videoId ? await fetchBunnyVideoDetails(videoId) : null;
  return {
    ready: false,
    message: formatWaitingMessage(details),
    status: details?.status,
    encodeProgress: details?.encodeProgress,
  };
}

export async function ensureBunnyPlaybackReady(hlsUrl: string, videoId?: string | null) {
  if (!looksLikeBunnyHlsUrl(hlsUrl)) return null;

  const status = await getBunnyPlaybackStatus(videoId || '', hlsUrl);
  return status.ready ? null : status.message;
}
