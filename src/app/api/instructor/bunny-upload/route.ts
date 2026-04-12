import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

type CreateVideoResponse = {
  guid: string;
  title: string;
};

const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
const BUNNY_STREAM_PULL_ZONE = process.env.BUNNY_STREAM_PULL_ZONE;
const BUNNY_STREAM_COLLECTION_ID = process.env.BUNNY_STREAM_COLLECTION_ID;

function isConfigured() {
  return !!(
    BUNNY_STREAM_API_KEY &&
    BUNNY_STREAM_LIBRARY_ID &&
    BUNNY_STREAM_PULL_ZONE
  );
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can upload videos.' }, { status: 403 });
  }

  if (!isConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Bunny Stream is not configured. Set BUNNY_STREAM_API_KEY, BUNNY_STREAM_LIBRARY_ID, and BUNNY_STREAM_PULL_ZONE.',
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null) as
    | {
        title?: string;
      }
    | null;

  const title = body?.title?.trim() || 'Untitled course video';

  const createResponse = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        AccessKey: BUNNY_STREAM_API_KEY!,
      },
      body: JSON.stringify({
        title,
        ...(BUNNY_STREAM_COLLECTION_ID ? { collectionId: BUNNY_STREAM_COLLECTION_ID } : {}),
      }),
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create Bunny video. ${errorText || 'Unknown Bunny error.'}`,
      },
      { status: 502 }
    );
  }

  const video = await createResponse.json() as CreateVideoResponse;
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const signature = createHash('sha256')
    .update(`${BUNNY_STREAM_LIBRARY_ID}${BUNNY_STREAM_API_KEY}${expirationTime}${video.guid}`)
    .digest('hex');

  return NextResponse.json({
    success: true,
    data: {
      videoId: video.guid,
      libraryId: BUNNY_STREAM_LIBRARY_ID,
      expirationTime,
      signature,
      uploadEndpoint: 'https://video.bunnycdn.com/tusupload',
      hlsUrl: `https://${BUNNY_STREAM_PULL_ZONE}.b-cdn.net/${video.guid}/playlist.m3u8`,
      embedUrl: `https://iframe.mediadelivery.net/embed/${BUNNY_STREAM_LIBRARY_ID}/${video.guid}`,
    },
  });
}
