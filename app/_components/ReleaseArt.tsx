'use client'

import {Music} from 'lucide-react'
import {useEffect, useState} from 'react'
import {getReleaseArtAction} from '@/app/_actions/musicbrainz'
import {cn} from '@/app/_lib/utils'
import {cacheService} from '@/app/_lib/cache'
import Image from "next/image";

interface ReleaseArtProps {
  releaseId: string
  title: string
  className?: string
  fallbackSize?: number
}

export function ReleaseArt({releaseId, title, className, fallbackSize = 48}: ReleaseArtProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    const cachedUrl = cacheService.get<string>(`release_art_${releaseId}`)
    if (cachedUrl) {
      setCoverUrl(cachedUrl)
    } else {
      getReleaseArtAction(releaseId).then(url => {
        const valueToCache = url || 'NOT_FOUND'
        cacheService.set(`release_art_${releaseId}`, valueToCache)
        setCoverUrl(valueToCache)
      })
    }
  }, [releaseId])

  const actualUrl = coverUrl === 'NOT_FOUND' ? null : coverUrl

  return (
    <div className={cn(`bg-zinc-700 ${!actualUrl ? 'animate-pulse' : ''} flex items-center justify-center relative overflow-hidden`, className)}>
      {actualUrl && (
          actualUrl === 'NOT_FOUND' ?
            <Music size={fallbackSize} className="text-zinc-500"/>
            :
            <Image
              src={actualUrl}
              width={200}
              height={200}
              alt={title}
              className="w-full h-full object-cover"
            />
        )}
    </div>
  )
}
