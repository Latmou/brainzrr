'use client'

import { usePlayer } from '@/app/_context/PlayerContext'
import { Trash2, Music, Play, X } from 'lucide-react'
import { cn } from '@/app/_lib/utils'
import Image from 'next/image'
import { ReleaseArt } from './ReleaseArt'

export function QueueView() {
  const { 
    currentTrack, queue, removeFromQueue, goTo, toggleQueue, isPlaying, clearQueue
  } = usePlayer()

  const formatDuration = (ms: number | undefined) => {
    if (ms === undefined) return ''
    const seconds = ms / 1000
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 rounded-lg overflow-hidden border border-white/5">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-xl font-bold">File d'attente</h2>
        <div className="flex items-center gap-4">
          {queue.length > 0 && (
            <button 
              onClick={clearQueue}
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
            >
              Vider
            </button>
          )}
          <button 
            onClick={toggleQueue}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Current Track */}
        <section className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">En cours</h3>
          {currentTrack ? (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden relative flex-shrink-0">
                {currentTrack.releases?.[0]?.id ? (
                  <ReleaseArt 
                    releaseId={currentTrack.releases[0].id} 
                    title={currentTrack.title}
                    src={currentTrack.releases[0]['cover-art-url']}
                    className="w-full h-full"
                    fallbackSize={20}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                    <Music size={20} className="text-zinc-500" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex gap-1 items-end h-3">
                       <div className="w-1 bg-green-500 animate-[bounce_1s_infinite_0ms]" style={{height: '60%'}}></div>
                       <div className="w-1 bg-green-500 animate-[bounce_1s_infinite_200ms]" style={{height: '100%'}}></div>
                       <div className="w-1 bg-green-500 animate-[bounce_1s_infinite_400ms]" style={{height: '80%'}}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-green-500 font-bold truncate">{currentTrack.title}</div>
                <div className="text-zinc-400 text-sm truncate">{currentTrack['artist-credit']?.[0]?.name || 'Unknown Artist'}</div>
              </div>
              <div className="text-zinc-500 text-sm">
                {formatDuration(currentTrack.length)}
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 italic text-sm">Aucun morceau en lecture</div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">À suivre</h3>
          {queue.length > 0 ? (
            <div className="flex flex-col gap-1">
              {queue.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 group transition-colors cursor-pointer"
                  onClick={() => goTo(index)}
                >
                  <div className="relative w-10 h-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    {track.releases?.[0]?.id ? (
                      <ReleaseArt 
                        releaseId={track.releases[0].id} 
                        title={track.title}
                        src={track.releases[0]['cover-art-url']}
                        className="w-full h-full"
                        fallbackSize={16}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                        <Music size={16} className="text-zinc-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{track.title}</div>
                    <div className="text-zinc-400 text-xs truncate">{track['artist-credit']?.[0]?.name || 'Unknown Artist'}</div>
                  </div>
                  <div className="text-zinc-500 text-xs hidden group-hover:block">
                    {formatDuration(track.length)}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromQueue(track.id)
                    }}
                    className="text-zinc-500 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 italic text-sm py-4">La file d'attente est vide</div>
          )}
        </section>
      </div>
    </div>
  )
}
