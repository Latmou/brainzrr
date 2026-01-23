'use client'

import { useState, useEffect } from 'react'
import { cacheService } from '@/app/_lib/cache'
import {Trash2, RefreshCw, HardDrive, Loader2} from 'lucide-react'
import {cleanServerCache} from "@/app/_actions/settings";

export function CacheUsage() {
  const [serverCacheLoading, setServerCacheLoading] = useState<boolean>(false)
  const [stats, setStats] = useState({
    count: 0,
    size: 0,
    storageLimit: 0
  })

  const updateStats = async () => {
    if (typeof window === 'undefined') return

    const keys = await cacheService.getAllKeys()
    const size = await cacheService.getSize()

    setStats({
      count: keys.length,
      size,
      storageLimit: 100 * 1024 * 1024 // IndexedDB limit is much larger, let's show 100MB as a reference
    })
  }

  useEffect(() => {
    updateStats()
  }, [])

  const handleClearCache = async () => {
    if (confirm('Voulez-vous vraiment vider tout le cache ?')) {
      await cacheService.clear()
      updateStats()
      window.location.reload()
    }
  }

  const handleClearCacheServer = async () => {
    if (confirm('Voulez-vous vraiment vider tout le cache ?')) {
      setServerCacheLoading(true)
      await cleanServerCache()
      setServerCacheLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const percentage = Math.min(100, (stats.size / (stats.storageLimit || 1)) * 100)

  return (
    <div className="bg-zinc-800/40 p-6 rounded-lg border border-white/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-zinc-700 rounded-full">
          <HardDrive size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Utilisation du cache (IndexedDB)</h2>
          <p className="text-sm text-zinc-400">Gérez vos données locales stockées dans le navigateur.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-8">
        <div className="bg-zinc-900/50 p-4 rounded-lg flex-1 min-w-50">
          <div className="text-zinc-400 text-sm mb-1">Éléments mis en cache</div>
          <div className="text-3xl font-bold">{stats.count}</div>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-lg flex-1 min-w-50">
          <div className="text-zinc-400 text-sm mb-1">Taille estimée</div>
          <div className="text-3xl font-bold">{formatSize(stats.size)}</div>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Espace utilisé (indicatif)</span>
          <span className="text-white font-medium">{percentage.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-500 italic">
          * Basé sur une estimation de 100MB pour la barre de progression. IndexedDB peut stocker beaucoup plus.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleClearCacheServer}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-full transition-colors font-medium text-sm"
        >
          {serverCacheLoading ? <Loader2 size={16} className="text-white animate-spin" /> : <Trash2 size={16} />}

          Vider le cache serveur
        </button>
        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-full transition-colors font-medium text-sm"
        >
          <Trash2 size={16} />
          Vider le cache
        </button>
        <button
          onClick={updateStats}
          className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-full transition-colors font-medium text-sm"
        >
          <RefreshCw size={16} />
          Rafraîchir
        </button>
      </div>
    </div>
  )
}
