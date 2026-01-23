"use server"

import {prisma} from "@/app/_lib/prisma";

export const cleanServerCache = async () => {
  await prisma.release.deleteMany()
  await prisma.recording.deleteMany()
}