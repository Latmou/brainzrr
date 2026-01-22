'use server'

import { musicBrainzService } from '@/app/_lib/musicbrainz'

export async function getReleaseArtAction(mbid: string) {
  return musicBrainzService.getReleaseArt(mbid)
}

export async function getReleaseGroupReleasesAction(mbid: string) {
  return musicBrainzService.getReleaseGroup(mbid, ['releases'])
}
