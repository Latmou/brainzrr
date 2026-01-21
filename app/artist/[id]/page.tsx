import { musicBrainzService } from '@/app/_lib/musicbrainz'
import { User } from 'lucide-react'
import { RecordingItem } from '@/app/_components/RecordingItem'
import { ReleaseItem } from '@/app/_components/ReleaseItem'

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  

  const artist = await musicBrainzService.getArtist(id)
  const releases = artist['releases'] || []
  
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="w-48 h-48 bg-zinc-800 rounded-full shadow-2xl flex items-center justify-center flex-shrink-0">
          <User size={80} className="text-zinc-500" />
        </div>
        <div>
          <span className="text-sm font-bold uppercase">Artiste</span>
          <h1 className="text-7xl font-black mt-2 mb-6">{artist.name}</h1>
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
          {releases.slice(0, 10).map((release: any) => (
            <ReleaseItem 
              key={release.id} 
              release={release} 
              artistName={artist.name} 
            />
          ))}
        </div>
      </section>
    </div>
  )
}
