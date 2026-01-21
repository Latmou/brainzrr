'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

interface Track {
  id: string
  mbid: string
  title: string
  artist: string
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isSeeking = useRef(false)

  // Initialize Audio object once on mount
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    
    // Set initial volume from localStorage if available
    const savedVolume = localStorage.getItem('player_volume')
    if (savedVolume) {
      const vol = parseFloat(savedVolume)
      setVolume(vol)
      audio.volume = vol
    } else {
      audio.volume = volume
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Load state from localStorage on mount
  useEffect(() => {
    const savedTrackId = localStorage.getItem('player_currentTrackId')
    const savedTime = localStorage.getItem('player_currentTime')
    const savedQueue = localStorage.getItem('player_queue')
    const savedHistory = localStorage.getItem('player_history')

    if (savedTrackId) {
      const savedTrack = localStorage.getItem(`player_recording_${savedTrackId}`)
      if (savedTrack) {
        const track = JSON.parse(savedTrack)
        setCurrentTrack(track)
        if (track.duration) {
          setDuration(track.duration)
        }
      }
    }
    if (savedTime) {
      const time = parseFloat(savedTime)
      setCurrentTime(time)
    }
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue))
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      localStorage.setItem('player_volume', volume.toString())
    }
  }, [volume])

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('player_currentTrackId', currentTrack.id)
      localStorage.setItem(`player_recording_${currentTrack.id}`, JSON.stringify(currentTrack))
    }
  }, [currentTrack])

  useEffect(() => {
    localStorage.setItem('player_queue', JSON.stringify(queue))
  }, [queue])

  useEffect(() => {
    localStorage.setItem('player_history', JSON.stringify(history))
  }, [history])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      isSeeking.current = true
      audioRef.current.currentTime = time
      setCurrentTime(time)
      localStorage.setItem('player_currentTime', time.toString())
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
        localStorage.setItem('player_currentTime', time.toString())
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
        localStorage.setItem(`player_recording_${currentTrack.id}`, JSON.stringify(updatedTrack))
      }
    }
  }, [currentTrack])

  const handleEnded = useCallback(() => {
    next()
  }, [next])

  // Attach event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded])

  // Preload next tracks when queue changes
  useEffect(() => {
    if (queue.length > 0) {
      preloadQueue(queue)
    }
  }, [queue])

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, queue, history, volume, loopMode, isRandom, isFullScreen,
      currentTime, duration,
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
