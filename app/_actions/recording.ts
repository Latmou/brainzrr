'use server'

import { prisma } from '@/app/_lib/prisma';

import { musicBrainzService } from '@/app/_lib/musicbrainz';
import {YtDlp} from "ytdlp-nodejs";
import {NextResponse} from "next/server";

export async function getRecordingAction(mbid: string) {
  return musicBrainzService.getRecording(mbid);
}

export async function getRecordingYoutubeInfo(mbid: string) {
  if (!mbid) {
    throw new Error('MBID is required');
  }

  const recording = await musicBrainzService.getRecording(mbid);

  const artistName = recording['artist-credit']?.[0]?.name || '';
  const query = `${recording.title} ${artistName}`;
  const youtubeSearch = `ytsearch1:${query}`;

  const ytdlp = new YtDlp();
  const info = await ytdlp.getInfoAsync(youtubeSearch) as any;

  if (!info || !info.entries || info.entries.length === 0) {
    throw new Error('No stream found');
  }

  const entry = info.entries[0];
  const {url, title, webpage_url} = entry

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
    return {
      youtubeTitle: recording.youtubeTitle,
      youtubeUrl: recording.youtubeUrl
    };
  } catch (e) {
    console.warn(`[STREAM] Failed to save YouTube info to DB: ${e}`);
    return {
      youtubeTitle: null,
      youtubeUrl: null
    };
  }
}
