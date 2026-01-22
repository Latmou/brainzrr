'use client'

import Link from 'next/link'
import { Play, Loader2 } from 'lucide-react'
import { ReleaseArt } from './ReleaseArt'
import {Release} from "@/app/_types/MusicBrainz";
import {usePlayer} from "@/app/_context/PlayerContext";
import {getReleaseAction} from "@/app/_actions/musicbrainz";
import {useState} from "react";

interface ReleaseItemProps {
  release: Release
  artistName?: string
}

export function ReleaseItem({ release, artistName: artistNameProp }: ReleaseItemProps) {
  const { play, setQueue } = usePlayer()
  const [isPlayingRelease, setIsPlayingRelease] = useState(false)
  // If it's a release-group, it might have a 'releases' array, we use the first release ID for the link
  const releaseId = release.id
  const artistName = artistNameProp || release['artist-credit']?.[0]?.name
  const releaseDate = new Date(release.date ?? 0)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsPlayingRelease(true)
    try {
      let fullRelease = release
      // If we don't have media/tracks, fetch the full release
      if (!release.media || release.media.length === 0) {
        fullRelease = await getReleaseAction(releaseId)
      }

      const tracks = fullRelease.media?.[0]?.tracks || []
      const coverArtUrl = fullRelease['cover-art-url']

      const fullTracklist = tracks.map((track: any) => ({
        id: track.id,
        mbid: track.recording.id,
        title: track.title,
        artist: track['artist-credit']?.[0]?.name || artistName || 'Unknown Artist',
        artistId: track['artist-credit']?.[0]?.artist?.id || fullRelease['artist-credit']?.[0]?.artist?.id,
        releaseId: releaseId,
        duration: track.recording.length ? track.recording.length / 1000 : null,
        coverArtUrl: coverArtUrl ?? null
      }))

      if (fullTracklist.length > 0) {
        play(fullTracklist[0])
        setQueue(fullTracklist.slice(1))
      }
    } catch (error) {
      console.error('Failed to play release:', error)
    } finally {
      setIsPlayingRelease(false)
    }
  }

  return (
    <Link 
      href={`/release/${releaseId}`}
      className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer"
    >
      <div className="aspect-square mb-4 shadow-xl relative group">
        <ReleaseArt 
          releaseId={releaseId} 
          title={release.title} 
          className="w-full h-full rounded"
        />
        <div
          onClick={handlePlay}
          className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 text-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg z-10 hover:scale-105 active:scale-95"
        >
          {isPlayingRelease ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Play size={20} className="fill-current" />
          )}
        </div>
      </div>
      <div className="font-bold truncate">{release.title}</div>
      <div className="flex flex-col">
        {artistName && <div className="text-zinc-400 text-sm truncate">{artistName}</div>}
        <div className="text-zinc-500 text-xs truncate">
          {release.date && <>{releaseDate.toLocaleDateString('fr-FR')}{(releaseDate > oneMonthAgo ) && <div className={'text-black inline ml-2 bg-green-500 rounded-full px-2 text-xs font-bold py-0.5'}>Nouveau</div>}
          </>}
        </div>
      </div>
    </Link>
  )
}
