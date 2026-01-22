'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Loader2 } from 'lucide-react'
import { registerAction } from '@/app/_actions/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await registerAction({ name, email, password })
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/login?registered=true')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-md bg-zinc-800/50 p-8 rounded-xl border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white text-black p-3 rounded-full mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            Rejoignez Brainzrr dès aujourd'hui
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1" htmlFor="name">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Votre nom"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'S\'inscrire'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-white hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}