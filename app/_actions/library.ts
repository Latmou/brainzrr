'use server'

import { prisma } from '@/app/_lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getLibrary(query: string = '') {
  try {
    const artists = await prisma.artist.findMany({
      where: {
        name: { contains: query }
      }
    })
    return { artists }
  } catch (error) {
    console.error('Failed to fetch library:', error)
    throw new Error('Failed to fetch library')
  }
}

export async function addToLibrary(data: {
  type: 'artist'
  mbid: string
  name: string
}) {
  const { type, mbid, name } = data

  try {
    if (type === 'artist') {
      const artist = await prisma.artist.upsert({
        where: { mbid },
        update: { name },
        create: { mbid, name }
      })
      revalidatePath('/library')
      return artist
    }
    throw new Error('Invalid type')
  } catch (error) {
    console.error('Failed to save to library:', error)
    throw new Error('Failed to save to library')
  }
}
