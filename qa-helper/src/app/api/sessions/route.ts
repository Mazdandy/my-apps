import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { SourceType } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET() {
  const sessions = await db.session.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      sourceType: true,
      docTypes: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return NextResponse.json({ sessions })
}

export async function POST(req: Request) {
  let body: {
    title?: string
    sourceType?: SourceType
    prdText?: string
    summary?: string
    docTypes?: string
    docsJson?: string
    testCases?: unknown[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Body request tidak valid.' },
      { status: 400 }
    )
  }

  const title = (body.title || '').trim()
  const prdText = (body.prdText || '').trim()
  if (!title || !prdText) {
    return NextResponse.json(
      { error: 'Judul dan teks PRD wajib diisi.' },
      { status: 400 }
    )
  }

  const sourceType: SourceType = body.sourceType === 'upload' ? 'upload' : 'paste'
  const docTypes = Array.isArray(body.docTypes) ? JSON.stringify(body.docTypes) : '[]'
  const docsJson =
    body.docsJson && typeof body.docsJson === 'object'
      ? JSON.stringify(body.docsJson)
      : '{}'
  const testCasesJson = Array.isArray(body.testCases)
    ? JSON.stringify(body.testCases)
    : '[]'
  const summary = body.summary || ''

  const session = await db.session.create({
    data: {
      title,
      sourceType,
      prdText,
      summary,
      docTypes,
      docsJson,
      testCasesJson,
    },
  })
  return NextResponse.json({ session }, { status: 201 })
}
