import {musicBrainzService} from "@/app/_lib/musicbrainz";
import {auth} from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Accueil</h1>

      {!session && (
        <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700/50">
          <h2 className="text-xl font-semibold mb-2">Bienvenue sur Brainzrr</h2>
          <p className="text-zinc-400">Connectez-vous pour voir votre historique d'écoute et plus encore.</p>
        </div>
      )}
    </div>
  );
}
