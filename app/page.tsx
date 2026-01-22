import {getHistory} from "@/app/_actions/history";
import {musicBrainzService} from "@/app/_lib/musicbrainz";
import {ReleaseItem} from "@/app/_components/ReleaseItem";
import {HorizontalScroller} from "@/app/_components/HorizontalScroller";
import {auth} from "@/auth";

export default async function Home() {
  const session = await auth();
  const historyReleaseIds = await getHistory(20);

  // Fetch release details for each ID in history
  const historyReleases = await Promise.all(
    historyReleaseIds.map(async (id) => {
      try {
        return await musicBrainzService.getRelease(id);
      } catch (error) {
        console.error(`Failed to fetch release ${id}:`, error);
        return null;
      }
    })
  );

  const validReleases = historyReleases.filter((r): r is any => r !== null && r !== undefined);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Accueil</h1>

      {!session && (
        <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700/50">
          <h2 className="text-xl font-semibold mb-2">Bienvenue sur Brainzrr</h2>
          <p className="text-zinc-400">Connectez-vous pour voir votre historique d'écoute et plus encore.</p>
        </div>
      )}

      {session && validReleases.length > 0 && (
        <HorizontalScroller title="Récemment écoutés">
          {validReleases.map((release: any) => (
            <div key={release.id} className="w-48 flex-shrink-0">
              <ReleaseItem release={release}/>
            </div>
          ))}
        </HorizontalScroller>
      )}

      {session && validReleases.length === 0 && (
        <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700/50">
          <h2 className="text-xl font-semibold mb-2">Aucun historique</h2>
          <p className="text-zinc-400">Commencez à écouter de la musique pour voir votre historique ici !</p>
        </div>
      )}
    </div>
  );
}
