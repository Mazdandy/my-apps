import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import TestCaseManager from './TestCaseManager'
import type { TestCase } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function TestCaseManagerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await db.session.findUnique({
    where: { id },
    select: { id: true, title: true, testCasesJson: true, prdText: true },
  })
  if (!session) notFound()

  let cases: TestCase[] = []
  try {
    const parsed = JSON.parse(session.testCasesJson || '[]')
    if (Array.isArray(parsed)) cases = parsed as TestCase[]
  } catch {
    /* ignore */
  }

  return (
    <TestCaseManager
      sessionId={session.id}
      sessionTitle={session.title}
      initialCases={cases}
      prdText={session.prdText}
    />
  )
}
