'use client'

import { Music, Play, Pause, AlertCircle, Loader2 } from 'lucide-react'
import { usePlayer } from '@/app/_context/PlayerContext'
import {RecordingDetail} from "@/app/_types/MusicBrainz";
import { useEffect, useState } from 'react'
import { cacheService } from '@/app/_lib/cache'
import { cn } from '@/app/_lib/utils'

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
  const [streamStatus, setStreamStatus] = useState<{ found: boolean, ready: boolean } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkStream = async () => {
      // Check cache first
      const cached = cacheService.get<{ found: boolean, ready: boolean }>(`stream_status_${recording.id}`)
      if (cached) {
        setStreamStatus(cached)
        return
      }

      setIsChecking(true)
      try {
        const res = await fetch(`/api/check-stream?mbid=${recording.id}`)
        if (res.ok) {
          const data = await res.json()
          setStreamStatus(data)
          cacheService.set(`stream_status_${recording.id}`, data)
        } else {
          setStreamStatus({ found: false, ready: false })
        }
      } catch (e) {
        console.error('Error checking stream:', e)
        setStreamStatus({ found: false, ready: false })
      } finally {
        setIsChecking(false)
      }
    }

    checkStream()
  }, [recording.id])

  const displayArtist = recording['artist-credit']?.[0]?.name || artistName || 'Artiste inconnu'
  const displayArtistId = recording['artist-credit']?.[0]?.artist?.id || artistId
  
  const isCurrentTrack = currentTrack?.mbid === recording.id
  const isThisPlaying = isCurrentTrack && isPlaying

  const isPlayable = isChecking || !streamStatus || (streamStatus.found && streamStatus.ready)
  const isActuallyDisabled = !isChecking && streamStatus && !(streamStatus.found && streamStatus.ready)

  const handleTogglePlay = () => {
    if (isActuallyDisabled || isChecking) return

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
      className={cn(
        "flex items-center gap-4 p-2 rounded transition-colors group",
        !isActuallyDisabled && !isChecking ? "hover:bg-white/10 cursor-pointer" : "cursor-default",
        isActuallyDisabled && "opacity-50"
      )}
      onClick={handleTogglePlay}
    >
      {showIndex && typeof index === 'number' && (
        <div className="w-4 flex items-center justify-end">
          {isChecking ? (
            <Loader2 size={12} className="animate-spin text-zinc-500" />
          ) : isThisPlaying ? (
            <Pause size={15} className="text-white fill-white" />
          ) : isActuallyDisabled ? (
            <AlertCircle size={15} className="text-red-500" />
          ) : (
            <>
              <div className={cn(
                "text-zinc-400 text-sm",
                !isActuallyDisabled && !isChecking && "group-hover:hidden",
                isCurrentTrack && "text-green-500"
              )}>
                {index + 1}
              </div>
              {!isActuallyDisabled && !isChecking && (
                <Play 
                  size={15} 
                  className={cn(
                    "hidden group-hover:block",
                    isCurrentTrack ? "text-green-500 fill-green-500" : "text-white fill-white"
                  )} 
                />
              )}
            </>
          )}
        </div>
      )}
      {!showIndex && (
        <div className="relative w-10 h-10 bg-zinc-800 flex items-center justify-center rounded">
          {isChecking ? (
            <Loader2 size={15} className="animate-spin text-zinc-500" />
          ) : isThisPlaying ? (
            <Pause size={15} className="text-white fill-white" />
          ) : isActuallyDisabled ? (
            <AlertCircle size={15} className="text-red-500" />
          ) : (
            <>
              <Music size={20} className={cn(
                "text-zinc-500",
                !isActuallyDisabled && !isChecking && "group-hover:hidden",
                isCurrentTrack && "text-green-500"
              )} />
              {!isActuallyDisabled && !isChecking && (
                <Play 
                  size={15} 
                  className={cn(
                    "hidden group-hover:block",
                    isCurrentTrack ? "text-green-500 fill-green-500" : "text-white fill-white"
                  )} 
                />
              )}
            </>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium truncate",
          isCurrentTrack ? "text-green-500" : "text-white"
        )}>
          {recording.title}
        </div>
        <div className="flex items-center gap-2">
          {!isActuallyDisabled && recording['artist-credit'] ? (
            recording['artist-credit'][0]?.name !== artistName && (
              <div className="text-zinc-400 text-xs truncate">{recording['artist-credit'][0]?.name}</div>
            )
          ) : (
            !isActuallyDisabled && !showIndex && <div className="text-zinc-400 text-sm truncate">{displayArtist}</div>
          )}
          {isActuallyDisabled && (
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Indisponible</span>
          )}
        </div>
      </div>
      <div className="text-zinc-400 text-sm">
        {formatDuration(recording.length)}
      </div>
    </div>
  )
}
