'use client'

import Link from 'next/link'
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
