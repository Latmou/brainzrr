'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { cn } from '@/app/_lib/utils'

interface SliderProps {
  value: number // 0 to 1
  onChange: (value: number) => void
  className?: string
  activeColor?: string
  trackColor?: string
  thumbSize?: string
  thumbOnHoverOnly?: boolean
}

export function Slider({ 
  value, 
  onChange, 
  className, 
  activeColor = "bg-green-500",
  trackColor = "bg-zinc-800",
  thumbSize = "w-2 h-2",
  thumbOnHoverOnly = true
}: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleUpdate = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    onChange(percentage)
  }, [onChange])

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleUpdate(e.clientX)

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleUpdate(moveEvent.clientX)
    }

    const onMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Handle touch events
  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    handleUpdate(e.touches[0].clientX)

    const onTouchMove = (moveEvent: TouchEvent) => {
      handleUpdate(moveEvent.touches[0].clientX)
    }

    const onTouchEnd = () => {
      setIsDragging(false)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }

    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)
  }

  return (
    <div 
      ref={containerRef}
      className={cn("h-1 flex-1 rounded-full group cursor-pointer relative", trackColor, className)}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div 
        className={cn("h-full rounded-full relative transition-colors", activeColor)} 
        style={{ width: `${value * 100}%` }}
      >
        <div className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md translate-x-1/2 transition-opacity",
          thumbSize,
          isDragging ? "opacity-100" : (thumbOnHoverOnly ? "opacity-0 group-hover:opacity-100" : "opacity-100")
        )} />
      </div>
    </div>
  )
}
