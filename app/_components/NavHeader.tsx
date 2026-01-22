'use client'

import Link from 'next/link'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { useSession, signOut } from "next-auth/react"
import { usePathname } from 'next/navigation'
import { cn } from '@/app/_lib/utils'

export function NavHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <header className="h-16 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
      <div className="font-bold text-xl">
        Brainzrr
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-zinc-800/50 py-1.5 px-3 rounded-full border border-white/5">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || ''} 
                  className="w-6 h-6 rounded-full border border-white/10"
                />
              ) : (
                <UserIcon size={16} className="text-zinc-400" />
              )}
              <span className="text-white text-sm font-medium hidden sm:inline">{session.user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-semibold text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-semibold text-sm",
              pathname === '/login' && "text-white"
            )}
          >
            <LogIn size={18} />
            <span>Connexion</span>
          </Link>
        )}
      </div>
    </header>
  )
}
