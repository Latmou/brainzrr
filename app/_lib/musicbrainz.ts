import {
  ArtistPageObject,
  ArtistSearchResponse,
  RecordingDetail,
  RecordingSearchResponse,
  Release,
  ReleaseGroup,
  ReleaseSearchResponse
} from "@/app/_types/MusicBrainz";

const BASE_URL = process.env.MUSICBRAINZ_BASE_URL || 'http://localhost:5000';
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
    return new Promise(() => {
    });
  }

  return await response.json();
}

export const musicBrainzService = {
  async searchArtist(query: string) {
    return fetchMB('artist', {query}) as Promise<ArtistSearchResponse>;
  },

  async getArtist(mbid: string) {
    const artist = (await fetchMB(`artist/${mbid}`, {inc: ['url-rels', 'artist-rels', 'label-rels', 'tags', 'genres'].join('+')}))
    const releaseGroups = (await fetchMB(`release-group?artist=${artist.id}&inc=artist-credits&limit=100`))['release-groups'] as ReleaseGroup[];
    const result = {
      ...artist,
      'release-groups': releaseGroups.sort((rgA, rgB) => new Date(rgB["first-release-date"] ?? 0).getTime() - new Date(rgA["first-release-date"] ?? 0).getTime()),
    } as ArtistPageObject;

    return result;
  },

  async searchReleaseGroup(query: string) {
    return fetchMB('release-group', {query});
  },

  async getReleaseGroup(mbid: string, inc: string[] = []) {
    return fetchMB(`release-group/${mbid}`, inc.length ? {inc: inc.join('+')} : {}) as Promise<ReleaseGroup>;
  },

  async searchRelease(query: string) {
    return fetchMB('release', {query}) as Promise<ReleaseSearchResponse>;
  },

  async getRelease(mbid: string) {
    const release = await fetchMB(`release/${mbid}`, {inc: ['artist-credits', 'recordings', 'labels', 'release-groups'].join('+')});
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
      return null
    }
    return null
  },

  async searchRecording(query: string) {
    return fetchMB('recording', {query}) as Promise<RecordingSearchResponse>;
  },

  async getRecording(mbid: string) {
    return (await fetchMB(`recording/${mbid}`, {inc: ['artist-credits', 'releases'].join('+')}) as RecordingDetail);
  },

  async searchArea(query: string) {
    return fetchMB('area', {query});
  },

  async getArea(mbid: string) {
    return fetchMB(`area/${mbid}`);
  },

  async searchPlace(query: string) {
    return fetchMB('place', {query});
  },

  async getPlace(mbid: string) {
    return fetchMB(`place/${mbid}`);
  },

  async searchLabel(query: string) {
    return fetchMB('label', {query});
  },

  async getLabel(mbid: string) {
    const label = await fetchMB(`label/${mbid}`, {inc: ['url-rels', 'tags', 'genres'].join('+')});
    const releases = await fetchMB('release', {
      label: mbid,
      limit: '100',
      inc: ['artist-credits', 'release-groups'].join('+')
    });

    return {
      ...label,
      releases: releases?.releases || []
    };
  },

  async getArtistsByTag(tag: string) {
    return fetchMB('artist', {query: `tag:${tag}`, limit: '100'});
  },

  async getReleasesByTag(tag: string) {
    return fetchMB('release', {query: `tag:${tag}`, limit: '20'});
  }
};
