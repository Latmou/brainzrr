'use client'

import { useState } from 'react'
import { ReleaseGroup } from '@/app/_types/MusicBrainz'
import { ReleaseGroupItem } from './ReleaseGroupItem'
import {ChevronDown, ChevronRight, ChevronUp} from 'lucide-react'

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

export function Discography({ artistName, categories }: DiscographyProps) {
  const [showSecondary, setShowSecondary] = useState(false)

  const hasSecondary = 
    categories.lives.length > 0 || 
    categories.compilations.length > 0 || 
    categories.singles.length > 0 || 
    categories.other.length > 0

  return (
    <div className="flex flex-col gap-8">
      {categories.albums.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.albums.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artistName}
              />
            ))}
          </div>
        </section>
      )}

      {categories.ep.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">EPs</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.ep.map((releaseGroup) => (
              <ReleaseGroupItem
                key={releaseGroup.id}
                releaseGroup={releaseGroup}
                artistName={artistName}
              />
            ))}
          </div>
        </section>
      )}

      {hasSecondary && (
        <div className="flex flex-col gap-8">
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-lg w-fit"
          >
            {showSecondary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            {showSecondary ? 'Masquer' : 'Afficher'} Lives, Singles et Autres
          </button>

          {showSecondary && (
            <>
              {categories.lives.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Lives</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categories.lives.map((releaseGroup) => (
                      <ReleaseGroupItem
                        key={releaseGroup.id}
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    ))}
                  </div>
                </section>
              )}

              {categories.compilations.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Compilations</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categories.compilations.map((releaseGroup) => (
                      <ReleaseGroupItem
                        key={releaseGroup.id}
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    ))}
                  </div>
                </section>
              )}

              {categories.singles.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Singles</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categories.singles.map((releaseGroup) => (
                      <ReleaseGroupItem
                        key={releaseGroup.id}
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    ))}
                  </div>
                </section>
              )}

              {categories.other.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Autre</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categories.other.map((releaseGroup) => (
                      <ReleaseGroupItem
                        key={releaseGroup.id}
                        releaseGroup={releaseGroup}
                        artistName={artistName}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
