import {musicBrainzService} from '@/app/_lib/musicbrainz'
import {Globe, Tag as TagIcon, Building2, MapPin, Hash} from 'lucide-react'
import {Pre} from "@/app/_components/Pre"
import Link from 'next/link'
import {LabelReleases} from "@/app/_components/LabelReleases";

export default async function LabelPage({params}: { params: Promise<{ id: string }> }) {
  const {id} = await params
  const label = await musicBrainzService.getLabel(id)

  const genres = label.genres || []
  const tags = label.tags || []

  // Filter useful links
  const links = label.relations?.filter((rel: any) => 
    ['official homepage', 'social network', 'youtube', 'instagram', 'twitter', 'facebook', 'bandcamp', 'soundcloud', 'discogs', 'wikidata'].includes(rel.type)
  ).map((rel: any) => ({
    type: rel.type,
    url: rel.url?.resource || '',
    label: rel.url?.resource.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || rel.type
  })) || []

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-zinc-800 rounded-lg flex items-center justify-center shadow-2xl flex-shrink-0">
          <Building2 size={80} className="text-zinc-600" />
        </div>
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <span className="text-xs md:text-sm font-bold uppercase text-zinc-400">Label</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mt-2 mb-4 md:mb-6 leading-tight break-words w-full">
            {label.name}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-400">
            {label.type && (
              <div className="flex items-center gap-1.5">
                <TagIcon size={16} />
                <span>{label.type}</span>
              </div>
            )}
            {label.country && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{label.country}</span>
              </div>
            )}
            {label['label-code'] && (
              <div className="flex items-center gap-1.5">
                <Hash size={16} />
                <span>LC {String(label['label-code']).padStart(5, '0')}</span>
              </div>
            )}
          </div>

          {(genres.length > 0 || tags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-6">
              {genres.slice(0, 5).map((genre: any) => (
                <Link
                  key={genre.id}
                  href={`/tag/${genre.name}`}
                  className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
              {tags.slice(0, 5).map((tag: any) => (
                <Link
                  key={tag.name}
                  href={`/tag/${tag.name}`}
                  className="text-[10px] md:text-xs font-medium bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-300 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {links.map((link: any, idx: number) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 px-2.5 py-1 rounded-full border border-white/5"
                >
                  <Globe size={14} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {label.disambiguation && (
        <div className="max-w-3xl">
          <p className="text-zinc-400 italic">
            {label.disambiguation}
          </p>
        </div>
      )}

      {label.releases && label.releases.length > 0 && (
        <section className="mt-8">
          <LabelReleases releases={label.releases} />
        </section>
      )}

      <hr className="mt-8 -mb-4 border-white/10"/>
      <Pre data={label} />
    </div>
  )
}
