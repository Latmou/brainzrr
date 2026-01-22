import {Loader2} from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded bg-zinc-800 shadow-2xl flex-shrink-0"/>
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <div className="h-10 md:h-16 w-3/4 bg-zinc-800 rounded mt-2"></div>
          <div className="h-4 w-32 bg-zinc-800 rounded mt-4 mb-6"></div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
             <div className="h-4 w-24 bg-zinc-800 rounded"></div>
             <div className="h-4 w-4 bg-zinc-800 rounded-full"></div>
             <div className="h-4 w-24 bg-zinc-800 rounded"></div>
             <div className="h-4 w-4 bg-zinc-800 rounded-full"></div>
             <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>

      {/* Tracklist Skeleton */}
      <section>
        <div className="h-10 w-full border-b border-white/10 mb-4"></div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex items-center gap-4 h-12">
               <div className="w-4 h-4 bg-zinc-800 rounded"></div>
               <div className="flex-1 h-6 bg-zinc-800 rounded"></div>
               <div className="w-12 h-4 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
