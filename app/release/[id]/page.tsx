import { musicBrainzService } from '@/app/_lib/musicbrainz'
import { Music, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { RecordingItem } from '@/app/_components/RecordingItem'

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Fetch release details with recordings (tracks) and artist-credits
  const release = await musicBrainzService.getRelease(id)
  
  const tracks = release.media?.[0]?.tracks || []
  const artistName = release['artist-credit']?.[0]?.name || 'Unknown Artist'
  const releaseDate = release.date || 'Unknown Date'
  const coverArtUrl = release['cover-art-url']

  const fullTracklist = tracks.map((track: any) => ({
    id: track.id,
    mbid: track.recording.id,
    title: track.title,
    artist: track['artist-credit']?.[0]?.name || artistName,
    duration: track.recording.length ? track.recording.length / 1000 : null,
    coverArtUrl: coverArtUrl ?? null
  }))

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="w-64 h-64 bg-zinc-800 rounded shadow-2xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
          {release['cover-art-url'] ? (
            <img 
              src={release['cover-art-url']} 
              alt={release.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music size={120} className="text-zinc-500" />
          )}
        </div>
        <div>
          <span className="text-sm font-bold uppercase">{release.status || 'Release'}</span>
          <h1 className="text-7xl font-black mt-2 mb-6">{release.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-zinc-400" />
            <Link href={`/artist/${release['artist-credit']?.[0]?.artist?.id}`} className="font-bold hover:underline">
              {artistName}
            </Link>
            <span className="text-zinc-400">•</span>
            <Calendar size={16} className="text-zinc-400" />
            <span className="text-zinc-400">{new Date(releaseDate).getFullYear() || releaseDate}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-400">{tracks.length} titres</span>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <section>
        <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 border-b border-white/10 text-zinc-400 text-sm font-medium mb-4">
          <div>#</div>
          <div>Titre</div>
          <div className="flex justify-end">Durée</div>
        </div>
        <div className="flex flex-col">
          {tracks.map((track: any, index: number) => (
            <RecordingItem 
              key={track.id} 
              recording={{
                ...track.recording,
                title: track.title, // track title might be different from recording title
                'artist-credit': track['artist-credit']
              }}
              index={index}
              artistName={artistName}
              coverArtUrl={coverArtUrl}
              fullTracklist={fullTracklist}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
