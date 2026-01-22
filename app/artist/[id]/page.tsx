import { musicBrainzService } from '@/app/_lib/musicbrainz'
import { User } from 'lucide-react'
import { RecordingItem } from '@/app/_components/RecordingItem'
import { ReleaseItem } from '@/app/_components/ReleaseItem'

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  

  const artist = await musicBrainzService.getArtist(id)
  const releases = artist['releases'] || []
  
  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-zinc-800 rounded-full shadow-2xl flex items-center justify-center flex-shrink-0">
          <User size={60} className="text-zinc-500 md:w-[80px] md:h-[80px]" />
        </div>
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <span className="text-xs md:text-sm font-bold uppercase">Artiste</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mt-2 mb-4 md:mb-6 leading-tight break-words w-full">{artist.name}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{artist.type}</span>
            {artist.country && (
              <>
                <span>•</span>
                <span>{artist.country}</span>
              </>
            )}
          </div>
        </div>
      </div>


      {/* Albums / Release Groups */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Discographie</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
          {releases.slice(0).map((release: any) => (
            <ReleaseItem 
              key={release.id} 
              release={release} 
              artistName={artist.name} 
              artistId={id}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
