'use client'

import { cn } from "@/app/_lib/utils"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white flex items-center justify-center h-screen font-sans">
        <div className="text-center p-8 bg-zinc-900 rounded-xl border border-white/10 shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Quelque chose s'est mal passé !</h2>
          <p className="text-zinc-400 mb-8">Une erreur globale est survenue dans l'application.</p>
          <button
            onClick={() => reset()}
            className={cn(
                "bg-white text-black font-bold py-3 px-8 rounded-lg",
                "hover:scale-105 active:scale-95 transition-all"
            )}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
