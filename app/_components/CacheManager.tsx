'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { cacheService } from '@/app/_lib/cache'

function CacheManagerContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('resetCache') !== null) {
      console.log('Resetting cache...')
      cacheService.clear()
      // Remove resetCache from URL without reloading
      const url = new URL(window.location.href)
      url.searchParams.delete('resetCache')
      window.history.replaceState({}, '', url.toString())
    }
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
