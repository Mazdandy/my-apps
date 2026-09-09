import { db } from '@/lib/db'
import DashboardClient, { type SessionLite } from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const sessions = await db.session.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      sourceType: true,
      docTypes: true,
      testCasesJson: true,
      updatedAt: true,
    },
  })

  const data: SessionLite[] = sessions.map((s) => ({
    ...s,
    updatedAt: s.updatedAt.toISOString(),
  }))

  return <DashboardClient sessions={data} />
}
