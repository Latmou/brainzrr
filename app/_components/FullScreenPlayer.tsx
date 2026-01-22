'use client'

import {
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle,
  ChevronDown, ListMusic, Repeat1, Volume2, Loader2, Music
} from 'lucide-react'
import { usePlayer } from '@/app/_context/PlayerContext'
import { cn } from '@/app/_lib/utils'
import Link from 'next/link'
import { ReleaseArt } from './ReleaseArt'
import { Slider } from './Slider'
import Image from 'next/image'
import { QueueView } from './QueueView'

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, togglePlay, next, previous, 
    volume, setVolume, loopMode, setLoopMode, isRandom, toggleRandom,
    currentTime, duration, seek, isFullScreen, setIsFullScreen, isLoading,
    showQueue, toggleQueue
  } = usePlayer()

  if (!currentTrack) return null

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
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
        <button 
          onClick={toggleQueue}
          className={cn("text-zinc-400 hover:text-white transition-colors", showQueue && "text-green-500")}
        >
          <ListMusic size={32} />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
        {showQueue ? (
          <div className="flex-1 min-h-0">
             <QueueView />
          </div>
        ) : (
          <>
            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center mb-8 lg:mb-0">
              <div className="w-full max-w-[400px] aspect-square bg-zinc-800 rounded-lg shadow-2xl overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <Loader2 size={80} className="text-white animate-spin" />
                  </div>
                ) : currentTrack.coverArtUrl ? (
                  <Image
                    src={currentTrack.coverArtUrl}
                    width={400}
                    height={400}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    unoptimized={currentTrack.coverArtUrl.includes('coverartarchive.org')}
                  />
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
            <div className="flex-1 flex flex-col justify-center">
              <div className="max-w-2xl w-full mb-8">
                {currentTrack.releaseId ? (
                  <Link 
                    href={`/release/${currentTrack.releaseId}`}
                    className="text-2xl lg:text-4xl font-bold mb-2 hover:underline block"
                    onClick={() => setIsFullScreen(false)}
                  >
                    {currentTrack.title}
                  </Link>
                ) : (
                  <div className="text-2xl lg:text-4xl font-bold mb-2">{currentTrack.title}</div>
                )}
                
                {currentTrack.artistId ? (
                  <Link 
                    href={`/artist/${currentTrack.artistId}`}
                    className="text-zinc-400 text-lg lg:text-2xl hover:text-white hover:underline block"
                    onClick={() => setIsFullScreen(false)}
                  >
                    {currentTrack.artist}
                  </Link>
                ) : (
                  <div className="text-zinc-400 text-lg lg:text-2xl">{currentTrack.artist}</div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="max-w-2xl w-full mb-8">
                <div className="mb-4">
                  <Slider 
                    value={duration ? currentTime / duration : 0}
                    onChange={(val) => seek(val * duration)}
                    activeColor="group-hover:bg-green-500 bg-zinc-400"
                    thumbSize="w-3 h-3"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium tracking-wider">
                  <div>{formatTime(currentTime)}</div>
                  <div>{formatTime(duration)}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="max-w-2xl w-full flex items-center justify-between mb-8">
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

              {/* Volume */}
              <div 
                className="max-w-2xl w-full flex items-center gap-4 text-zinc-400 group"
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
                  thumbSize="w-3 h-3"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
