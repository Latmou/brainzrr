export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-800 shadow-2xl shrink-0"/>
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <div className="h-4 w-16 bg-zinc-800 rounded mb-2"></div>
          <div className="h-12 md:h-20 w-3/4 bg-zinc-800 rounded mb-4"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-zinc-800 rounded"></div>
            <div className="h-4 w-4 bg-zinc-800 rounded-full"></div>
            <div className="h-4 w-24 bg-zinc-800 rounded"></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-6 w-16 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="max-w-3xl flex flex-col gap-2">
        <div className="h-4 w-full bg-zinc-800 rounded"></div>
        <div className="h-4 w-full bg-zinc-800 rounded"></div>
        <div className="h-4 w-5/6 bg-zinc-800 rounded"></div>
        <div className="h-4 w-4/6 bg-zinc-800 rounded"></div>
      </div>

      {/* Discography Skeleton */}
      <div className="flex flex-col gap-8">
        <section>
          <div className="h-8 w-32 bg-zinc-800 rounded mb-4"></div>
          <div className="flex overflow-x-auto sm:flex-wrap gap-4 no-scrollbar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-48 aspect-square bg-zinc-800 rounded-lg shrink-0"></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
