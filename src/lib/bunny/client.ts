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
