'use client'

import {
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle,
  Volume2, ListMusic, Repeat1, Loader2, Music
} from 'lucide-react'
import { usePlayer } from '@/app/_context/PlayerContext'
import { cn } from '@/app/_lib/utils'
import Link from 'next/link'
import { ReleaseArt } from './ReleaseArt'
import { Slider } from './Slider'
import Image from 'next/image'

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
               ) : currentTrack.coverArtUrl ? (
                  <Image
                    src={currentTrack.coverArtUrl}
                    width={56}
                    height={56}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    unoptimized={currentTrack.coverArtUrl.includes('coverartarchive.org')}
                  />
               ) : currentTrack.releaseId ? (
                 <ReleaseArt 
                    releaseId={currentTrack.releaseId} 
                    title={currentTrack.title}
                    className="w-full h-full"
                    fallbackSize={24}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                    <Music size={24} className="text-zinc-500" />
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
          <div className="text-[10px] text-zinc-400 w-8 text-right font-medium">{formatTime(currentTime)}</div>
          <Slider 
            value={duration ? currentTime / duration : 0}
            onChange={(val) => seek(val * duration)}
            activeColor="group-hover:bg-green-500 bg-zinc-400"
            thumbSize="w-2 h-2"
          />
          <div className="text-[10px] text-zinc-400 w-8 font-medium">{formatTime(duration)}</div>
        </div>
      </div>

      {/* Volume & Other Controls */}
      <div 
        className="hidden lg:flex w-1/3 items-center justify-end gap-3 text-zinc-400"
        onClick={(e) => e.stopPropagation()}
      >
        <ListMusic size={20} className="hover:text-white cursor-pointer transition-colors" />
        <div 
          className="flex items-center gap-2 w-32 group"
          onWheel={(e) => {
            e.stopPropagation()
            const delta = e.deltaY > 0 ? -0.05 : 0.05
            setVolume(Math.max(0, Math.min(1, volume + delta)))
          }}
        >
          <Volume2 size={20} className="group-hover:text-white transition-colors" />
          <Slider 
            value={volume}
            onChange={setVolume}
            activeColor="bg-white group-hover:bg-green-500"
            thumbSize="w-2 h-2"
          />
        </div>
      </div>
    </div>
  )
}
