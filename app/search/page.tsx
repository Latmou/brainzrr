import { searchMusic } from "@/app/_actions/search";
import SearchPageClient from "./SearchPageClient";
import { SearchResults } from "@/app/_types/MusicBrainz";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialResults: SearchResults = q ? await searchMusic(q) : { artists: [], releases: [], recordings: [] };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-white">Recherche</h1>
      <SearchPageClient initialQuery={q || ''} initialResults={initialResults} />
    </div>
  );
}
