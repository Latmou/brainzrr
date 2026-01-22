'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, User, Plus } from 'lucide-react'
import { musicBrainzService } from '@/app/_lib/musicbrainz'
import Link from 'next/link'
import { RecordingItem } from '@/app/_components/RecordingItem'
import { ReleaseItem } from '@/app/_components/ReleaseItem'

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

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedQuery = localStorage.getItem('search_query')
      const savedResults = localStorage.getItem('search_results')

      if (savedQuery) {
        setQuery(savedQuery)
        setDebouncedQuery(savedQuery)
      }
      if (savedResults) {
        try {
          setResults(JSON.parse(savedResults))
        } catch (e) {
          console.error('Failed to parse saved search results', e)
        }
      }
      // Use a small delay to ensure initial values are set before we allow searches
      setTimeout(() => setIsInitialLoad(false), 100)
    }
  }, [])

  // Save to localStorage when query or results change
  useEffect(() => {
    if (!isInitialLoad && typeof window !== 'undefined') {
      localStorage.setItem('search_query', query)
      localStorage.setItem('search_results', JSON.stringify(results))
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
                  <Link 
                    key={artist.id} 
                    href={`/artist/${artist.id}`}
                    className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer relative"
                  >
                    <button
                      className="absolute right-6 top-6 bg-green-500 rounded-full p-2 text-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                    >
                      <Plus size={20} />
                    </button>
                    <div className="aspect-square bg-zinc-700 rounded-full mb-4 shadow-xl flex items-center justify-center">
                      <User size={48} className="text-zinc-500" />
                    </div>
                    <div className="font-bold truncate">{artist.name}</div>
                    <div className="text-zinc-400 text-sm">Artiste</div>
                  </Link>
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
                    artistId={recording['artist-credit']?.[0]?.artist?.id}
                    releaseId={recording.releases?.[0]?.id}
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
