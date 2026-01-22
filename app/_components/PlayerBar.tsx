'use client'

import { 
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, 
  Volume2, ListMusic, Repeat1, Loader2
} from 'lucide-react'
import { usePlayer } from '@/app/_context/PlayerContext'
import { cn } from '@/app/_lib/utils'
import Link from 'next/link'
import { ReleaseArt } from './ReleaseArt'

export function PlayerBar({ className }: { className?: string }) {
  const { 
    currentTrack, isPlaying, togglePlay, next, previous, 
    volume, setVolume, loopMode, setLoopMode, isRandom, toggleRandom,
    currentTime, duration, seek, setIsFullScreen, isLoading
  } = usePlayer()

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    seek(percentage * duration)
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
    <div 
      className={cn("h-20 lg:h-24 bg-black px-4 flex items-center justify-between cursor-pointer", className)}
      onClick={() => setIsFullScreen(true)}
    >
      {/* Track Info */}
      <div className="w-1/2 lg:w-1/3 flex items-center gap-4">
        {currentTrack ? (
          <>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-zinc-800 rounded flex-shrink-0 overflow-hidden relative">
               {isLoading ? (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <Loader2 size={24} className="text-white animate-spin" />
                 </div>
               ) : currentTrack.releaseId ? (
                 <ReleaseArt 
                    releaseId={currentTrack.releaseId} 
                    title={currentTrack.title}
                    className="w-full h-full"
                    fallbackSize={24}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                    <ListMusic size={24} className="text-zinc-500" />
                 </div>
               )}
            </div>
            <div className="overflow-hidden">
              {currentTrack.releaseId ? (
                <Link 
                  href={`/release/${currentTrack.releaseId}`}
                  className="text-white text-sm font-semibold truncate hover:underline block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentTrack.title}
                </Link>
              ) : (
                <div className="text-white text-sm font-semibold truncate">
                  {currentTrack.title}
                </div>
              )}
              
              {currentTrack.artistId ? (
                <Link 
                  href={`/artist/${currentTrack.artistId}`}
                  className="text-zinc-400 text-xs hover:text-white hover:underline truncate block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentTrack.artist}
                </Link>
              ) : (
                <div className="text-zinc-400 text-xs truncate">
                  {currentTrack.artist}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-zinc-500 text-sm italic">Aucun morceau en lecture</div>
        )}
      </div>

      {/* Player Controls */}
      <div 
        className="flex flex-col items-center flex-1 lg:max-w-[40%] lg:w-full gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              toggleRandom()
            }}
            className={cn("hidden lg:block hover:text-white transition-colors", isRandom ? "text-green-500" : "text-zinc-400")}
          >
            <Shuffle size={20} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              previous()
            }} 
            className="hidden lg:block text-zinc-400 hover:text-white transition-colors"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-0.5" />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              next()
            }} 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              if (loopMode === 'none') setLoopMode('all')
              else if (loopMode === 'all') setLoopMode('one')
              else setLoopMode('none')
            }}
            className={cn("hidden lg:block hover:text-white transition-colors", loopMode !== 'none' ? "text-green-500" : "text-zinc-400")}
          >
            {loopMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div 
          className="hidden lg:flex items-center gap-2 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] text-zinc-400 w-8 text-right">{formatTime(currentTime)}</div>
          <div 
            className="h-1 flex-1 bg-zinc-800 rounded-full group cursor-pointer relative"
            onMouseDown={handleProgressMouseDown}
          >
            <div 
              className="h-full bg-white group-hover:bg-green-500 rounded-full relative" 
              style={{ width: `${duration ? (currentTime / (duration ?? 1)) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md translate-x-1/2" />
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 w-8">{formatTime(duration)}</div>
        </div>
      </div>

      {/* Volume & Other Controls */}
      <div 
        className="hidden lg:flex w-1/3 items-center justify-end gap-3 text-zinc-400"
        onClick={(e) => e.stopPropagation()}
      >
        <ListMusic size={20} className="hover:text-white cursor-pointer" />
        <div className="flex items-center gap-2 w-32 group">
          <Volume2 size={20} className="group-hover:text-white transition-colors" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => {
              e.stopPropagation()
              setVolume(parseFloat(e.target.value))
            }}
            className="w-full h-1 bg-zinc-800 rounded-full accent-white hover:accent-green-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
