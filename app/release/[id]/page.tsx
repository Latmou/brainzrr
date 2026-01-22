import { musicBrainzService } from '@/app/_lib/musicbrainz'
import { Calendar, User, Tag } from 'lucide-react'
import Link from 'next/link'
import { RecordingItem } from '@/app/_components/RecordingItem'
import { ReleaseArt } from '@/app/_components/ReleaseArt'
import { Pre } from '@/app/_components/Pre'
import { ReleasePreloader } from '@/app/_components/release/ReleasePreloader'
import { RecordingDetail } from '@/app/_types/MusicBrainz'

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Fetch release details with recordings (tracks) and artist-credits
  const release = await musicBrainzService.getRelease(id)
  
  const tracks = release.media?.[0]?.tracks || []
  const artistName = release['artist-credit']?.[0]?.name || 'Unknown Artist'
  const releaseDate = release.date || 'Unknown Date'
  const coverArtUrl = release['cover-art-url']

  const fullTracklist: RecordingDetail[] = tracks.map((track: any) => ({
    ...track.recording,
    title: track.title,
    'artist-credit': track['artist-credit'] || track.recording['artist-credit'] || release['artist-credit'],
    releases: [release]
  }))

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      <ReleasePreloader tracks={fullTracklist} />
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <ReleaseArt 
          releaseId={id} 
          title={release.title} 
          src={coverArtUrl}
          className="w-48 h-48 md:w-64 md:h-64 rounded shadow-2xl flex-shrink-0"
          fallbackSize={80}
        />
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black mt-2 leading-tight break-words w-full">
            {release.title}
          </h1>
          <div className={'mb-4 md:mb-6 gap-2 text-zinc-400 text-xs'}>
            {release['label-info'] && release['label-info'].length > 0 && (
              <>
                <Tag size={10} className={'inline mr-2'}/>
                {release['label-info'].map((info, index) => (
                  <span key={info.label?.id || index}>
                    {index > 0 && <>, </>}
                    {info.label?.id ? (
                      <Link href={`/label/${info.label.id}`} className="hover:underline">
                        {info.label.name}
                      </Link>
                    ) : (
                      info.label?.name
                    )}
                  </span>
                ))}
              </>
            )}

          </div>
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
        <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 text-zinc-400 text-sm font-medium mb-4">
          <div className="w-4">#</div>
          <div className="flex-1">Titre</div>
          <div className="w-12 text-right">Durée</div>
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

      <hr className="mt-8 -mb-4 border-white/10"/>
      <Pre data={release} />
    </div>
  )
}
