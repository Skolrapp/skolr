import * as tus from 'tus-js-client';

export type BunnyUploadConfig = {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
  uploadEndpoint: string;
  hlsUrl: string;
  embedUrl: string;
};

export type UploadedVideo = {
  videoId: string;
  hlsUrl: string;
  embedUrl: string;
  durationSeconds: number;
  fileName: string;
};

export type BunnyPlaybackCheck = {
  ready: boolean;
  message: string;
};

export function formatUploadProgress(bytesUploaded: number, bytesTotal: number) {
  if (!bytesTotal) return 'Preparing upload...';
  const percent = Math.round((bytesUploaded / bytesTotal) * 100);
  const uploadedMb = (bytesUploaded / 1024 / 1024).toFixed(1);
  const totalMb = (bytesTotal / 1024 / 1024).toFixed(1);
  return `${percent}% uploaded (${uploadedMb} MB / ${totalMb} MB)`;
}

async function getVideoDurationSeconds(file: File) {
  return new Promise<number>((resolve) => {
    const media = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    media.preload = 'metadata';
    media.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.round(media.duration || 0));
    };
    media.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };
    media.src = objectUrl;
  });
}

export async function uploadVideoToBunny(
  file: File,
  onProgress?: (message: string) => void
): Promise<UploadedVideo> {
  onProgress?.('Preparing Bunny upload...');

  const createRes = await fetch('/api/instructor/bunny-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title: file.name.replace(/\.[^.]+$/, ''),
    }),
  });

  const createJson = await createRes.json();
  if (!createRes.ok || !createJson.success) {
    throw new Error(createJson.error || 'Failed to prepare Bunny upload.');
  }

  const config = createJson.data as BunnyUploadConfig;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: config.uploadEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 5 * 1024 * 1024,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: file.name,
        filetype: file.type || 'video/mp4',
        title: file.name.replace(/\.[^.]+$/, ''),
      },
      headers: {
        AuthorizationSignature: config.signature,
        AuthorizationExpire: String(config.expirationTime),
        VideoId: config.videoId,
        LibraryId: config.libraryId,
      },
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress?.(formatUploadProgress(bytesUploaded, bytesTotal));
      },
      onSuccess: () => resolve(),
    });

    upload
      .findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      })
      .catch(reject);
  });

  const durationSeconds = await getVideoDurationSeconds(file);

  return {
    videoId: config.videoId,
    hlsUrl: config.hlsUrl,
    embedUrl: config.embedUrl,
    durationSeconds,
    fileName: file.name,
  };
}

export async function checkBunnyPlaybackReady(video: Pick<UploadedVideo, 'videoId' | 'hlsUrl'>): Promise<BunnyPlaybackCheck> {
  const params = new URLSearchParams({
    videoId: video.videoId,
    hlsUrl: video.hlsUrl,
  });

  const response = await fetch(`/api/instructor/bunny-video-status?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Could not verify Bunny playback status.');
  }

  return {
    ready: !!data.data?.ready,
    message: data.data?.message || 'Bunny status updated.',
  };
}

export async function waitForBunnyPlaybackReady(
  video: Pick<UploadedVideo, 'videoId' | 'hlsUrl'>,
  onProgress?: (message: string) => void,
  options?: { attempts?: number; intervalMs?: number }
): Promise<BunnyPlaybackCheck> {
  const attempts = options?.attempts ?? 15;
  const intervalMs = options?.intervalMs ?? 5000;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const status = await checkBunnyPlaybackReady(video);
    if (status.ready) {
      onProgress?.('Upload complete. Bunny stream is ready to play.');
      return status;
    }

    onProgress?.(status.message);
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    ready: false,
    message: 'Bunny is still processing this video. Wait a little longer, then save again once the stream is ready.',
  };
}
