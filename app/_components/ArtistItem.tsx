'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ArtistArt } from './ArtistArt'

interface ArtistItemProps {
  artist: {
    id: string
    name: string
    type?: string
  }
}

export function ArtistItem({ artist }: ArtistItemProps) {
  return (
    <Link 
      href={`/artist/${artist.id}`}
      className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer relative"
    >
      <button
        className="absolute right-6 top-6 bg-green-500 rounded-full p-2 text-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Future: add to library logic
        }}
      >
        <Plus size={20} />
      </button>
      
      <ArtistArt 
        artistId={artist.id} 
        artistName={artist.name} 
        className="aspect-square mb-4 shadow-xl mx-auto w-full"
        fallbackSize={48}
      />
      
      <div className="font-bold truncate text-center">{artist.name}</div>
      <div className="text-zinc-400 text-sm text-center">{artist.type || 'Artiste'}</div>
    </Link>
  )
}
