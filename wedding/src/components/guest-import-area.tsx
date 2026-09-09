'use client'

import { useState } from 'react'
import { ContactImportButton } from '@/components/contact-import-button'

export function GuestImportArea({ groupDefault }: { groupDefault?: string }) {
  const [text, setText] = useState('')

  function handleContactImport(lines: string[]) {
    setText((prev) => {
      const combined = prev.trim() ? `${prev.trim()}\n${lines.join('\n')}` : lines.join('\n')
      return combined
    })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1.5 sm:col-span-2">
        <div className="flex items-center justify-between">
          <label htmlFor="names" className="block text-sm font-medium text-stone-700">
            Nama (satu per baris, opsional format: Nama | no.HP)
          </label>
          <ContactImportButton onImported={handleContactImport} />
        </div>
        <textarea
          id="names"
          name="names"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Bapak Budi & Ibu Ani | 08123456789\nSdr. Joko | 08129876543\nSdri. Rina'}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="importGroup" className="block text-sm font-medium text-stone-700">
          Grup (opsional)
        </label>
        <input
          id="importGroup"
          name="group"
          defaultValue={groupDefault}
          placeholder="Teman Groom"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
      </div>
    </div>
  )
}
