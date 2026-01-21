'use client'

import { useState, useEffect } from 'react'
import { User, Search } from 'lucide-react'
import Link from 'next/link'
import { getLibrary } from '@/app/_actions/library'

export default function LibraryPage() {
  const [query, setQuery] = useState('')
  const [library, setLibrary] = useState<{ artists: any[] }>({ artists: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLibrary()
  }, [query])

  const fetchLibrary = async () => {
    setIsLoading(true)
    try {
      const data = await getLibrary(query)
      setLibrary(data)
    } catch (error) {
      console.error('Error fetching library:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Votre bibliothèque</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans la bibliothèque"
            className="bg-zinc-800 border-none rounded-full py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-white outline-none w-64"
          />
        </div>
      </div>

      {isLoading && <div className="text-zinc-400">Chargement...</div>}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-10">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <User size={24} /> Artistes
            </h2>
            <div className="flex flex-col gap-2">
              {library.artists.length > 0 ? (
                library.artists.map((artist) => (
                  <Link 
                    key={artist.id} 
                    href={`/artist/${artist.mbid}`}
                    className="p-3 bg-zinc-800/40 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div className="font-bold">{artist.name}</div>
                  </Link>
                ))
              ) : (
                <div className="text-zinc-500 italic">Aucun artiste trouvé</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
