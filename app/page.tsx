import {getHistory} from "@/app/_actions/history";
import {musicBrainzService} from "@/app/_lib/musicbrainz";
import {ReleaseItem} from "@/app/_components/ReleaseItem";
import {auth} from "@/auth";

export default async function Home() {
  const session = await auth();
  const historyReleaseIds = await getHistory();

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
        <section>
          <h2 className="text-2xl font-bold mb-4">Récemment écoutés</h2>
          <div className="flex flex-wrap gap-4  items-center">
            {validReleases.map((release: any) => (
              <ReleaseItem release={release} key={release.id}/>
            ))}
          </div>
        </section>
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
