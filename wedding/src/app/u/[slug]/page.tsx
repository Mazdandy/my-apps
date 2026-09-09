import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { parseInvitationData } from '@/lib/invitation-data'
import { resolveInvitationBySlug } from '@/lib/resolve-invitation'
import { Countdown } from '@/components/invitation/countdown'
import { MusicPlayer } from '@/components/invitation/music-player'
import { RsvpForm } from '@/components/invitation/rsvp-form'
import { WishForm } from '@/components/invitation/wish-form'
import { LiveWishes } from '@/components/invitation/live-wishes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string; g?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const invitation = await resolveInvitationBySlug(slug)

  if (!invitation) return { title: 'Undangan Tidak Ditemukan' }

  const data = parseInvitationData(invitation.data)
  const guestName = sp.to || ''
  const title = `${invitation.title} — Undangan Pernikahan`

  return {
    title,
    description: `Kami mengundang Anda dalam acara pernikahan ${invitation.title}. ${guestName ? `Kepada ${guestName}, ` : ''}${data.event?.date ?? ''} ${data.event?.venue ?? ''}`,
    openGraph: {
      title,
      description: `${data.event?.date ?? ''} • ${data.event?.venue ?? ''}`,
    },
  }
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const guestToken = sp.g

  const invitation = await resolveInvitationBySlug(slug)

  if (!invitation) notFound()

  // Alias (old URL) → redirect to the new canonical URL, preserving query params
  if ('__redirectTo' in invitation && invitation.__redirectTo) {
    const qs = new URLSearchParams()
    if (sp.to) qs.set('to', sp.to)
    if (sp.g) qs.set('g', sp.g)
    const q = qs.toString()
    redirect(`${invitation.__redirectTo}${q ? `?${q}` : ''}`)
  }

  const invitationRow = await db.invitation.findUnique({
    where: { id: invitation.id },
    include: {
      wishes: { where: { status: 'VISIBLE' }, orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })

  if (!invitationRow) notFound()

  const data = parseInvitationData(invitationRow.data)
  const sections = data.sections ?? {}
  const event = data.event ?? {}

  // Resolve guest name: from ?to=, or look up by token
  let guestName = sp.to || ''
  if (!guestName && guestToken) {
    const guest = await db.guest.findUnique({ where: { token: guestToken } })
    guestName = guest?.name ?? ''
    if (guest && !guest.openedAt) {
      await db.guest.update({ where: { id: guest.id }, data: { openedAt: new Date() } })
    }
  }

  const groom = data.groom
  const bride = data.bride

  return (
    <main className="min-h-screen bg-[#faf7f2] font-serif">
      {invitationRow.musicUrl && <MusicPlayer src={invitationRow.musicUrl} />}

      {/* Cover */}
      <section
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center text-center"
        style={
          invitationRow.coverMedia
            ? { backgroundImage: `url(${invitationRow.coverMedia})` }
            : { backgroundImage: 'linear-gradient(135deg, #f8e3e3 0%, #f3e5d8 50%, #e8ddd0 100%)' }
        }
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <p className="text-sm tracking-[0.3em] text-white/90">THE WEDDING OF</p>
          <h1 className="mt-4 text-5xl font-bold text-white drop-shadow-lg sm:text-6xl">
            {groom?.name} &amp; {bride?.name}
          </h1>
          <p className="mt-4 text-lg text-white/90">{event.date}</p>
          {guestName && (
            <p className="mt-8 text-sm text-white/80">
              Kepada Bapak/Ibu/Saudara/i
              <br />
              <span className="mt-1 inline-block rounded-full bg-white/20 px-6 py-2 text-lg font-semibold text-white backdrop-blur">
                {guestName}
              </span>
            </p>
          )}
          <p className="mt-6 text-xs uppercase tracking-widest text-white/70">
            Tanpa mengurangi rasa hormat, kami mengundang Anda
          </p>
        </div>
      </section>

      {/* Countdown */}
      <section className="bg-gradient-to-b from-[#f8e3e3] to-[#faf7f2] py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-stone-800">Menuju Hari Bahagia</h2>
          <div className="mt-8">
            <Countdown target={invitationRow.eventAt.toISOString()} />
          </div>
        </div>
      </section>

      {/* Quote */}
      {data.quote && (
        <section className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="text-2xl leading-relaxed text-stone-700">&ldquo;{data.quote}&rdquo;</p>
          {data.quoteSource && (
            <p className="mt-4 text-sm font-semibold text-rose-600">{data.quoteSource}</p>
          )}
        </section>
      )}

      {/* Couple */}
      {(groom || bride) && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-semibold text-stone-800">Mempelai</h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              {groom && (
                <div>
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-rose-100">
                    <span className="text-4xl">🤵</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-stone-800">{groom.fullName ?? groom.name}</h3>
                  {groom.sonOf && <p className="mt-2 text-sm text-stone-500">{groom.sonOf}</p>}
                  {groom.instagram && (
                    <p className="mt-1 text-sm text-rose-500">{groom.instagram}</p>
                  )}
                </div>
              )}
              {bride && (
                <div>
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-rose-100">
                    <span className="text-4xl">👰</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-stone-800">{bride.fullName ?? bride.name}</h3>
                  {bride.daughterOf && <p className="mt-2 text-sm text-stone-500">{bride.daughterOf}</p>}
                  {bride.instagram && (
                    <p className="mt-1 text-sm text-rose-500">{bride.instagram}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Event details */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-stone-800">{event.title ?? 'Rangkaian Acara'}</h2>
        <div className="mt-8 space-y-2 text-stone-600">
          <p className="text-lg font-semibold text-stone-800">{event.date}</p>
          <p>{event.time}</p>
          <p className="font-medium text-stone-700">{event.venue}</p>
          <p className="text-sm">{event.address}</p>
        </div>
        {sections.maps !== false && event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-rose-500 px-8 py-3 font-sans text-sm font-semibold text-white hover:bg-rose-600"
          >
            Buka Google Maps
          </a>
        )}
      </section>

      {/* Story */}
      {sections.story !== false && data.story && data.story.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-center text-3xl font-semibold text-stone-800">Our Story</h2>
            <div className="mt-10 space-y-8">
              {data.story.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                      {i + 1}
                    </span>
                    {i < (data.story?.length ?? 0) - 1 && <span className="mt-2 w-px flex-1 bg-stone-200" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-stone-800">{s.title}</h3>
                    {s.date && <p className="text-sm text-rose-500">{s.date}</p>}
                    <p className="mt-1 text-sm text-stone-600">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {sections.gallery !== false && data.gallery && data.gallery.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-3xl font-semibold text-stone-800">Galeri</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.gallery.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                <img src={src} alt={`Galeri ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RSVP */}
      <section id="rsvp" className="bg-gradient-to-b from-white to-[#faf7f2] py-16">
        <div className="mx-auto max-w-lg px-6">
          <h2 className="text-center text-3xl font-semibold text-stone-800">Konfirmasi Kehadiran</h2>
          <p className="mt-2 text-center text-sm text-stone-500">
            Mohon konfirmasi kehadiran sebelum {event.date}
          </p>
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <RsvpForm invitationId={invitationRow.id} guestName={guestName} />
          </div>
        </div>
      </section>

      {/* Wishes */}
      <section id="wishes" className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold text-stone-800">Ucapan &amp; Doa</h2>
        <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <WishForm invitationId={invitationRow.id} />
        </div>
        <LiveWishes
          invitationId={invitationRow.id}
          initialWishes={invitationRow.wishes.map((w) => ({
            id: w.id,
            name: w.name,
            message: w.message,
            createdAt: w.createdAt.toISOString(),
          }))}
        />
      </section>

      {/* Gift */}
      {sections.gift !== false && data.gift && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-lg px-6 text-center">
            <h2 className="text-3xl font-semibold text-stone-800">Tanda Kasih</h2>
            <p className="mt-2 text-sm text-stone-500">
              Doa restu Anda adalah hadiah terbaik. Namun jika ingin memberi tanda kasih:
            </p>
            <div className="mt-6 space-y-4">
              {data.gift.accounts && data.gift.accounts.length > 0 ? (
                data.gift.accounts.map((acc, i) => (
                  <div key={i} className="rounded-2xl border border-stone-200 p-6">
                    {acc.bankName && (
                      <p className="text-sm text-stone-500">{acc.bankName}</p>
                    )}
                    <p className="mt-1 text-xl font-bold tracking-wider text-stone-800">
                      {acc.accountNumber}
                    </p>
                    {acc.accountName && (
                      <p className="mt-1 text-sm font-medium text-stone-600">{acc.accountName}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-stone-200 p-6">
                  {data.gift.bankName && (
                    <p className="text-sm text-stone-500">{data.gift.bankName}</p>
                  )}
                  <p className="mt-1 text-xl font-bold tracking-wider text-stone-800">
                    {data.gift.accountNumber}
                  </p>
                  {data.gift.accountName && (
                    <p className="mt-1 text-sm font-medium text-stone-600">{data.gift.accountName}</p>
                  )}
                </div>
              )}
              {data.gift.address && (
                <p className="text-sm text-stone-500">{data.gift.address}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Dress code */}
      {sections.dresscode !== false && data.dresscode && (
        <section className="mx-auto max-w-lg px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold text-stone-800">Dress Code</h2>
          <p className="mt-4 text-stone-600">{data.dresscode}</p>
        </section>
      )}

      {/* Streaming */}
      {sections.streaming !== false && data.streaming?.url && (
        <section className="mx-auto max-w-lg px-6 pb-16 text-center">
          <h2 className="text-3xl font-semibold text-stone-800">Live Streaming</h2>
          <p className="mt-2 text-sm text-stone-500">Tidak bisa hadir? Saksikan secara langsung.</p>
          <a
            href={data.streaming.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-stone-900 px-8 py-3 font-sans text-sm font-semibold text-white hover:bg-stone-800"
          >
            Tonton Live
          </a>
        </section>
      )}

      {/* Share */}
      <section className="mx-auto max-w-lg px-6 pb-16 text-center">
        <h2 className="text-3xl font-semibold text-stone-800">Sebarkan Undangan</h2>
        <p className="mt-2 text-sm text-stone-500">Bagikan momen bahagia ini kepada keluarga dan sahabat.</p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Kami mengundang Anda ke pernikahan ${groom?.name} & ${bride?.name} • ${event.date}\n${process.env.APP_URL || 'http://localhost:3000'}/u/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-green-600 px-8 py-3 font-sans text-sm font-semibold text-white hover:bg-green-700"
        >
          Bagikan via WhatsApp
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-[#f8e3e3] py-12 text-center">
        <p className="text-lg font-semibold text-stone-800">
          {groom?.name} &amp; {bride?.name}
        </p>
        <p className="mt-1 text-sm text-stone-500">{event.date}</p>
        <p className="mt-6 text-xs text-stone-400">
          Dibuat dengan <span className="text-rose-500">♥</span> menggunakan FAAS
        </p>
      </footer>
    </main>
  )
}
