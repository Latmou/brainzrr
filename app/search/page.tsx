'use client'

import {Suspense, useEffect, useState} from 'react'
import {Search as SearchIcon, X} from 'lucide-react'
import {RecordingItem} from '@/app/_components/RecordingItem'
import {ReleaseItem} from '@/app/_components/ReleaseItem'
import {ArtistItem} from '@/app/_components/ArtistItem'
import {HorizontalScroller} from '@/app/_components/HorizontalScroller'
import {SearchSkeleton} from '@/app/_components/SearchSkeleton'
import {search} from "@/app/_actions/search";
import {useSearchParams, useRouter} from 'next/navigation'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [results, setResults] = useState<any>({artists: [], recordings: [], releases: []})
  const [isLoading, setIsLoading] = useState(false)

  // Sync state with URL when it changes (back/forward navigation)
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    setDebouncedQuery(q)
  }, [searchParams])

  // Debounce query and update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)

      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set('q', query)
      } else {
        params.delete('q')
      }

      const newPath = query ? `/search?${params.toString()}` : '/search'
      // Use replace to avoid polluting history with every keystroke
      // but still allowing it to be in the current entry
      router.replace(newPath)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setResults({artists: [], recordings: [], releases: []})
    }
  }, [debouncedQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery) return
    setIsLoading(true)
    try {
      const [artists, recordings, releases] = await search(searchQuery)
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
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistes, morceaux ou releases"
          className="w-full bg-zinc-800 border-none rounded-full py-3 pl-10 pr-10 text-white focus:ring-2 focus:ring-white outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X size={20}/>
          </button>
        )}
      </form>

      {isLoading && <SearchSkeleton />}

      {!isLoading && (
        <div className="flex flex-col gap-10">
          {/* Artistes */}
          {results.artists.length > 0 && (
            <HorizontalScroller title="Artistes">
              {results.artists.slice(0, 10).map((artist: any) => (
                <div key={artist.id} className="w-48 flex-shrink-0">
                  <ArtistItem artist={artist}/>
                </div>
              ))}
            </HorizontalScroller>
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
                  />
                ))}
              </div>
            </section>
          )}

          {/* Releases */}
          {results.releases.length > 0 && (
            <HorizontalScroller title="Releases">
              {results.releases.slice(0, 10).map((release: any) => (
                <div key={release.id} className="w-48 flex-shrink-0">
                  <ReleaseItem release={release}/>
                </div>
              ))}
            </HorizontalScroller>
          )}

        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  )
}
