export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg bg-zinc-800 shadow-2xl shrink-0"/>
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <div className="h-4 w-16 bg-zinc-800 rounded mb-2"></div>
          <div className="h-12 md:h-20 w-3/4 bg-zinc-800 rounded mb-4"></div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-zinc-800 rounded"></div>
            <div className="h-4 w-24 bg-zinc-800 rounded"></div>
            <div className="h-4 w-24 bg-zinc-800 rounded"></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-6 w-16 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Releases Skeleton */}
      <div className="flex flex-col gap-8 mt-8">
        <section>
          <div className="h-8 w-32 bg-zinc-800 rounded mb-4"></div>
          <div className="flex overflow-x-auto gap-4 no-scrollbar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-48 aspect-square bg-zinc-800 rounded-lg shrink-0"></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
