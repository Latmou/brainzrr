'use client'

import Link from 'next/link'
import { Home, Search, Library, PlusCircle, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/app/_lib/utils'

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Accueil', href: '/' },
    { icon: Search, label: 'Rechercher', href: '/search' },
    { icon: Library, label: 'Bibliothèque', href: '/library' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ]

  return (
    <div className={cn("w-full lg:w-64 bg-black lg:h-full flex flex-row lg:flex-col gap-2 p-2 text-zinc-400", className)}>
      <div className="bg-zinc-900 rounded-lg p-2 lg:p-4 flex flex-row lg:flex-col gap-4 flex-1 lg:flex-none justify-around lg:justify-start">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex max-lg:flex-col items-center lg:gap-4 hover:text-white transition-colors font-semibold",
              pathname === item.href && "text-white"
            )}
          >
            <item.icon size={24} />
            <span className="inline max-lg:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="bg-zinc-900 rounded-lg p-4 flex-1 hidden lg:flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 hover:text-white transition-colors font-semibold">
            <Library size={24} />
            Votre bibliothèque
          </div>
          <button className="hover:text-white transition-colors">
            <PlusCircle size={20} />
          </button>
        </div>
        <div className="overflow-y-auto">
          {/* Liste des artistes enregistrés viendra ici */}
          <div className="text-sm py-2">Vos artistes s'afficheront ici.</div>
        </div>
      </div>
    </div>
  )
}
