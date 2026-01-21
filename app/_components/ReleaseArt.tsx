'use client'

import { Music } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getReleaseArtAction } from '@/app/_actions/musicbrainz'
import { cn } from '@/app/_lib/utils'

interface ReleaseArtProps {
  releaseId: string
  title: string
  className?: string
  fallbackSize?: number
}

export function ReleaseArt({ releaseId, title, className, fallbackSize = 48 }: ReleaseArtProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    const cachedUrl = localStorage.getItem(`release_art_${releaseId}`)
    if (cachedUrl) {
      setCoverUrl(cachedUrl)
    } else {
      getReleaseArtAction(releaseId).then(url => {
        if (url) {
          localStorage.setItem(`release_art_${releaseId}`, url)
        }
        setCoverUrl(url || 'NOT_FOUND')
      })
    }
  }, [releaseId])

  const actualUrl = coverUrl === 'NOT_FOUND' ? null : coverUrl

  return (
    <div className={cn("bg-zinc-700 flex items-center justify-center relative overflow-hidden", className)}>
      {actualUrl ? (
        <img 
          src={actualUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <Music size={fallbackSize} className="text-zinc-500" />
      )}
    </div>
  )
}
