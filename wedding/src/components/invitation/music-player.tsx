'use client'

import { useEffect, useRef, useState } from 'react'

export function MusicPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = true
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [src])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Jeda musik' : 'Putar musik'}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl text-rose-600 shadow-lg backdrop-blur hover:bg-white"
    >
      {playing ? '⏸' : '♪'}
    </button>
  )
}
