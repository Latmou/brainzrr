'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/app/_lib/utils'

interface HorizontalScrollerProps {
  title?: string
  children: React.ReactNode
  className?: string
  containerClassName?: string
}

export function HorizontalScroller({ title, children, className, containerClassName }: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [children])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className={cn("relative group/scroller", className)}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      
      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full hidden lg:group-hover/scroller:flex sm:group-hover/scroller:hidden items-center justify-center transition-all -ml-4"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={cn("flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth", containerClassName)}
        >
          {children}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full hidden lg:group-hover/scroller:flex sm:group-hover/scroller:hidden items-center justify-center transition-all -mr-4"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  )
}
