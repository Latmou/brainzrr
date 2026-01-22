'use client'

import {useState} from 'react'
import {Release} from '@/app/_types/MusicBrainz'
import {ReleaseItem} from './ReleaseItem'
import {ChevronDown, ChevronRight} from 'lucide-react'
import {HorizontalScroller} from './HorizontalScroller'

interface LabelReleasesProps {
  releases: Release[]
}

export function LabelReleases({releases}: LabelReleasesProps) {
  const [showSecondary, setShowSecondary] = useState(false)

  const categories = releases.reduce((acc, release) => {
    const rg = release['release-group']
    const primaryType = rg?.['primary-type']
    const secondaryTypes = rg?.['secondary-types'] ?? []

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
    albums: [] as Release[],
    ep: [] as Release[],
    lives: [] as Release[],
    compilations: [] as Release[],
    singles: [] as Release[],
    other: [] as Release[]
  })

  const hasSecondary =
    categories.lives.length > 0 ||
    categories.compilations.length > 0 ||
    categories.singles.length > 0 ||
    categories.other.length > 0

  return (
    <div className="flex flex-col gap-8">
      {categories.albums.length > 0 && (
        <HorizontalScroller
          title="Albums"
          containerClassName="sm:flex-wrap sm:overflow-x-visible"
        >
          {categories.albums.map((release) => (
            <div key={release.id} className="w-48 flex-shrink-0 sm:flex-shrink">
              <ReleaseItem release={release} />
            </div>
          ))}
        </HorizontalScroller>
      )}

      {categories.ep.length > 0 && (
        <HorizontalScroller
          title="EPs"
          containerClassName="sm:flex-wrap sm:overflow-x-visible"
        >
          {categories.ep.map((release) => (
            <div key={release.id} className="w-48 flex-shrink-0 sm:flex-shrink">
              <ReleaseItem release={release} />
            </div>
          ))}
        </HorizontalScroller>
      )}

      {hasSecondary && (
        <div className="flex flex-col gap-8">
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-lg w-fit"
          >
            {showSecondary ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
            {showSecondary ? 'Masquer' : 'Afficher'} Lives, Singles et Autres
          </button>

          {showSecondary && (
            <>
              {categories.lives.length > 0 && (
                <HorizontalScroller
                  title="Lives"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.lives.map((release) => (
                    <div key={release.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseItem release={release} />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {categories.compilations.length > 0 && (
                <HorizontalScroller
                  title="Compilations"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.compilations.map((release) => (
                    <div key={release.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseItem release={release} />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {categories.singles.length > 0 && (
                <HorizontalScroller
                  title="Singles"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.singles.map((release) => (
                    <div key={release.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseItem release={release} />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {categories.other.length > 0 && (
                <HorizontalScroller
                  title="Autre"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.other.map((release) => (
                    <div key={release.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseItem release={release} />
                    </div>
                  ))}
                </HorizontalScroller>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
