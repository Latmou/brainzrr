'use client'

import { useState, useEffect } from 'react'
import { ReleaseGroup, Release } from '@/app/_types/MusicBrainz'
import { ReleaseItem } from './ReleaseItem'
import { getReleaseGroupReleasesAction } from '@/app/_actions/musicbrainz'
import { cacheService } from '@/app/_lib/cache'

interface ReleaseGroupItemProps {
  releaseGroup: ReleaseGroup
  artistName?: string
}

export function ReleaseGroupItem({ releaseGroup, artistName }: ReleaseGroupItemProps) {
  const [release, setRelease] = useState<Release | null>(
    releaseGroup.releases && releaseGroup.releases.length > 0 
      ? releaseGroup.releases[releaseGroup.releases.length - 1]
      : null
  )
  const [isLoading, setIsLoading] = useState(!release)

  useEffect(() => {
    if (!release) {
      // Check cache first
      const cached = cacheService.get<Release>(`rg_release_${releaseGroup.id}`)
      if (cached) {
        setRelease(cached)
        setIsLoading(false)
        return
      }

      const fetchReleases = async () => {
        setIsLoading(true)
        try {
          const data = await getReleaseGroupReleasesAction(releaseGroup.id)
          if (data && data.releases && data.releases.length > 0) {
            // Sort releases by date descending to get the most recent one as representative
            const sortedReleases = [...data.releases].sort((a, b) => {
              if (!a.date) return 1
              if (!b.date) return -1
              return b.date.localeCompare(a.date)
            })
            const representative = sortedReleases[0]
            setRelease(representative)
            cacheService.set(`rg_release_${releaseGroup.id}`, representative)
          }
        } catch (error) {
          console.error('Failed to fetch release group releases:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchReleases()
    }
  }, [releaseGroup.id, release])

  if (isLoading) {
    return (
      <div className="bg-zinc-800/40 p-4 rounded-lg animate-pulse">
        <div className="aspect-square bg-zinc-700 rounded mb-4"></div>
        <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (!release) {
    // Fallback if no release is found, though unlikely for a valid release-group
    return (
      <div className="bg-zinc-800/40 p-4 rounded-lg opacity-50">
        <div className="aspect-square bg-zinc-700 rounded mb-4 flex items-center justify-center">
          <span className="text-zinc-500 text-xs">Pas de release</span>
        </div>
        <div className="font-bold truncate">{releaseGroup.title}</div>
        <div className="text-zinc-500 text-xs">
          {releaseGroup['primary-type']}
        </div>
      </div>
    )
  }

  return (
    <ReleaseItem 
      release={release}
      artistName={artistName || release['artist-credit']?.[0]?.name}
    />
  )
}
