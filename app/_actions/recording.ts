'use server'

import {prisma} from '@/app/_lib/prisma';

import {musicBrainzService} from '@/app/_lib/musicbrainz';
import {invidiousService} from "@/app/_lib/invidious";

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
  const {url, title} = await invidiousService.search(query)

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
