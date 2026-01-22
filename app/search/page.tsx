'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, User, Plus } from 'lucide-react'
import { musicBrainzService } from '@/app/_lib/musicbrainz'
import Link from 'next/link'
import { RecordingItem } from '@/app/_components/RecordingItem'
import { ReleaseItem } from '@/app/_components/ReleaseItem'
import { ArtistItem } from '@/app/_components/ArtistItem'
import { cacheService } from '@/app/_lib/cache'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<any>({ artists: [], recordings: [], releases: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Debounce query
  useEffect(() => {
    if (!query) {
      setDebouncedQuery('')
      return
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Load from cache on mount
  useEffect(() => {
    const loadCache = async () => {
      const savedQuery = await cacheService.get<string>('search_query')
      const savedResults = await cacheService.get<any>('search_results')

      if (savedQuery) {
        setQuery(savedQuery)
        setDebouncedQuery(savedQuery)
      }
      if (savedResults) {
        setResults(savedResults)
      }
      // Use a small delay to ensure initial values are set before we allow searches
      setTimeout(() => setIsInitialLoad(false), 100)
    }

    if (typeof window !== 'undefined') {
      loadCache()
    }
  }, [])

  // Save to cache when query or results change
  useEffect(() => {
    if (!isInitialLoad && typeof window !== 'undefined') {
      cacheService.set('search_query', query)
      cacheService.set('search_results', results)
    }
  }, [query, results, isInitialLoad])

  useEffect(() => {
    if (!isInitialLoad && debouncedQuery) {
      performSearch(debouncedQuery)
    } else if (!isInitialLoad && !debouncedQuery) {
      setResults({ artists: [], recordings: [], releases: [] })
    }
  }, [debouncedQuery, isInitialLoad])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery) return
    setIsLoading(true)
    try {
      const [artists, recordings, releases] = await Promise.all([
        musicBrainzService.searchArtist(searchQuery),
        musicBrainzService.searchRecording(searchQuery),
        musicBrainzService.searchRelease(searchQuery)
      ])
      setResults({
        artists: artists.artists || [],
        recordings: recordings.recordings || [],
        releases: releases.releases || []
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistes, morceaux ou releases"
          className="w-full bg-zinc-800 border-none rounded-full py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-white outline-none"
        />
      </form>

      {isLoading && <div className="text-zinc-400">Recherche en cours...</div>}

      {!isLoading && (
        <div className="flex flex-col gap-10">
          {/* Artistes */}
          {results.artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Artistes</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.slice(0, 5).map((artist: any) => (
                  <ArtistItem key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Morceaux */}
          {results.recordings.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Morceaux</h2>
              <div className="flex flex-col">
                {results.recordings.slice(0, 10).map((recording: any) => (
                  <RecordingItem 
                    key={recording.id} 
                    recording={recording} 
                    showIndex={false}
                    coverArtUrl={recording.releases?.[0]?.id ? `https://coverartarchive.org/release/${recording.releases[0].id}/front-250` : undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Releases */}
          {results.releases.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Releases</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.releases.slice(0, 5).map((release: any) => (
                  <ReleaseItem key={release.id} release={release} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
