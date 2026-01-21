import { musicBrainzService } from '@/app/_lib/musicbrainz'
import { Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { RecordingItem } from '@/app/_components/RecordingItem'
import { ReleaseArt } from '@/app/_components/ReleaseArt'

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
    artistId: track['artist-credit']?.[0]?.artist?.id || release['artist-credit']?.[0]?.artist?.id,
    releaseId: id,
    duration: track.recording.length ? track.recording.length / 1000 : null,
    coverArtUrl: coverArtUrl ?? null
  }))

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <ReleaseArt 
          releaseId={id} 
          title={release.title} 
          className="w-48 h-48 md:w-64 md:h-64 rounded shadow-2xl flex-shrink-0"
          fallbackSize={80}
        />
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black mt-2 leading-tight break-words w-full">
            {release.title}
          </h1>
          <div className="text-xs font-bold italic mb-4 md:mb-6 ">"{release.disambiguation}"</div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-sm">
            <div className="flex items-center gap-1">
              <User size={16} className="text-zinc-400" />
              <Link href={`/artist/${release['artist-credit']?.[0]?.artist?.id}`} className="font-bold hover:underline">
                {artistName}
              </Link>
            </div>
            <span className="text-zinc-400">•</span>
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-zinc-400" />
              <span className="text-zinc-400">{new Date(releaseDate).toLocaleDateString('fr-FR') || releaseDate}</span>
            </div>
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
              artistId={release['artist-credit']?.[0]?.artist?.id}
              releaseId={id}
              coverArtUrl={coverArtUrl}
              fullTracklist={fullTracklist}
            />
          ))}
        </div>
      </section>

      <pre className={'text-xs'}>{JSON.stringify(release, null, 2)}</pre>
    </div>
  )
}
