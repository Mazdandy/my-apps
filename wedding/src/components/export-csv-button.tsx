'use client'

import { useState } from 'react'
import { exportGuestsCsv } from '@/lib/actions/export'

export function ExportCsvButton({ invitationId }: { invitationId: string }) {
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        const fd = new FormData()
        fd.set('invitationId', invitationId)
        const res = await exportGuestsCsv(fd)
        setPending(false)
        if (res.ok) {
          const blob = new Blob([atob(res.data)], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = res.filename
          a.click()
          URL.revokeObjectURL(url)
        }
      }}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
    >
      {pending ? 'Mengekspor...' : 'Export CSV'}
    </button>
  )
}
