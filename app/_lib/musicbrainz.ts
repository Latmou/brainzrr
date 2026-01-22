import {ArtistDetails, ArtistPageObject, RecordingDetail, Release, ReleaseGroup} from "@/app/_types/MusicBrainz";
import { prisma } from "@/app/_lib/prisma";

const BASE_URL = 'https://musicbrainz.org';
const USER_AGENT = 'brainzrr/0.1.0 ( https://github.com/your-username/brainzrr )';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMB(endpoint: string, params: Record<string, string> = {}, retries = 3) {
  const url = new URL(`${BASE_URL}/ws/2/${endpoint}`);
  url.searchParams.set('fmt', 'json');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  console.log('[MUSICBRAINZ] ' + url.toString());

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
      });

      if (response.status === 503 && i < retries - 1) {
        console.warn(`[MUSICBRAINZ] 503 Service Unavailable. Retrying in 3s... (Attempt ${i + 1}/${retries})`);
        await delay(3000);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (e) {
      if (i === retries - 1) {
        if (e instanceof Error) {
          console.error(`/ws/2/${endpoint} : Fetch error details: ${e.stack}`);
        }
        throw e;
      }
      console.warn(`[MUSICBRAINZ] Fetch attempt ${i + 1} failed. Retrying...`, e);
      await delay(1000);
    }
  }
}

export const musicBrainzService = {
  async searchArtist(query: string) {
    return fetchMB('artist', { query });
  },

  async getArtist(mbid: string) {
    const artist = (await fetchMB(`artist/${mbid}`, { inc: ['url-rels', 'artist-rels', 'tags', 'genres'].join('+') }))
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
        where: { mbid }
      });
      if (cached) {
        console.log(`[CACHE] Hit Release: ${mbid}`);
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
        where: { mbid },
        update: {
          title: release.title,
          artist: release['artist-credit']?.[0]?.name || 'Unknown',
          coverArtUrl: release['cover-art-url'],
          data: release as any
        },
        create: {
          mbid,
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
    try {
      const response = await fetch(`https://coverartarchive.org/release/${mbid}`);
      if (response.ok) {
        const data = await response.json();
        const frontImage = data.images.find((img: any) => img.front);
        if (frontImage) {
          return frontImage.thumbnails?.['500'] || frontImage.thumbnails?.large || frontImage.image;
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
        where: { mbid }
      });
      if (cached) {
        console.log(`[CACHE] Hit Recording: ${mbid}`);
        return cached.data as unknown as RecordingDetail;
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
    return fetchMB(`label/${mbid}`);
  },

  async getArtistsByTag(tag: string) {
    return fetchMB('artist', { query: `tag:${tag}`, limit: '100' });
  },

  async getReleasesByTag(tag: string) {
    return fetchMB('release', { query: `tag:${tag}`, limit: '20' });
  }
};
