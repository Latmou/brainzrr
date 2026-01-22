import { PrismaClient } from '@prisma/client'
import {PrismaPg} from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

let prismaClient;
if (!globalForPrisma.prisma) {
  const connectionString = `${process.env.DATABASE_URL}`
  const adapter = new PrismaPg({ connectionString })
  prismaClient = new PrismaClient({ adapter })
} else {
  prismaClient = globalForPrisma.prisma
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export const prisma = prismaClient