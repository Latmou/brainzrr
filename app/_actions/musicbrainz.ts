'use server'

import { musicBrainzService } from '@/app/_lib/musicbrainz'

export async function getReleaseArtAction(mbid: string) {
  const art = await musicBrainzService.getReleaseArt(mbid)
  if (art) return art

  // If not found, try to find other releases in the same release group
  try {
    const release = await musicBrainzService.getRelease(mbid)
    const releaseGroupId = release['release-group']?.id
    
    if (releaseGroupId) {
      const rg = await musicBrainzService.getReleaseGroup(releaseGroupId, ['releases'])
      const otherReleases = rg.releases || []
      
      for (const other of otherReleases) {
        if (other.id === mbid) continue
        const otherArt = await musicBrainzService.getReleaseArt(other.id)
        if (otherArt) return otherArt
      }
    }
  } catch (error) {
    console.error('Error in getReleaseArtAction fallback:', error)
  }

  return null
}

export async function getReleaseGroupReleasesAction(mbid: string) {
  return musicBrainzService.getReleaseGroup(mbid, ['releases'])
}

export async function getReleaseAction(mbid: string) {
  return musicBrainzService.getRelease(mbid)
}
