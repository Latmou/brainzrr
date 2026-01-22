'use client'

import {
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle,
  ChevronDown, ListMusic, Repeat1, Volume2, Loader2, Music
} from 'lucide-react'
import { usePlayer } from '@/app/_context/PlayerContext'
import { cn } from '@/app/_lib/utils'
import Link from 'next/link'
import { ReleaseArt } from './ReleaseArt'

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, togglePlay, next, previous, 
    volume, setVolume, loopMode, setLoopMode, isRandom, toggleRandom,
    currentTime, duration, seek, isFullScreen, setIsFullScreen, isLoading
  } = usePlayer()

  if (!currentTrack) return null

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    
    const updateProgress = (clientX: number) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      seek(percentage * duration)
    }

    updateProgress(e.clientX)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateProgress(moveEvent.clientX)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-gradient-to-b from-zinc-800 to-black flex flex-col p-6 lg:p-12 transition-transform duration-300 ease-out",
      isFullScreen ? "translate-y-0" : "translate-y-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setIsFullScreen(false)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronDown size={32} />
        </button>
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">En cours de lecture</div>
        </div>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="w-full max-w-[400px] aspect-square bg-zinc-800 rounded-lg shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <Loader2 size={80} className="text-white animate-spin" />
            </div>
          ) : currentTrack.releaseId ? (
            <ReleaseArt 
              releaseId={currentTrack.releaseId} 
              title={currentTrack.title}
              className="w-full h-full"
              fallbackSize={80}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-700">
              <Music size={80} className="text-zinc-500" />
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        {currentTrack.releaseId ? (
          <Link 
            href={`/release/${currentTrack.releaseId}`}
            className="text-2xl lg:text-3xl font-bold mb-2 hover:underline block"
            onClick={() => setIsFullScreen(false)}
          >
            {currentTrack.title}
          </Link>
        ) : (
          <div className="text-2xl lg:text-3xl font-bold mb-2">{currentTrack.title}</div>
        )}
        
        {currentTrack.artistId ? (
          <Link 
            href={`/artist/${currentTrack.artistId}`}
            className="text-zinc-400 text-lg lg:text-xl hover:text-white hover:underline block"
            onClick={() => setIsFullScreen(false)}
          >
            {currentTrack.artist}
          </Link>
        ) : (
          <div className="text-zinc-400 text-lg lg:text-xl">{currentTrack.artist}</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div 
          className="h-1.5 bg-zinc-800 rounded-full group cursor-pointer relative mb-2"
          onMouseDown={handleProgressMouseDown}
        >
          <div 
            className="h-full bg-white group-hover:bg-green-500 rounded-full relative" 
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md translate-x-1/2" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <div>{formatTime(currentTime)}</div>
          <div>{formatTime(duration)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mb-8">
        <button 
          onClick={toggleRandom}
          className={cn("hover:text-white transition-colors", isRandom ? "text-green-500" : "text-zinc-400")}
        >
          <Shuffle size={24} />
        </button>
        
        <div className="flex items-center gap-8 lg:gap-12">
          <button onClick={previous} className="text-white hover:scale-110 transition-transform">
            <SkipBack size={36} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="bg-white text-black p-4 rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={36} fill="black" /> : <Play size={36} fill="black" className="ml-1" />}
          </button>
          <button onClick={next} className="text-white hover:scale-110 transition-transform">
            <SkipForward size={36} fill="currentColor" />
          </button>
        </div>

        <button 
          onClick={() => {
            if (loopMode === 'none') setLoopMode('all')
            else if (loopMode === 'all') setLoopMode('one')
            else setLoopMode('none')
          }}
          className={cn("hover:text-white transition-colors", loopMode !== 'none' ? "text-green-500" : "text-zinc-400")}
        >
          {loopMode === 'one' ? <Repeat1 size={24} /> : <Repeat size={24} />}
        </button>
      </div>

      {/* Footer / Volume */}
      <div className="max-w-2xl mx-auto w-full flex items-center gap-4 text-zinc-400">
        <Volume2 size={20} />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-full accent-white hover:accent-green-500 cursor-pointer"
        />
      </div>
    </div>
  )
}
