import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { renderTestCaseMarkdown } from '@/lib/qadocs-generator'
import type { TestCase } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const session = await db.session.findUnique({ where: { id } })
  if (!session) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 })
  }
  return NextResponse.json({ session })
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const exists = await db.session.findUnique({ where: { id }, select: { id: true } })
  if (!exists) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string') data.title = body.title.trim()
  if (typeof body.summary === 'string') data.summary = body.summary
  if (body.docsJson && typeof body.docsJson === 'object')
    data.docsJson = JSON.stringify(body.docsJson)
  if (Array.isArray(body.docTypes)) data.docTypes = JSON.stringify(body.docTypes)
  if (typeof body.prdText === 'string') data.prdText = body.prdText
  if (Array.isArray(body.testCases)) {
    // Validasi ringan bentuk TestCase[], simpan terstruktur
    const cases = body.testCases.filter(
      (c): c is TestCase =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as TestCase).title === 'string' &&
        typeof (c as TestCase).module === 'string'
    )
    data.testCasesJson = JSON.stringify(cases)

    // Sinkronkan markdown Test Case di docsJson dengan struktur terbaru
    const current = await db.session.findUnique({
      where: { id },
      select: { docsJson: true, title: true },
    })
    if (current) {
      let docs: Record<string, string> = {}
      try {
        docs = JSON.parse(current.docsJson || '{}')
      } catch {
        /* ignore */
      }
      docs.testcase = renderTestCaseMarkdown({
        title: `Test Case — ${current.title}`,
        cases,
      })
      data.docsJson = JSON.stringify(docs)
    }
  }

  const session = await db.session.update({
    where: { id },
    data,
  })
  return NextResponse.json({ session })
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const exists = await db.session.findUnique({ where: { id }, select: { id: true } })
  if (!exists) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 })
  }
  await db.session.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
