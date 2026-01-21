import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Accueil</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700/50">
          <h2 className="text-xl font-semibold mb-2">En construction</h2>
          <p className="text-zinc-400">Cette page est actuellement en cours de développement. Revenez bientôt !</p>
        </div>
      </div>
    </div>
  );
}
