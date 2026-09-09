'use client'

import { useState } from 'react'

export function WishForm({ invitationId }: { invitationId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = {
      invitationId,
      name: form.get('name'),
      message: form.get('message'),
    }

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Gagal mengirim ucapan')
      setSubmitted(true)
    } catch {
      setError('Terjadi kesalahan, coba lagi.')
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <p className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center text-sm font-semibold text-green-800">
        Ucapanmu terkirim. Terima kasih! 💐
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-stone-600">Nama</label>
        <input
          name="name"
          required
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="Nama kamu"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">Ucapan & Doa</label>
        <textarea
          name="message"
          required
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="Tulis doa dan harapan terbaikmu..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-stone-900 py-2.5 font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? 'Mengirim...' : 'Kirim Ucapan'}
      </button>
    </form>
  )
}
