'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { cacheService } from '@/app/_lib/cache'
import { addToHistory } from '@/app/_actions/history'
import { getRecordingYoutubeInfo, getRecordingAction } from '@/app/_actions/recording'

import { RecordingDetail } from '@/app/_types/MusicBrainz'

interface PlayerContextType {
  currentTrack: RecordingDetail | null
  isPlaying: boolean
  queue: RecordingDetail[]
  history: RecordingDetail[]
  volume: number
  loopMode: 'none' | 'all' | 'one'
  isRandom: boolean
  isFullScreen: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  play: (recordingId?: string) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setQueue: (recordingIds: string[]) => void
  addToQueue: (recordingIds: string | string[]) => void
  removeFromQueue: (mbid: string) => void
  changeQueueOrder: (oldIndex: number, newIndex: number) => void
  goTo: (index: number) => void
  clearQueue: () => void
  setVolume: (volume: number) => void
  setLoopMode: (mode: 'none' | 'all' | 'one') => void
  toggleRandom: () => void
  setIsFullScreen: (isFullScreen: boolean) => void
  preloadQueue: (mbid: string) => void
  showQueue: boolean
  toggleQueue: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<RecordingDetail | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<RecordingDetail[]>([])
  const [history, setHistory] = useState<RecordingDetail[]>([])
  const [volume, setVolume] = useState(0.7)
  const [loopMode, setLoopMode] = useState<'none' | 'all' | 'one'>('none')
  const [isRandom, setIsRandom] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
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
      const savedQueue = await cacheService.get<RecordingDetail[]>('player_queue')
      const savedHistory = await cacheService.get<RecordingDetail[]>('player_history')

      if (savedTrackId) {
        const track = await cacheService.get<RecordingDetail>(`player_recording_${savedTrackId}`)
        if (track) {
          setCurrentTrack(track)
          if (track.length) {
            setDuration(track.length / 1000)
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
    if (audioRef.current && isFinite(volume)) {
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

  const play = useCallback(async (recordingId?: string) => {
    if (!audioRef.current) return

    if (recordingId) {
      // If it's the same track and it's already playing, do nothing
      // If it's the same track and it's paused, just play it
      if (currentTrack?.id === recordingId) {
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

      setIsLoading(true)

      try {
        const recording = await getRecordingAction(recordingId);
        if (!recording) {
          setIsLoading(false);
          return;
        }
        
        // Add to history
        addToHistory(recordingId)

        setCurrentTrack(recording as RecordingDetail)
        setCurrentTime(0)
        setDuration(recording.length ? recording.length / 1000 : 0)
        
        // Pause and reset before changing src to avoid errors
        audioRef.current.pause()
        audioRef.current.src = `/api/stream?mbid=${recordingId}`
        audioRef.current.currentTime = 0 // Explicitly start at 0 for new tracks
        audioRef.current.load()
        
        try {
          await audioRef.current.play()
          setIsPlaying(true)
          
          // If we didn't have YouTube info yet, try to fetch it after a delay
          // This is useful because the /api/stream might have just fetched and saved it
          if (!recording.youtubeTitle) {
            setTimeout(async () => {
              try {
                const data = await getRecordingYoutubeInfo(recordingId);
                if (data && data.youtubeTitle && data.youtubeUrl) {
                  setCurrentTrack(prev => prev && prev.id === recordingId ? {
                    ...prev,
                    youtubeTitle: data.youtubeTitle,
                    youtubeUrl: data.youtubeUrl
                  } : prev);
                }
              } catch (e) {
                console.warn("Failed to refetch YouTube info:", e);
              }
            }, 5000); // 5 seconds should be enough for ytdlp to get info
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            console.error("Playback error:", e)
            setIsPlaying(false)
          }
        }
      } catch (e) {
        console.error("Failed to load track:", e);
        setIsLoading(false);
      }
    } else if (currentTrack) {
      // If we have a currentTrack but no src (e.g. after reload), set it
      if (!audioRef.current.src && currentTrack.id) {
        audioRef.current.src = `/api/stream?mbid=${currentTrack.id}`
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
      play(nextTrack.id)
    } else if (loopMode === 'all' && (history.length > 0 || currentTrack)) {
      const allTracks = [...[...history].reverse(), currentTrack].filter(Boolean) as RecordingDetail[]
      if (allTracks.length > 0) {
        const firstTrack = allTracks[0]
        setQueue(allTracks.slice(1))
        setHistory([])
        setCurrentTime(0)
        play(firstTrack.id)
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
      play(prevTrack.id)
    } else {
      // when going previous with nothing before, set timer at 0
      seek(0)
    }
  }, [history, currentTrack, play, seek])

  const addToQueue = useCallback(async (recordingIds: string | string[]) => {
    const ids = Array.isArray(recordingIds) ? recordingIds : [recordingIds]
    
    // We could just add IDs to the queue, but the queue currently expects Track objects
    // for rendering in QueueView. 
    // Wait, I should probably change the queue to store Track objects but provide 
    // helper to add by ID.
    
    setIsLoading(true)
    try {
      const newTracks = await Promise.all(ids.map(async (id) => {
        return await getRecordingAction(id)
      }))
      
      const validTracks = newTracks.filter((t): t is RecordingDetail => t !== null)
      setQueue(prev => [...prev, ...validTracks])
    } catch (e) {
      console.error("Failed to add to queue:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setQueueByIds = useCallback(async (recordingIds: string[]) => {
    setIsLoading(true)
    try {
      const newTracks = await Promise.all(recordingIds.map(async (id) => {
        return await getRecordingAction(id)
      }))
      
      const validTracks = newTracks.filter((t): t is RecordingDetail => t !== null)
      setQueue(validTracks)
    } catch (e) {
      console.error("Failed to set queue:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFromQueue = useCallback((mbid: string) => {
    setQueue(prev => prev.filter(t => t.id !== mbid))
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
    play(track.id)
  }, [currentTrack, play, queue])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  const toggleRandom = useCallback(() => {
    const nextRandom = !isRandom
    setIsRandom(nextRandom)
    if (nextRandom) {
      setQueue(prev => [...prev].sort(() => Math.random() - 0.5))
    }
  }, [isRandom])

  const preloadQueue = useCallback((mbid: string) => {
    const url = `/api/stream?mbid=${mbid}`
    if ('caches' in window) {
      caches.open('brainzrr-audio-v1').then(cache => {
        cache.match(url).then(response => {
          if (!response) {
            console.log(`Preloading track: ${mbid}`)
            fetch(url).catch(err => console.error('Preload failed', err))
          }
        })
      })
    }
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
      if (currentTrack && (!currentTrack.length || Math.abs(currentTrack.length / 1000 - audioDuration) > 1)) {
        const updatedTrack = { ...currentTrack, length: audioDuration * 1000 }
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

  const handleError = useCallback(async () => {
    setIsLoading(false)
    setIsPlaying(false)

    const audio = audioRef.current
    if (audio && currentTrack) {
      console.error('Playback error details:', audio.error)
      
      // NotSupportedError or other source-related errors
      if (audio.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        console.warn('Media not supported error detected. Clearing cache and retrying...')
        
        try {
          // 1. Remove from client-side cache if applicable (though audio is usually browser-cached or server-cached)
          // The issue specifically mentions removing from cache and refetching.
          
          // 2. We can try to force a refetch by adding a timestamp to the URL
          const retryTrack = { ...currentTrack }
          const timestamp = Date.now()
          
          audio.src = `/api/stream?mbid=${retryTrack.id}&t=${timestamp}`
          setIsLoading(true)
          
          try {
            await audio.play()
            setIsPlaying(true)
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              console.error("Retry playback failed:", e)
              setIsLoading(false)
              setIsPlaying(false)
            }
          }
        } catch (e) {
          console.error('Error during retry attempt:', e)
        }
      }
    }
  }, [currentTrack])

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
      queue.slice(0, 3).forEach(track => {
        preloadQueue(track.id)
      })
    }
  }, [queue, preloadQueue])

  const toggleQueue = useCallback(() => {
    setShowQueue(prev => !prev)
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, queue, history, volume, loopMode, isRandom, isFullScreen,
      currentTime, duration, isLoading, showQueue,
      play, pause, togglePlay, next, previous, seek, setQueue: setQueueByIds, addToQueue, removeFromQueue,
      changeQueueOrder, goTo, clearQueue, setVolume, setLoopMode, toggleRandom, setIsFullScreen, preloadQueue, toggleQueue
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
