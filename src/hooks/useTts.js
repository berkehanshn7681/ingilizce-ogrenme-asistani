import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hafif metin-okuma (TTS) kancası — "Dinleme" adımı için.
 * İngilizce (tercihen erkek, yavaş) bir sesle metni okur.
 *
 * return: { speak, stop, speaking, supported }
 */
export function useTts() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const voicesRef = useRef([])

  useEffect(() => {
    if (!supported) return
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      try {
        window.speechSynthesis.cancel()
      } catch {
        /* yoksay */
      }
    }
  }, [supported])

  const pickVoice = useCallback(() => {
    const voices = voicesRef.current || []
    const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'))
    const maleRe = /male|david|george|daniel|alex|fred|james|arthur|ryan|mark|guy/i
    return (
      en.find((v) => v.lang.toLowerCase() === 'en-gb' && maleRe.test(v.name)) ||
      en.find((v) => maleRe.test(v.name)) ||
      en.find((v) => v.lang.toLowerCase() === 'en-gb') ||
      en.find((v) => v.lang.toLowerCase() === 'en-us') ||
      en[0] ||
      null
    )
  }, [])

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-GB'
      utter.rate = 0.9
      utter.pitch = 0.95
      const voice = pickVoice()
      if (voice) utter.voice = voice
      utter.onstart = () => setSpeaking(true)
      utter.onend = () => setSpeaking(false)
      utter.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utter)
    },
    [supported, pickVoice]
  )

  const stop = useCallback(() => {
    if (!supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* yoksay */
    }
    setSpeaking(false)
  }, [supported])

  return { speak, stop, speaking, supported }
}
