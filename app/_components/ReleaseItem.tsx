import Link from 'next/link'
import { Play } from 'lucide-react'
import { ReleaseArt } from './ReleaseArt'
import {Release} from "@/app/_types/MusicBrainz";

interface ReleaseItemProps {
  release: Release
  artistName?: string
}

export function ReleaseItem({ release, artistName: artistNameProp }: ReleaseItemProps) {
  // If it's a release-group, it might have a 'releases' array, we use the first release ID for the link
  const releaseId = release.id
  const artistName = artistNameProp || release['artist-credit']?.[0]?.name

  return (
    <Link 
      href={`/release/${releaseId}`}
      className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer"
    >
      <div className="aspect-square mb-4 shadow-xl relative group">
        <ReleaseArt 
          releaseId={releaseId} 
          title={release.title} 
          className="w-full h-full rounded"
        />
        <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 text-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg z-10">
          <Play size={20} className="fill-current" />
        </div>
      </div>
      <div className="font-bold truncate">{release.title}</div>
      <div className="flex flex-col">
        {artistName && <div className="text-zinc-400 text-sm truncate">{artistName}</div>}
        <div className="text-zinc-500 text-xs truncate">
          {release.date && <>{new Date(release.date).toLocaleDateString('fr-FR')}</>}
          {release.disambiguation && <> • <span className={'italic'}>"{release.disambiguation}"</span></>}
        </div>
      </div>
    </Link>
  )
}
