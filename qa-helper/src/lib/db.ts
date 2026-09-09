import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'node:path'

const url =
  process.env.DATABASE_URL?.startsWith('file:')
    ? path.join(/* turbopackIgnore: true */ process.cwd(), process.env.DATABASE_URL.slice('file:'.length))
    : process.env.DATABASE_URL || 'file:./dev.db'

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
