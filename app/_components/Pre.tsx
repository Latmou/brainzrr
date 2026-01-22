'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface PreProps {
  data: any
  label?: string
}

export function Pre({ data, label = "Voir le json" }: PreProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {label}
      </button>

      {isOpen && (
        <pre className="mt-4 p-4 bg-black/50 rounded-lg overflow-x-auto text-xs text-zinc-300 border border-white/5">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
