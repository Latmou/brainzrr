import {musicBrainzService} from '@/app/_lib/musicbrainz'
import {wikipediaService} from '@/app/_lib/wikipedia'
import {Globe, Youtube, Instagram, Twitter, Music2, Tag as TagIcon} from 'lucide-react'
import {Discography} from '@/app/_components/Discography'
import {Pre} from "@/app/_components/Pre";
import Link from 'next/link'
import { ArtistArt } from '@/app/_components/ArtistArt'

export default async function ArtistPage({params}: { params: Promise<{ id: string }> }) {
  const {id} = await params


  const artist = await musicBrainzService.getArtist(id)
  const releases = artist['release-groups'] || []
  const genres = artist.genres || []
  const tags = artist.tags || []

  // Extract Wikipedia link and fetch description
  const wikiRel = artist.relations?.find(rel => rel.type === 'wikipedia')
  let description = null
  if (wikiRel?.url?.resource) {
    const url = wikiRel.url.resource
    const parts = url.split('/')
    const title = parts[parts.length - 1]
    const langMatch = url.match(/\/\/([^.]+)\.wikipedia/)
    const lang = langMatch ? langMatch[1] : 'en'
    description = await wikipediaService.getExtract(title, lang)
  }

  // Fallback to searching by artist name if no description found from relations
  if (!description) {
    description = await wikipediaService.getArtistDescription(artist.name)
  }

  // Filter useful links
  const socialLinks = artist.relations?.filter(rel => 
    ['official homepage', 'social network', 'youtube', 'instagram', 'twitter', 'facebook', 'bandcamp', 'soundcloud'].includes(rel.type)
  ).map(rel => ({
    type: rel.type,
    url: rel.url?.resource || '',
    label: rel.url?.resource.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || rel.type
  })) || []

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
        <ArtistArt
          artistId={id}
          artistName={artist.name}
          className="w-32 h-32 md:w-48 md:h-48 shadow-2xl flex-shrink-0"
          fallbackSize={60}
        />
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

          {(genres.length > 0 || tags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {genres.slice(0, 5).map(genre => (
                <Link
                  key={genre.id}
                  href={`/tag/${genre.name}`}
                  className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
              {tags.slice(0, 5).map(tag => (
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

          {socialLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {socialLinks.map((link, idx) => {
                let Icon = Globe
                if (link.type.includes('youtube')) Icon = Youtube
                if (link.type.includes('instagram')) Icon = Instagram
                if (link.type.includes('twitter')) Icon = Twitter
                if (link.type.includes('bandcamp') || link.type.includes('soundcloud')) Icon = Music2
                
                return (
                  <a 
                    key={idx} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 px-2.5 py-1 rounded-full border border-white/5"
                  >
                    <Icon size={14} />
                    <span>{link.label}</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="max-w-3xl">
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base line-clamp-4 transition-all">
            {description}
          </p>
        </div>
      )}

      <Discography artistName={artist.name} categories={categories} />

      <hr className="mt-8 -mb-4 border-white/10"/>
      <Pre data={artist} />
    </div>
  )
}
