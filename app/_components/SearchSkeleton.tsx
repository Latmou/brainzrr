'use client'

import { HorizontalScroller } from './HorizontalScroller'

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      {/* Artists Skeleton */}
      <section>
        <div className="h-8 w-32 bg-zinc-800 rounded mb-4 ml-4 md:ml-0"></div>
        <HorizontalScroller>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-48 flex-shrink-0 bg-zinc-800/40 p-4 rounded-lg">
              <div className="aspect-square mb-4 bg-zinc-700 rounded-full w-full"></div>
              <div className="h-4 bg-zinc-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </HorizontalScroller>
      </section>

      {/* Recordings Skeleton */}
      <section>
        <div className="h-8 w-32 bg-zinc-800 rounded mb-4 ml-4 md:ml-0"></div>
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-1/3 bg-zinc-800 rounded"></div>
                <div className="h-3 w-1/4 bg-zinc-800 rounded"></div>
              </div>
              <div className="h-4 w-10 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Releases Skeleton */}
      <section>
        <div className="h-8 w-32 bg-zinc-800 rounded mb-4 ml-4 md:ml-0"></div>
        <HorizontalScroller>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-48 flex-shrink-0 bg-zinc-800/40 p-4 rounded-lg">
              <div className="aspect-square mb-4 bg-zinc-700 rounded w-full"></div>
              <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </HorizontalScroller>
      </section>
    </div>
  )
}
