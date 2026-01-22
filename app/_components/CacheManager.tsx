'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { cacheService } from '@/app/_lib/cache'

function CacheManagerContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkReset = async () => {
      if (searchParams.get('resetCache') !== null) {
        console.log('Resetting cache...')
        await cacheService.clear()
        // Remove resetCache from URL without reloading
        const url = new URL(window.location.href)
        url.searchParams.delete('resetCache')
        window.history.replaceState({}, '', url.toString())
      }
    }
    checkReset()
  }, [searchParams])

  return null
}

export function CacheManager() {
  return (
    <Suspense fallback={null}>
      <CacheManagerContent />
    </Suspense>
  )
}
