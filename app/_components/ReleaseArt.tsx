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
  src?: string | null
  className?: string
  fallbackSize?: number
}

export function ReleaseArt({releaseId, title, src, className, fallbackSize = 48}: ReleaseArtProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(src || null)

  useEffect(() => {
    const loadArt = async () => {
      const cachedUrl = await cacheService.get<string>(`release_art_${releaseId}`)
      if (cachedUrl) {
        setCoverUrl(cachedUrl)
      } else {
        const url = await getReleaseArtAction(releaseId)
        const valueToCache = url || 'NOT_FOUND'
        await cacheService.set(`release_art_${releaseId}`, valueToCache)
        setCoverUrl(valueToCache)
      }
    }
    loadArt()
  }, [releaseId])

  return (
    <div className={cn(`bg-zinc-700 ${!coverUrl ? 'animate-pulse' : ''} flex items-center justify-center relative overflow-hidden`, className)}>
      {coverUrl && (
        coverUrl === 'NOT_FOUND' ?
            <Music size={fallbackSize} className="text-zinc-500"/>
            :
            <Image
              src={coverUrl}
              width={200}
              height={200}
              alt={title}
              className="w-full h-full object-cover"
            />
        )}
    </div>
  )
}
