'use client'

import { useEffect, useState } from 'react'

export function Countdown({ target }: { target: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const targetDate = new Date(target).getTime()

    function tick() {
      const diff = targetDate - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [target])

  const units = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur"
        >
          <span className="text-2xl font-bold text-white">{String(u.value).padStart(2, '0')}</span>
          <span className="text-xs text-white/70">{u.label}</span>
        </div>
      ))}
    </div>
  )
}
