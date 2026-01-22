import {musicBrainzService} from '@/app/_lib/musicbrainz'
import {Tag} from 'lucide-react'
import {ArtistItem} from '@/app/_components/ArtistItem'

export default async function TagPage({params}: { params: Promise<{ tag: string }> }) {
  const {tag} = await params
  const decodedTag = decodeURIComponent(tag)

  const [artistResults] = await Promise.all([
    musicBrainzService.getArtistsByTag(decodedTag)
  ])

  const artists = artistResults?.artists || []

  return (
    <div className="flex flex-col gap-10 p-4 md:p-0">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-zinc-800 rounded-lg">
          <Tag size={40} className="text-zinc-400"/>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tag</span>
          <h1 className="text-4xl md:text-6xl font-black capitalize">{decodedTag}</h1>
        </div>
      </div>

      {artists.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Artistes
          </h2>
          <div className="flex flex-wrap gap-4">
            {artists.map((artist: any) => (
              <ArtistItem artist={artist} key={artist.id}/>
            ))}
          </div>
        </section>
      )}

      {artists.length === 0 && (
        <div className="text-center py-20">
          <Tag size={64} className="mx-auto text-zinc-700 mb-4"/>
          <h3 className="text-xl font-bold text-zinc-400">Aucun résultat trouvé pour ce tag.</h3>
          <p className="text-zinc-500 mt-2">Essayez de rechercher autre chose.</p>
        </div>
      )}
    </div>
  )
}
