import { CacheUsage } from '@/app/_components/CacheUsage'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      <div className="flex items-center gap-4 mb-2">
        <SettingsIcon size={32} className="text-white" />
        <h1 className="text-3xl md:text-5xl font-black">Paramètres</h1>
      </div>

      <div className="max-w-4xl">
        <CacheUsage />
      </div>
      
      <div className="mt-8 text-zinc-500 text-sm">
        <p>Version 0.1.0</p>
        <p>© 2026 Brainzrr - Powered by MusicBrainz & YouTube</p>
      </div>
    </div>
  )
}
