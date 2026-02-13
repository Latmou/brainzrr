import {ArtistDetails, ArtistPageObject, RecordingDetail, Release, ReleaseGroup} from "@/app/_types/MusicBrainz";
import { prisma } from "@/app/_lib/prisma";

const BASE_URL = process.env.MUSICBRAINZ_BASE_URL || 'https://musicbrainz.org';
const USER_AGENT = 'brainzrr/0.1.0 ( https://github.com/your-username/brainzrr )';

async function fetchMB(endpoint: string, params: Record<string, string> = {}, retries = 3) {
  const url = new URL(`${BASE_URL}/ws/2/${endpoint}`);
  url.searchParams.set('fmt', 'json');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  console.log('[MUSICBRAINZ] ' + url.toString());
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`MusicBrainz API error: ${response.status} ${response.statusText} - ${errorText}`);
    return new Promise(() => {});
  }

  return await response.json();
}

export const musicBrainzService = {
  async searchArtist(query: string) {
    return fetchMB('artist', { query });
  },

  async getArtist(mbid: string) {
    const artist = (await fetchMB(`artist/${mbid}`, { inc: ['url-rels', 'artist-rels', 'label-rels', 'tags', 'genres'].join('+') }))
    const releaseGroups = (await fetchMB(`release-group?artist=${artist.id}&inc=artist-credits&limit=100`))['release-groups'] as ReleaseGroup[];
    const result = {
      ...artist,
      'release-groups': releaseGroups.sort((rgA, rgB) => new Date(rgB["first-release-date"] ?? 0).getTime() - new Date(rgA["first-release-date"] ?? 0).getTime()),
    } as ArtistPageObject;

    return result;
  },

  async searchReleaseGroup(query: string) {
    return fetchMB('release-group', { query });
  },

  async getReleaseGroup(mbid: string, inc: string[] = []) {
    return fetchMB(`release-group/${mbid}`, inc.length ? { inc: inc.join('+') } : {}) as Promise<ReleaseGroup>;
  },

  async searchRelease(query: string) {
    return fetchMB('release', { query });
  },

  async getRelease(mbid: string) {
    // Check DB cache first
    try {
      const cached = await prisma.release.findUnique({
        where: { id: mbid }
      });
      if (cached) {
        console.log(`[CACHE] Release: ${mbid}`);
        return cached.data as unknown as Release;
      }
    } catch (e) {
      console.warn(`[CACHE] Error reading Release from DB: ${e}`);
    }

    const release = await fetchMB(`release/${mbid}`, { inc: ['artist-credits', 'recordings', 'labels', 'release-groups'].join('+') });
    release['cover-art-url'] = await musicBrainzService.getReleaseArt(release.id)

    // Save to DB cache
    try {
      await prisma.release.upsert({
        where: { id: mbid },
        update: {
          title: release.title,
          artist: release['artist-credit']?.[0]?.name || 'Unknown',
          coverArtUrl: release['cover-art-url'],
          data: release as any
        },
        create: {
          id: mbid,
          title: release.title,
          artist: release['artist-credit']?.[0]?.name || 'Unknown',
          coverArtUrl: release['cover-art-url'],
          data: release as any
        }
      });

      // Also cache all recordings in this release
      if (release.media) {
        for (const media of release.media) {
          if (media.tracks) {
            for (const track of media.tracks) {
              if (track.recording) {
                await prisma.recording.upsert({
                  where: { mbid: track.recording.id },
                  update: {
                    title: track.recording.title,
                    artist: track.recording['artist-credit']?.[0]?.name || track['artist-credit']?.[0]?.name || release['artist-credit']?.[0]?.name || 'Unknown',
                    duration: track.recording.length || track.length,
                    releaseId: mbid,
                    data: track.recording as any
                  },
                  create: {
                    mbid: track.recording.id,
                    title: track.recording.title,
                    artist: track.recording['artist-credit']?.[0]?.name || track['artist-credit']?.[0]?.name || release['artist-credit']?.[0]?.name || 'Unknown',
                    duration: track.recording.length || track.length,
                    releaseId: mbid,
                    data: track.recording as any
                  }
                });
              }
            }
          }
        }
      }

      console.log(`[CACHE] Saved Release and its recordings: ${mbid}`);
    } catch (e) {
      console.warn(`[CACHE] Error saving Release to DB: ${e}`);
    }

    return release as Release;
  },

  async getReleaseArt(mbid: string) {
    // Check DB cache first
    try {
      const cached = await prisma.release.findUnique({
        where: { id: mbid },
        select: { coverArtUrl: true }
      });
      if (cached?.coverArtUrl) {
        console.log(`[CACHE] Release Art: ${mbid}`);
        return cached.coverArtUrl;
      }
    } catch (e) {
      console.warn(`[CACHE] Error reading Release Art from DB: ${e}`);
    }

    try {
      const response = await fetch(`https://coverartarchive.org/release/${mbid}`);
      if (response.ok) {
        const data = await response.json();
        const frontImage = data.images.find((img: any) => img.front);
        if (frontImage) {
          const artUrl = frontImage.thumbnails?.['500'] || frontImage.thumbnails?.large || frontImage.image;
          
          // Save art to release in db if it exists
          try {
            await prisma.release.update({
              where: { id: mbid },
              data: { coverArtUrl: artUrl }
            });
            console.log(`[CACHE] Updated cover art for Release: ${mbid}`);
          } catch (e) {
            // It's okay if the release doesn't exist in DB yet
          }

          return artUrl;
        }
      }
    } catch (error) {
      return null
    }
    return null
  },

  async searchRecording(query: string) {
    return fetchMB('recording', { query });
  },

  async getRecording(mbid: string) {
    // Check DB cache first
    try {
      const cached = await prisma.recording.findUnique({
        where: { mbid },
        include: {
          release: true
        }
      });
      if (cached) {
        console.log(`[CACHE] Recording: ${mbid}`);
        const data = cached.data as unknown as RecordingDetail;
        const release = {
          ...cached.release,
          'cover-art-url': cached.release ? cached.release.coverArtUrl : undefined,
        };
        return {
          ...data,
          youtubeTitle: cached.youtubeTitle,
          youtubeUrl: cached.youtubeUrl,
          releases: [release]
        };
      }
    } catch (e) {
      console.warn(`[CACHE] Error reading Recording from DB: ${e}`);
    }

    const recording = (await fetchMB(`recording/${mbid}`,  { inc: ['artist-credits', 'releases'].join('+') }) as RecordingDetail);

    // Ensure we have a releaseId from the fetched data
    const releaseId = recording.releases?.[0]?.id;

    // Save to DB cache
    try {
      await prisma.recording.upsert({
        where: { mbid },
        update: {
          title: recording.title,
          artist: recording['artist-credit']?.[0]?.name || 'Unknown',
          duration: recording.length,
          releaseId: releaseId,
          data: recording as any
        },
        create: {
          mbid,
          title: recording.title,
          artist: recording['artist-credit']?.[0]?.name || 'Unknown',
          duration: recording.length,
          releaseId: releaseId,
          data: recording as any
        }
      });
      console.log(`[CACHE] Saved Recording: ${mbid}`);
    } catch (e) {
      console.warn(`[CACHE] Error saving Recording to DB: ${e}`);
    }

    return recording;
  },

  async searchArea(query: string) {
    return fetchMB('area', { query });
  },

  async getArea(mbid: string) {
    return fetchMB(`area/${mbid}`);
  },

  async searchPlace(query: string) {
    return fetchMB('place', { query });
  },

  async getPlace(mbid: string) {
    return fetchMB(`place/${mbid}`);
  },

  async searchLabel(query: string) {
    return fetchMB('label', { query });
  },

  async getLabel(mbid: string) {
    const label = await fetchMB(`label/${mbid}`, { inc: ['url-rels', 'tags', 'genres'].join('+') });
    const releases = await fetchMB('release', { label: mbid, limit: '100', inc: ['artist-credits', 'release-groups'].join('+') });
    
    return {
      ...label,
      releases: releases?.releases || []
    };
  },

  async getArtistsByTag(tag: string) {
    return fetchMB('artist', { query: `tag:${tag}`, limit: '100' });
  },

  async getReleasesByTag(tag: string) {
    return fetchMB('release', { query: `tag:${tag}`, limit: '20' });
  }
};
