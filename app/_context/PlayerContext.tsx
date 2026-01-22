'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { cacheService } from '@/app/_lib/cache'

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

interface PlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  queue: Track[]
  history: Track[]
  volume: number
  loopMode: 'none' | 'all' | 'one'
  isRandom: boolean
  isFullScreen: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  play: (track?: Track) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setQueue: (tracks: Track[]) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (trackId: string) => void
  changeQueueOrder: (oldIndex: number, newIndex: number) => void
  goTo: (index: number) => void
  setVolume: (volume: number) => void
  setLoopMode: (mode: 'none' | 'all' | 'one') => void
  toggleRandom: () => void
  setIsFullScreen: (isFullScreen: boolean) => void
  preloadQueue: (tracks: Track[]) => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<Track[]>([])
  const [history, setHistory] = useState<Track[]>([])
  const [volume, setVolume] = useState(0.7)
  const [loopMode, setLoopMode] = useState<'none' | 'all' | 'one'>('none')
  const [isRandom, setIsRandom] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isSeeking = useRef(false)

  // Initialize Audio object once on mount
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    
    const initPlayer = async () => {
      // Set initial volume from cache if available
      const savedVolume = await cacheService.get<number>('player_volume')
      if (typeof savedVolume === 'number' && isFinite(savedVolume)) {
        const validatedVolume = Math.max(0, Math.min(1, savedVolume))
        setVolume(validatedVolume)
        audio.volume = validatedVolume
      } else {
        audio.volume = volume
      }

      // Load state from cache on mount
      const savedTrackId = await cacheService.get<string>('player_currentTrackId')
      const savedTime = await cacheService.get<number>('player_currentTime')
      const savedQueue = await cacheService.get<Track[]>('player_queue')
      const savedHistory = await cacheService.get<Track[]>('player_history')

      if (savedTrackId) {
        const track = await cacheService.get<Track>(`player_recording_${savedTrackId}`)
        if (track) {
          setCurrentTrack(track)
          if (track.duration) {
            setDuration(track.duration)
          }
        }
      }
      if (savedTime !== null) {
        setCurrentTime(savedTime)
      }
      if (savedQueue) {
        setQueue(savedQueue)
      }
      if (savedHistory) {
        setHistory(savedHistory)
      }
    }

    initPlayer()

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    if (audioRef.current && typeof volume === 'number' && isFinite(volume)) {
      const validatedVolume = Math.max(0, Math.min(1, volume))
      audioRef.current.volume = validatedVolume
      cacheService.set('player_volume', validatedVolume)
    }
  }, [volume])

  useEffect(() => {
    if (currentTrack) {
      cacheService.set('player_currentTrackId', currentTrack.id)
      cacheService.set(`player_recording_${currentTrack.id}`, currentTrack)
    }
  }, [currentTrack])

  useEffect(() => {
    cacheService.set('player_queue', queue)
  }, [queue])

  useEffect(() => {
    cacheService.set('player_history', history)
  }, [history])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      isSeeking.current = true
      audioRef.current.currentTime = time
      setCurrentTime(time)
      cacheService.set('player_currentTime', time)
      setTimeout(() => {
        isSeeking.current = false
      }, 50)
    }
  }, [])

  const play = useCallback(async (track?: Track) => {
    if (!audioRef.current) return

    if (track) {
      // If it's the same track and it's already playing, do nothing
      // If it's the same track and it's paused, just play it
      if (currentTrack?.mbid === track.mbid) {
        if (!isPlaying) {
          try {
            await audioRef.current.play()
            setIsPlaying(true)
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              console.error("Playback error:", e)
            }
          }
        }
        return
      }

      setCurrentTrack(track)
      setCurrentTime(0)
      setDuration(track.duration || 0)
      setIsLoading(true)
      
      // Pause and reset before changing src to avoid errors
      audioRef.current.pause()
      audioRef.current.src = `/api/stream?mbid=${track.mbid}`
      audioRef.current.currentTime = 0 // Explicitly start at 0 for new tracks
      audioRef.current.load()
      
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("Playback error:", e)
          setIsPlaying(false)
        }
      }
    } else if (currentTrack) {
      // If we have a currentTrack but no src (e.g. after reload), set it
      if (!audioRef.current.src && currentTrack.mbid) {
        audioRef.current.src = `/api/stream?mbid=${currentTrack.mbid}`
        audioRef.current.currentTime = currentTime
      }
      
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("Playback error:", e)
          setIsPlaying(false)
        }
      }
    }
  }, [currentTrack, isPlaying, currentTime])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, pause, play])

  const next = useCallback(() => {
    if (loopMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      audioRef.current.play()
      return
    }

    if (queue.length > 0) {
      const nextTrack = queue[0]
      setQueue(prev => prev.slice(1))
      if (currentTrack) setHistory(prev => [currentTrack, ...prev])
      setCurrentTime(0)
      play(nextTrack)
    } else if (loopMode === 'all' && (history.length > 0 || currentTrack)) {
      const allTracks = [...[...history].reverse(), currentTrack].filter(Boolean) as Track[]
      if (allTracks.length > 0) {
        const firstTrack = allTracks[0]
        setQueue(allTracks.slice(1))
        setHistory([])
        setCurrentTime(0)
        play(firstTrack)
      } else {
        setIsPlaying(false)
      }
    } else {
      setIsPlaying(false)
    }
  }, [loopMode, queue, history, currentTrack, play])

  const previous = useCallback(() => {
    if (history.length > 0) {
      const prevTrack = history[0]
      setHistory(prev => prev.slice(1))
      if (currentTrack) setQueue(prev => [currentTrack, ...prev])
      setCurrentTime(0)
      play(prevTrack)
    } else {
      // when going previous with nothing before, set timer at 0
      seek(0)
    }
  }, [history, currentTrack, play, seek])

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track])
  }, [])

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => prev.filter(t => t.id !== trackId))
  }, [])

  const changeQueueOrder = useCallback((oldIndex: number, newIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev]
      const [removed] = newQueue.splice(oldIndex, 1)
      newQueue.splice(newIndex, 0, removed)
      return newQueue
    })
  }, [])

  const goTo = useCallback((index: number) => {
    const track = queue[index]
    if (!track) return
    const skipped = queue.slice(0, index)
    if (currentTrack) setHistory(h => [currentTrack, ...[...skipped].reverse(), ...h])
    setQueue(queue.slice(index + 1))
    play(track)
  }, [currentTrack, play, queue])

  const toggleRandom = useCallback(() => {
    const nextRandom = !isRandom
    setIsRandom(nextRandom)
    if (nextRandom) {
      setQueue(prev => [...prev].sort(() => Math.random() - 0.5))
    }
  }, [isRandom])

  const preloadQueue = useCallback((tracks: Track[]) => {
    // Take the first 3 tracks from the queue to preload
    const toPreload = tracks.slice(0, 3)
    
    toPreload.forEach(track => {
      const url = `/api/stream?mbid=${track.mbid}`
      if ('caches' in window) {
        caches.open('brainzrr-audio-v1').then(cache => {
          cache.match(url).then(response => {
            if (!response) {
              console.log(`Preloading track: ${track.title}`)
              fetch(url).catch(err => console.error('Preload failed', err))
            }
          })
        })
      }
    })
  }, [])

  // Event Handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && !isSeeking.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      if (time > 0) {
        cacheService.set('player_currentTime', time)
      }
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration
      setDuration(audioDuration)
      if (currentTrack && (!currentTrack.duration || Math.abs(currentTrack.duration - audioDuration) > 1)) {
        const updatedTrack = { ...currentTrack, duration: audioDuration }
        setCurrentTrack(updatedTrack)
        cacheService.set(`player_recording_${currentTrack.id}`, updatedTrack)
      }
    }
  }, [currentTrack])

  const handleEnded = useCallback(() => {
    next()
  }, [next])

  const handleWaiting = useCallback(() => {
    setIsLoading(true)
  }, [])

  const handleCanPlay = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Attach event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handleCanPlay)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handleCanPlay)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handleWaiting, handleCanPlay, handleError])

  // Preload next tracks when queue changes
  useEffect(() => {
    if (queue.length > 0) {
      preloadQueue(queue)
    }
  }, [queue])

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, queue, history, volume, loopMode, isRandom, isFullScreen,
      currentTime, duration, isLoading,
      play, pause, togglePlay, next, previous, seek, setQueue, addToQueue, removeFromQueue,
      changeQueueOrder, goTo, setVolume, setLoopMode, toggleRandom, setIsFullScreen, preloadQueue
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
