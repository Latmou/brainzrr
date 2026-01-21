'use client'

import { Music, Play, Pause } from 'lucide-react'
import { usePlayer } from '@/app/_context/PlayerContext'
import {RecordingDetail} from "@/app/_types/MusicBrainz";

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

interface RecordingItemProps {
  recording: RecordingDetail
  artistName?: string // Used as fallback or if not present in recording
  artistId?: string
  releaseId?: string
  index?: number
  showIndex?: boolean
  coverArtUrl?: string | null
  fullTracklist?: Track[]
}

export function RecordingItem({ recording, artistName, artistId, releaseId, index, showIndex = true, coverArtUrl, fullTracklist }: RecordingItemProps) {
  const { play, pause, isPlaying, currentTrack, setQueue } = usePlayer()
  const displayArtist = recording['artist-credit']?.[0]?.name || artistName || 'Artiste inconnu'
  const displayArtistId = recording['artist-credit']?.[0]?.artist?.id || artistId
  
  const isCurrentTrack = currentTrack?.mbid === recording.id
  const isThisPlaying = isCurrentTrack && isPlaying

  const handleTogglePlay = () => {
    if (isThisPlaying) {
      pause()
    } else {
      const trackToPlay: Track = {
        id: recording.id,
        mbid: recording.id,
        title: recording.title,
        artist: displayArtist,
        artistId: displayArtistId,
        releaseId: releaseId,
        duration: recording.length ? recording.length / 1000 : null,
        coverArtUrl: coverArtUrl ?? null
      }

      play(trackToPlay)

      if (fullTracklist && fullTracklist.length > 0) {
        const trackIndex = fullTracklist.findIndex(t => t.mbid === recording.id)
        if (trackIndex !== -1) {
          const remainingTracks = fullTracklist.slice(trackIndex + 1)
          setQueue(remainingTracks)
        }
      }
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return ''
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div 
      className="flex items-center gap-4 p-2 rounded hover:bg-white/10 group cursor-pointer"
      onClick={handleTogglePlay}
    >
      {showIndex && typeof index === 'number' && (
        <div className="w-4 flex items-center justify-end">
          {isThisPlaying ? (
            <Pause size={15} className="text-white fill-white" />
          ) : (
            <>
              <div className={`text-zinc-400 group-hover:hidden text-sm ${isCurrentTrack ? 'text-green-500' : ''}`}>
                {index + 1}
              </div>
              <Play 
                size={15} 
                className={`hidden group-hover:block ${isCurrentTrack ? 'text-green-500 fill-green-500' : 'text-white fill-white'}`} 
              />
            </>
          )}
        </div>
      )}
      {!showIndex && (
        <div className="relative w-10 h-10 bg-zinc-800 flex items-center justify-center rounded">
          {isThisPlaying ? (
            <Pause size={15} className="text-white fill-white" />
          ) : (
            <>
              <Music size={20} className={`text-zinc-500 group-hover:hidden ${isCurrentTrack ? 'text-green-500' : ''}`} />
              <Play 
                size={15} 
                className={`hidden group-hover:block ${isCurrentTrack ? 'text-green-500 fill-green-500' : 'text-white fill-white'}`} 
              />
            </>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${isCurrentTrack ? 'text-green-500' : 'text-white'}`}>
          {recording.title}
        </div>
        {recording['artist-credit'] ? (
          recording['artist-credit'][0]?.name !== artistName && (
            <div className="text-zinc-400 text-xs truncate">{recording['artist-credit'][0]?.name}</div>
          )
        ) : (
          !showIndex && <div className="text-zinc-400 text-sm truncate">{displayArtist}</div>
        )}
      </div>
      <div className="text-zinc-400 text-sm">
        {formatDuration(recording.length)}
      </div>
    </div>
  )
}
