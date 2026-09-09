'use client'

import { useActionState } from 'react'
import {
  createInvitation,
  updateInvitation,
  type InvitationFormState,
} from '@/lib/actions/invitations'
import { Label, Input, Textarea, SubmitButton } from '@/components/form'
import { parseInvitationData, type InvitationData } from '@/lib/invitation-data'

interface Template {
  id: string
  name: string
}

interface InvitationProps {
  id: string
  title: string
  slug: string
  templateId: string
  eventAt: string
  data: string
}

export function InvitationBuilder({
  templates,
  invitation,
}: {
  templates: Template[]
  invitation?: InvitationProps
}) {
  const action = invitation ? updateInvitation : createInvitation
  const [state, formAction, pending] = useActionState<InvitationFormState, FormData>(action, undefined)

  const initial = invitation ? parseInvitationData(invitation.data) : ({} as InvitationData)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = new FormData(e.currentTarget)
    const data = {
      groom: {
        name: (form.get('groomName') as string) || initial.groom?.name || '',
        fullName: (form.get('groomName') as string) || initial.groom?.fullName || '',
        sonOf: (form.get('groomParents') as string) || initial.groom?.sonOf || '',
        instagram: (form.get('groomIg') as string) || initial.groom?.instagram || '',
      },
      bride: {
        name: (form.get('brideName') as string) || initial.bride?.name || '',
        fullName: (form.get('brideName') as string) || initial.bride?.fullName || '',
        daughterOf: (form.get('brideParents') as string) || initial.bride?.daughterOf || '',
        instagram: (form.get('brideIg') as string) || initial.bride?.instagram || '',
      },
      quote: (form.get('quote') as string) || initial.quote || '',
      quoteSource: (form.get('quoteSource') as string) || initial.quoteSource || '',
      event: {
        title: (form.get('eventTitle') as string) || initial.event?.title || 'Rangkaian Acara',
        time: (form.get('eventTime') as string) || initial.event?.time || '',
        venue: (form.get('venue') as string) || initial.event?.venue || '',
        address: (form.get('address') as string) || initial.event?.address || '',
        mapsUrl: (form.get('mapsUrl') as string) || initial.event?.mapsUrl || '',
      },
      story: [1, 2, 3]
        .map((i) => ({
          title: (form.get(`storyTitle${i}`) as string) || initial.story?.[i - 1]?.title || '',
          date: (form.get(`storyDate${i}`) as string) || initial.story?.[i - 1]?.date || '',
          text: (form.get(`storyText${i}`) as string) || initial.story?.[i - 1]?.text || '',
        }))
        .filter((s) => s.title || s.text),
      gift: {
        bankName: (form.get('giftBank1') as string) || initial.gift?.bankName || '',
        accountNumber: (form.get('giftNumber1') as string) || initial.gift?.accountNumber || '',
        accountName: (form.get('giftName1') as string) || initial.gift?.accountName || '',
        address: (form.get('giftAddress') as string) || initial.gift?.address || '',
        accounts: [1, 2, 3]
          .map((i) => ({
            bankName: (form.get(`giftBank${i}`) as string) || '',
            accountNumber: (form.get(`giftNumber${i}`) as string) || '',
            accountName: (form.get(`giftName${i}`) as string) || '',
          }))
          .filter((a) => a.bankName || a.accountNumber || a.accountName),
      },
      dresscode: (form.get('dresscode') as string) || initial.dresscode || '',
      streaming: { url: (form.get('streaming') as string) || initial.streaming?.url || '' },
      gallery: initial.gallery ?? [],
      sections: initial.sections ?? {},
    }
    ;(e.currentTarget.elements.namedItem('data') as HTMLInputElement).value = JSON.stringify(data)
  }

  const defaultEventAt = invitation
    ? new Date(invitation.eventAt).toISOString().slice(0, 16)
    : undefined

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
      {invitation && <input type="hidden" name="id" value={invitation.id} />}
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}

      {/* Basic */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Informasi Dasar</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Undangan</Label>
            <Input id="title" name="title" required placeholder="Raka & Ayu" defaultValue={invitation?.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="templateId">Tema</Label>
            <select
              id="templateId"
              name="templateId"
              required
              defaultValue={invitation?.templateId}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eventAt">Tanggal & Waktu Acara</Label>
            <Input id="eventAt" name="eventAt" type="datetime-local" required defaultValue={defaultEventAt} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="urlSlug">URL Undangan</Label>
            <div className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500">
              <span className="text-stone-400">/{'u/'}</span>
              <input
                id="urlSlug"
                name="urlSlug"
                required
                defaultValue={invitation?.slug}
                placeholder="dandy-nur"
                className="w-full bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none"
              />
            </div>
            <p className="text-xs text-stone-400">Contoh: dandy-nur → /u/dandy-nur</p>
          </div>
        </div>
      </section>

      {/* Couple */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Mempelai</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-stone-700">Pria</h4>
            <div className="space-y-1.5">
              <Label htmlFor="groomName">Nama</Label>
              <Input id="groomName" name="groomName" placeholder="Raka Aditya Pratama" defaultValue={initial.groom?.fullName} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groomParents">Putra dari</Label>
              <Input id="groomParents" name="groomParents" placeholder="Bapak Hendra & Ibu Sri" defaultValue={initial.groom?.sonOf} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groomIg">Instagram</Label>
              <Input id="groomIg" name="groomIg" placeholder="@raka.pratama" defaultValue={initial.groom?.instagram} />
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-stone-700">Wanita</h4>
            <div className="space-y-1.5">
              <Label htmlFor="brideName">Nama</Label>
              <Input id="brideName" name="brideName" placeholder="Ayu Lestari" defaultValue={initial.bride?.fullName} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brideParents">Putri dari</Label>
              <Input id="brideParents" name="brideParents" placeholder="Bapak Bambang & Ibu Dewi" defaultValue={initial.bride?.daughterOf} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brideIg">Instagram</Label>
              <Input id="brideIg" name="brideIg" placeholder="@ayulestari" defaultValue={initial.bride?.instagram} />
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Kutipan</h3>
        <div className="space-y-1.5">
          <Label htmlFor="quote">Teks Kutipan</Label>
          <Textarea id="quote" name="quote" placeholder="Dan di antara tanda-tanda kebesaran-Nya..." rows={2} defaultValue={initial.quote} />
        </div>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="quoteSource">Sumber</Label>
          <Input id="quoteSource" name="quoteSource" placeholder="QS. Ar-Rum: 21" defaultValue={initial.quoteSource} />
        </div>
      </section>

      {/* Event */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Detail Acara</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="eventTitle">Judul Acara</Label>
            <Input id="eventTitle" name="eventTitle" placeholder="Akad & Resepsi" defaultValue={initial.event?.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eventTime">Waktu</Label>
            <Input id="eventTime" name="eventTime" placeholder="09:00 - 14:00 WIB" defaultValue={initial.event?.time} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venue">Tempat</Label>
            <Input id="venue" name="venue" placeholder="The Garden Ballroom" defaultValue={initial.event?.venue} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" placeholder="Jl. Asia Afrika No. 8, Jakarta" defaultValue={initial.event?.address} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mapsUrl">Link Google Maps</Label>
            <Input id="mapsUrl" name="mapsUrl" placeholder="https://maps.google.com/?q=..." defaultValue={initial.event?.mapsUrl} />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Our Story</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <h4 className="text-sm font-medium text-stone-700">Cerita {i}</h4>
              <div className="space-y-1.5">
                <Label htmlFor={`storyTitle${i}`}>Judul</Label>
                <Input id={`storyTitle${i}`} name={`storyTitle${i}`} placeholder="Pertemuan Pertama" defaultValue={initial.story?.[i - 1]?.title} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`storyDate${i}`}>Tanggal</Label>
                <Input id={`storyDate${i}`} name={`storyDate${i}`} placeholder="Juni 2021" defaultValue={initial.story?.[i - 1]?.date} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`storyText${i}`}>Cerita</Label>
                <Textarea id={`storyText${i}`} name={`storyText${i}`} rows={3} placeholder="Kisah singkat..." defaultValue={initial.story?.[i - 1]?.text} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gift */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Tanda Kasih</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => {
            const acc = initial.gift?.accounts?.[i - 1]
            return (
              <div key={i} className="rounded-xl border border-stone-100 p-4">
                <h4 className="mb-3 text-sm font-medium text-stone-700">Rekening / E-Wallet {i}</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`giftBank${i}`}>Bank / E-Wallet</Label>
                    <Input id={`giftBank${i}`} name={`giftBank${i}`} placeholder="BCA / OVO" defaultValue={acc?.bankName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`giftNumber${i}`}>Nomor</Label>
                    <Input id={`giftNumber${i}`} name={`giftNumber${i}`} placeholder="1234567890" defaultValue={acc?.accountNumber} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`giftName${i}`}>Atas Nama</Label>
                    <Input id={`giftName${i}`} name={`giftName${i}`} placeholder="Raka Aditya Pratama" defaultValue={acc?.accountName} />
                  </div>
                </div>
              </div>
            )
          })}
          <div className="space-y-1.5">
            <Label htmlFor="giftAddress">Alamat Hadiah (opsional)</Label>
            <Input id="giftAddress" name="giftAddress" placeholder="Jl. Melati No. 12, Jakarta Selatan" defaultValue={initial.gift?.address} />
          </div>
        </div>
      </section>

      {/* Dress code + streaming */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Tambahan</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dresscode">Dress Code</Label>
            <Input id="dresscode" name="dresscode" placeholder="Formal / Warna Ivory" defaultValue={initial.dresscode} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="streaming">Link Live Streaming</Label>
            <Input id="streaming" name="streaming" placeholder="https://youtube.com/live/..." defaultValue={initial.streaming?.url} />
          </div>
        </div>
      </section>

      <input type="hidden" name="data" id="data-field" />
      <SubmitButton pending={pending}>Simpan Undangan</SubmitButton>
    </form>
  )
}
