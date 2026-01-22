import {ArtistDetails, ArtistPageObject, RecordingDetail, Release, ReleaseGroup} from "@/app/_types/MusicBrainz";

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

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (e) {
    if (e instanceof Error) {
      console.error(`/ws/2/${endpoint} : Fetch error details: ${e.stack}`);
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
    return {
      ...artist,
      'release-groups': releaseGroups.sort((rgA, rgB) => new Date(rgB["first-release-date"] ?? 0).getTime() - new Date(rgA["first-release-date"] ?? 0).getTime()),
    } as ArtistPageObject;
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
    const release = await fetchMB(`release/${mbid}`, { inc: ['artist-credits', 'recordings', 'labels', 'release-groups'].join('+') });
    release['cover-art-url'] = await musicBrainzService.getReleaseArt(release.id)
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
      console.error('Cover Art Archive fetch error:', error);
    }
    return null
  },

  async searchRecording(query: string) {
    return fetchMB('recording', { query });
  },

  async getRecording(mbid: string) {
    return (await fetchMB(`recording/${mbid}`,  { inc: ['artist-credits'].join('+') }) as RecordingDetail);
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
