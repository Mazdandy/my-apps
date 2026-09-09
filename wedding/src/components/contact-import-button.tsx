'use client'

import { useState } from 'react'

interface Contact {
  name: string
  tel: string[]
}

declare global {
  interface Navigator {
    contacts?: (selectProperties: string[], options?: { multiple?: boolean }) => Promise<Contact[]>
  }
}

export function ContactImportButton({
  onImported,
}: {
  onImported: (lines: string[]) => void
}) {
  const [pending, setPending] = useState(false)
  const [unsupported, setUnsupported] = useState(false)

  async function handleClick() {
    if (!('contacts' in navigator) || !navigator.contacts) {
      setUnsupported(true)
      return
    }

    try {
      setPending(true)
      const contacts = await navigator.contacts(['name', 'tel'], { multiple: true })
      const lines = contacts
        .filter((c) => c.name && c.tel && c.tel.length > 0)
        .map((c) => `${c.name} | ${c.tel[0]}`)
      if (lines.length > 0) onImported(lines)
    } catch {
      // user cancelled or error — do nothing
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        {pending ? 'Membuka kontak...' : 'Pilih dari Kontak HP'}
      </button>
      {unsupported && (
        <p className="mt-2 text-xs text-amber-600">
          Fitur ini hanya tersedia di browser mobile. Gunakan opsi &quot;tulis manual&quot; di bawah.
        </p>
      )}
    </div>
  )
}
