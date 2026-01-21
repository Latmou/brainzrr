'use server'

import { musicBrainzService } from '@/app/_lib/musicbrainz'

export async function getReleaseArtAction(mbid: string) {
  return musicBrainzService.getReleaseArt(mbid)
}
