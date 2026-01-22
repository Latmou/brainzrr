import { NextRequest, NextResponse } from 'next/server';
import { YtDlp } from 'ytdlp-nodejs';
import { musicBrainzService } from '@/app/_lib/musicbrainz';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'audio');

export async function GET(
  req: NextRequest
) {
  const { searchParams } = new URL(req.url);
  const mbid = searchParams.get('mbid');

  if (!mbid) {
    return NextResponse.json({ error: 'MBID is required' }, { status: 400 });
  }

  const cachePath = path.join(CACHE_DIR, `${mbid}.mp3`);

  // If it's cached, it's definitely ready
  if (fs.existsSync(cachePath)) {
    return NextResponse.json({ ready: true, found: true });
  }

  try {
    const recording = await musicBrainzService.getRecording(mbid);
    if (!recording) {
        return NextResponse.json({ ready: false, found: false });
    }

    const artistName = recording['artist-credit']?.[0]?.name || '';
    const query = `${recording.title} ${artistName}`;
    const youtubeSearch = `ytsearch1:${query}`;

    const ytdlp = new YtDlp();
    const info = await ytdlp.getInfoAsync(youtubeSearch) as any;
    
    if (info && info.entries && info.entries.length > 0) {
        return NextResponse.json({ ready: true, found: true });
    } else {
        return NextResponse.json({ ready: false, found: false });
    }
  } catch (error: any) {
    console.error('Check stream error:', error);
    return NextResponse.json({ ready: false, found: false, error: error.message }, { status: 500 });
  }
}
