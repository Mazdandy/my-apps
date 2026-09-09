'use client'

import { useState } from 'react'

export function RsvpForm({
  invitationId,
  guestName,
  onSubmitted,
}: {
  invitationId: string
  guestName: string
  onSubmitted?: () => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const name = (guestName || form.get('name') || '').toString().trim()
    const note = (form.get('note') || '').toString().trim()
    const payload = {
      invitationId,
      name,
      status: form.get('status'),
      qtyAdult: Number(form.get('qtyAdult')) || 0,
      qtyChild: Number(form.get('qtyChild')) || 0,
      note,
    }

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Gagal mengirim RSVP')

      // Also post a wish so the guest's name + message appear in the live feed
      await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          name,
          message: note
            ? `Terima kasih atas undangannya! ${note}`
            : 'Terima kasih atas undangannya!',
        }),
      })

      setSubmitted(true)
      onSubmitted?.()
    } catch {
      setError('Terjadi kesalahan, coba lagi.')
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-3xl">🎉</div>
        <p className="mt-2 font-semibold text-green-800">Terima kasih!</p>
        <p className="text-sm text-green-700">Konfirmasi kehadiranmu sudah kami terima.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!guestName && (
        <div>
          <label className="mb-1 block text-sm text-stone-600">Nama</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Nama lengkap"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-stone-600">Konfirmasi kehadiran</label>
        <select
          name="status"
          required
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Pilih kehadiran
          </option>
          <option value="YES">Hadir</option>
          <option value="MAYBE">Ragu-ragu</option>
          <option value="NO">Tidak Hadir</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-stone-600">Jumlah dewasa</label>
          <input
            name="qtyAdult"
            type="number"
            min={0}
            defaultValue={1}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-600">Jumlah anak</label>
          <input
            name="qtyChild"
            type="number"
            min={0}
            defaultValue={0}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">Catatan (opsional)</label>
        <textarea
          name="note"
          rows={2}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="Contoh: datang berdua"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        {pending ? 'Mengirim...' : 'Kirim Konfirmasi'}
      </button>
    </form>
  )
}
