'use client'

import {useState} from 'react'
import {ReleaseGroup} from '@/app/_types/MusicBrainz'
import {ReleaseGroupItem} from './ReleaseGroupItem'
import {ChevronDown, ChevronRight} from 'lucide-react'
import {HorizontalScroller} from './HorizontalScroller'

interface DiscographyProps {
  artistName: string
  categories: {
    albums: ReleaseGroup[]
    ep: ReleaseGroup[]
    lives: ReleaseGroup[]
    compilations: ReleaseGroup[]
    singles: ReleaseGroup[]
    other: ReleaseGroup[]
  }
}

export function Discography({artistName, categories}: DiscographyProps) {
  const [showSecondary, setShowSecondary] = useState(false)

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
          {categories.albums.map((releaseGroup) => (
            <div key={releaseGroup.id} className="w-48 flex-shrink-0 sm:flex-shrink">
              <ReleaseGroupItem
                releaseGroup={releaseGroup}
                artistName={artistName}
              />
            </div>
          ))}
        </HorizontalScroller>
      )}

      {categories.ep.length > 0 && (
        <HorizontalScroller
          title="EPs"
          containerClassName="sm:flex-wrap sm:overflow-x-visible"
        >
          {categories.ep.map((releaseGroup) => (
            <div key={releaseGroup.id} className="w-48 flex-shrink-0 sm:flex-shrink">
              <ReleaseGroupItem
                releaseGroup={releaseGroup}
                artistName={artistName}
              />
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
                  {categories.lives.map((releaseGroup) => (
                    <div key={releaseGroup.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseGroupItem
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {categories.compilations.length > 0 && (
                <HorizontalScroller
                  title="Compilations"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.compilations.map((releaseGroup) => (
                    <div key={releaseGroup.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseGroupItem
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {categories.singles.length > 0 && (
                <HorizontalScroller
                  title="Singles"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.singles.map((releaseGroup) => (
                    <div key={releaseGroup.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseGroupItem
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {categories.other.length > 0 && (
                <HorizontalScroller
                  title="Autre"
                  containerClassName="sm:flex-wrap sm:overflow-x-visible"
                >
                  {categories.other.map((releaseGroup) => (
                    <div key={releaseGroup.id} className="w-48 flex-shrink-0 sm:flex-shrink">
                      <ReleaseGroupItem
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
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
