'use server';

import { musicBrainzService } from "@/app/_lib/musicbrainz";
import { SearchResults } from "@/app/_types/MusicBrainz";

export async function searchMusic(query: string): Promise<SearchResults> {
  if (!query || query.trim() === '') {
    return {
      artists: [],
      releases: [],
      recordings: []
    };
  }

  const [artistsRes, releasesRes, recordingsRes] = await Promise.all([
    musicBrainzService.searchArtist(query),
    musicBrainzService.searchRelease(query),
    musicBrainzService.searchRecording(query)
  ]);

  return {
    artists: artistsRes?.artists || [],
    releases: releasesRes?.releases || [],
    recordings: recordingsRes?.recordings || []
  };
}
