'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/app/_context/PlayerContext'

interface Track {
  id: string
  mbid: string
  title: string
  artist: string
  artistId?: string
  releaseId?: string
  duration: number | null
  coverArtUrl: string | null
}

export function ReleasePreloader({ tracks }: { tracks: Track[] }) {
  const { preloadQueue } = usePlayer()

  useEffect(() => {
    if (tracks.length > 0) {
      preloadQueue(tracks)
    }
  }, [tracks, preloadQueue])

  return null
}
