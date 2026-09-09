import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import SessionViewer from './SessionViewer'

export const dynamic = 'force-dynamic'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await db.session.findUnique({ where: { id } })
  if (!session) notFound()

  const { title, sourceType, prdText, summary, docTypes, docsJson, updatedAt } =
    session

  let types: string[] = []
  try {
    types = JSON.parse(docTypes)
  } catch {
    /* ignore */
  }

  let docs: Record<string, string> = {}
  try {
    docs = JSON.parse(docsJson || '{}')
  } catch {
    /* ignore */
  }

  return (
    <SessionViewer
      sessionId={id}
      title={title}
      sourceType={sourceType}
      prdText={prdText}
      summary={summary}
      docTypes={types}
      docs={docs}
      updatedAt={updatedAt.toISOString()}
    />
  )
}
