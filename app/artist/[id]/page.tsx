import {musicBrainzService} from '@/app/_lib/musicbrainz'
import {User} from 'lucide-react'
import {ReleaseGroupItem} from '@/app/_components/ReleaseGroupItem'
import {Pre} from "@/app/_components/Pre";

export default async function ArtistPage({params}: { params: Promise<{ id: string }> }) {
  const {id} = await params


  const artist = await musicBrainzService.getArtist(id)
  const releases = artist['release-groups'] || []

  const categories = releases.reduce((acc, release) => {
    const secondaryTypes = release['secondary-types'] ?? []
    const primaryType = release['primary-type']

    if (primaryType === 'Album' && secondaryTypes.length === 0) {
      acc.albums.push(release)
    } else if (primaryType === 'EP' && secondaryTypes.length === 0) {
      acc.ep.push(release)
    } else if (primaryType === 'Album' && secondaryTypes.includes('Live')) {
      acc.lives.push(release)
    } else if (primaryType === 'Album' && secondaryTypes.includes('Compilation')) {
      acc.compilations.push(release)
    } else if (primaryType === 'Single') {
      acc.singles.push(release)
    } else {
      acc.other.push(release)
    }
    return acc
  }, {
    albums: [] as typeof releases,
    ep: [] as typeof releases,
    lives: [] as typeof releases,
    compilations: [] as typeof releases,
    singles: [] as typeof releases,
    other: [] as typeof releases
  })

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div
          className="w-32 h-32 md:w-48 md:h-48 bg-zinc-800 rounded-full shadow-2xl flex items-center justify-center flex-shrink-0">
          <User size={60} className="text-zinc-500 md:w-[80px] md:h-[80px]"/>
        </div>
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <span className="text-xs md:text-sm font-bold uppercase">Artiste</span>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mt-2 mb-4 md:mb-6 leading-tight break-words w-full">{artist.name}</h1>
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

      {categories.albums.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.albums.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artist.name}
              />
            ))}
          </div>
        </section>
      )}

      {categories.ep.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">EPs</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.ep.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artist.name}
              />
            ))}
          </div>
        </section>
      )}

      {categories.lives.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Lives</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.lives.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artist.name}
              />
            ))}
          </div>
        </section>
      )}

      {categories.compilations.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Compilations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.compilations.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artist.name}
              />
            ))}
          </div>
        </section>
      )}

      {categories.singles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Singles</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.singles.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artist.name}
              />
            ))}
          </div>
        </section>
      )}

      {categories.other.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Autre</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.other.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artist.name}
              />
            ))}
          </div>
        </section>
      )}



      <hr className="mt-8 -mb-4 border-white/10"/>
      <Pre data={artist} />
    </div>
  )
}
