"use server"
import {musicBrainzService} from "@/app/_lib/musicbrainz";

export const search = async (searchQuery: string) => {
  return await Promise.all([
    musicBrainzService.searchArtist(searchQuery),
    musicBrainzService.searchRecording(searchQuery),
    musicBrainzService.searchRelease(searchQuery)
  ])
}