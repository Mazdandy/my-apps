'use client'

import { useEffect, useRef, useState } from 'react'

interface Wish {
  id: string
  name: string
  message: string
  createdAt: string
}

export function LiveWishes({ invitationId, initialWishes }: { invitationId: string; initialWishes: Wish[] }) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes)
  const [error, setError] = useState('')
  const seen = useRef(new Set(initialWishes.map((w) => w.id)))

  // Poll every 5s for new wishes (real-time-ish update without page reload)
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/wishes?invitationId=${encodeURIComponent(invitationId)}`)
        if (!res.ok) throw new Error()
        const data = (await res.json()) as { wishes: Wish[] }
        const fresh = data.wishes.filter((w) => !seen.current.has(w.id))
        if (fresh.length > 0) {
          fresh.forEach((w) => seen.current.add(w.id))
          setWishes((prev) => [...fresh, ...prev])
        }
      } catch {
        // silent — keep last known state on transient errors
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [invitationId])

  return (
    <div className="mt-8 space-y-4">
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      {wishes.map((w) => (
        <div key={w.id} className="rounded-2xl border border-stone-100 bg-white p-5">
          <p className="font-semibold text-stone-800">{w.name}</p>
          <p className="mt-1 text-sm text-stone-600">{w.message}</p>
        </div>
      ))}
      {wishes.length === 0 && (
        <p className="text-center text-sm text-stone-400">Belum ada ucapan. Jadilah yang pertama!</p>
      )}
    </div>
  )
}
