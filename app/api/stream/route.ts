import {NextRequest, NextResponse} from 'next/server';
import {musicBrainzService} from '@/app/_lib/musicbrainz';
import {prisma} from '@/app/_lib/prisma';
import fs from 'fs';
import path from 'path';
import {invidiousService} from "@/app/_lib/invidious";

const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'audio');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, {recursive: true});
}

export async function GET(
  req: NextRequest
) {
  const {searchParams} = new URL(req.url);
  const mbid = searchParams.get('mbid');
  const force = searchParams.get('t'); // If 't' is present, we might want to skip server cache if it failed

  if (!mbid) {
    return NextResponse.json({error: 'MBID is required'}, {status: 400});
  }

  const cachePath = path.join(CACHE_DIR, `${mbid}.mp3`);

  // Check if file is in server cache
  if (fs.existsSync(cachePath)) {
    if (force) {
      console.log(`[STREAM] ${cachePath} cache found but 'force' is enabled, removing...`);
      try {
        fs.unlinkSync(cachePath);
      } catch (e) {
        console.warn(`[STREAM] Failed to remove cache file: ${e}`);
      }
    } else {
      const stats = fs.statSync(cachePath);
      const fileStream = fs.createReadStream(cachePath);

      // Convert Node.js ReadStream to Web Stream
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        }
      });

      return new Response(webStream, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': stats.size.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  }

  try {
    const recording = await musicBrainzService.getRecording(mbid);

    const artistName = recording['artist-credit']?.[0]?.name || '';
    const query = `${recording.title} ${artistName}`;
    const {title, url} = await invidiousService.search(query);

    // Save YouTube info to DB for this recording
    try {
      await prisma.recording.update({
        where: {mbid},
        data: {
          youtubeTitle: title,
          youtubeUrl: url
        }
      });
      console.log(`[STREAM] Saved YouTube info for ${mbid}: ${title}`);
    } catch (e) {
      console.warn(`[STREAM] Failed to save YouTube info to DB: ${e}`);
    }

    // Set up a ReadableStream to proxy the audio data
    const webStream = await invidiousService.stream(url)

    if (!webStream) {
      throw new Error('Failed to get web stream from Invidious');
    }

    // Use a TransformStream or similar to capture data for caching if needed
    // But since we want to pipe to a file (Node.js) and return a Response (Web Stream),
    // we can use the webStream directly for the response and also pipe it to a file.
    
    const [responseStream, cacheStream] = webStream.tee();

    // Handle caching in background
    (async () => {
      try {
        const fileWriteStream = fs.createWriteStream(cachePath);
        const reader = cacheStream.getReader();
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          fileWriteStream.write(value);
        }
        fileWriteStream.end();
      } catch (e) {
        console.error(`[STREAM] Failed to cache stream for ${mbid}:`, e);
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }
    })();

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Streaming error:', error);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    return NextResponse.json({error: 'Failed to stream audio'}, {status: 500});
  }
}
