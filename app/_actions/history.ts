'use server'

import { auth } from "@/auth"
import { prisma } from "@/app/_lib/prisma"

export async function addToHistory(recordingId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  try {
    // We only keep the most recent play in history if it's the same track?
    // The requirement says "add the history group by release", usually means we want all plays or at least distinct ones.
    // Let's just add a new entry.
    await prisma.history.create({
      data: {
        userId: session.user.id,
        recordingId: recordingId,
      }
    })
  } catch (error) {
    console.error('Error adding to history:', error)
  }
}

export async function getHistory() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const history = await prisma.history.findMany({
      where: { userId: session.user.id },
      include: {
        recording: {
          select: {
            releaseId: true
          }
        }
      },
      orderBy: { playedAt: 'desc' },
      take: 50
    })

    // Group by releaseId and return unique releases
    const releaseIds = new Set<string>()
    const uniqueReleases: string[] = []

    for (const item of history) {
      if (item.recording.releaseId && !releaseIds.has(item.recording.releaseId)) {
        releaseIds.add(item.recording.releaseId)
        uniqueReleases.push(item.recording.releaseId)
      }
    }

    return uniqueReleases
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  }
}
