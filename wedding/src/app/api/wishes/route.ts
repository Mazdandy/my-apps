import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const querySchema = z.object({
  invitationId: z.string(),
})

const bodySchema = z.object({
  invitationId: z.string(),
  name: z.string().trim().min(2).max(100),
  message: z.string().trim().min(2).max(1000),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    invitationId: searchParams.get('invitationId'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const wishes = await db.wish.findMany({
    where: { invitationId: parsed.data.invitationId, status: 'VISIBLE' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    wishes: wishes.map((w) => ({
      id: w.id,
      name: w.name,
      message: w.message,
      createdAt: w.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    const invitation = await db.invitation.findUnique({
      where: { id: parsed.data.invitationId },
    })
    if (!invitation) {
      return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })
    }

    await db.wish.create({
      data: {
        invitationId: parsed.data.invitationId,
        name: parsed.data.name,
        message: parsed.data.message,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
