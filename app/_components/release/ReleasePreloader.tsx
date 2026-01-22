'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/app/_context/PlayerContext'

import { RecordingDetail } from '@/app/_types/MusicBrainz'

export function ReleasePreloader({ tracks }: { tracks: RecordingDetail[] }) {
  const { preloadQueue } = usePlayer()

  useEffect(() => {
    if (tracks.length > 0) {
      tracks.slice(0, 5).forEach(track => {
        preloadQueue(track.id)
      })
    }
  }, [tracks, preloadQueue])

  return null
}
