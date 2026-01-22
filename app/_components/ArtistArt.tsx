'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { wikipediaService } from '@/app/_lib/wikipedia'
import { cacheService } from '@/app/_lib/cache'
import Image from 'next/image'
import { cn } from '@/app/_lib/utils'

interface ArtistArtProps {
  artistId: string
  artistName: string
  className?: string
  fallbackSize?: number
}

export function ArtistArt({ artistId, artistName, className, fallbackSize = 48 }: ArtistArtProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImage = async () => {
      // Check cache first
      const cached = await cacheService.get<string>(`artist_image_${artistId}`)
      if (cached) {
        setImageUrl(cached === 'NOT_FOUND' ? null : cached)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const url = await wikipediaService.getArtistImage(artistName)
        if (url) {
          setImageUrl(url)
          await cacheService.set(`artist_image_${artistId}`, url)
        } else {
          await cacheService.set(`artist_image_${artistId}`, 'NOT_FOUND')
        }
      } catch (error) {
        console.error('Failed to fetch artist image:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImage()
  }, [artistId, artistName])

  return (
    <div className={cn("bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden relative", className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={artistName}
          fill
          className="object-cover"
        />
      ) : (
        <User size={fallbackSize} className={cn("text-zinc-500", isLoading && "animate-pulse")} />
      )}
    </div>
  )
}
