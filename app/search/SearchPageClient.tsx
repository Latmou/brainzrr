'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDebounce } from '@/app/_hooks/useDebounce';
import { searchMusic } from '@/app/_actions/search';
import { SearchResults, ArtistDetails, Release, RecordingDetail, ArtistCredit } from '@/app/_types/MusicBrainz';

interface SearchPageClientProps {
  initialQuery: string;
  initialResults: SearchResults;
}

export default function SearchPageClient({ initialQuery, initialResults }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedQuery) {
        params.set('q', debouncedQuery);
      } else {
        params.delete('q');
      }
      router.push(`/search?${params.toString()}`, { scroll: false });
      
      startTransition(async () => {
        const newResults = await searchMusic(debouncedQuery);
        setResults(newResults);
      });
    }
  }, [debouncedQuery, router, searchParams, initialQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des artistes, albums ou morceaux..."
          className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-green-500 transition-all"
        />
        {isPending && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Artistes */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-400 border-b border-zinc-800 pb-2">Artistes</h2>
          <div className="flex flex-col gap-2">
            {results.artists?.length > 0 ? (
              results.artists.map((artist: ArtistDetails) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="p-3 rounded-md hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{artist.name}</span>
                  {artist.disambiguation && (
                    <span className="text-sm text-zinc-500 truncate">{artist.disambiguation}</span>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-zinc-600 italic">Aucun artiste trouvé</p>
            )}
          </div>
        </section>

        {/* Albums (Releases) */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-400 border-b border-zinc-800 pb-2">Albums</h2>
          <div className="flex flex-col gap-2">
            {results.releases?.length > 0 ? (
              results.releases.map((release: Release) => (
                <Link
                  key={release.id}
                  href={`/release/${release.id}`}
                  className="p-3 rounded-md hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{release.title}</span>
                  <span className="text-sm text-zinc-500 truncate">
                    {release['artist-credit']?.map((ac: ArtistCredit) => ac.name).join(', ')}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-zinc-600 italic">Aucun album trouvé</p>
            )}
          </div>
        </section>

        {/* Morceaux (Recordings) */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-400 border-b border-zinc-800 pb-2">Morceaux</h2>
          <div className="flex flex-col gap-2">
            {results.recordings?.length > 0 ? (
              results.recordings.map((recording: RecordingDetail) => (
                <div
                  key={recording.id}
                  className="p-3 rounded-md flex flex-col"
                >
                  <span className="font-medium">{recording.title}</span>
                  <span className="text-sm text-zinc-500 truncate">
                    {recording['artist-credit']?.map((ac: ArtistCredit) => ac.name).join(', ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 italic">Aucun morceau trouvé</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
