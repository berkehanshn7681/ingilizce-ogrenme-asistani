import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hafif, tek seferlik konuşma tanıma (STT) kancası — Web Speech API.
 *
 * Ye Ruhe modülünden bağımsızdır (VAD/otomatik döngü içermez). "Üniteler →
 * Konuşma" adımı gibi tek atışlık dikte için tasarlanmıştır: `start()` dinlemeye
 * başlar, konuşma bitince tarayıcı otomatik durur (continuous=false) ve
 * `transcript` doldurulur.
 *
 * return: { supported, listening, transcript, error, start, stop, reset }
 */
export function useSpeechRecognition({ lang = 'en-US' } = {}) {
  const SR =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null
  const supported = Boolean(SR)

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recRef = useRef(null)
  const finalRef = useRef('')

  const stop = useCallback(() => {
    try {
      recRef.current?.stop()
    } catch {
      /* yoksay */
    }
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setError(null)
    finalRef.current = ''
  }, [])

  const start = useCallback(() => {
    if (!supported) {
      setError('unsupported')
      return
    }
    // Önceki oturumu kapat
    try {
      recRef.current?.abort()
    } catch {
      /* yoksay */
    }
    setError(null)
    setTranscript('')
    finalRef.current = ''

    const rec = new SR()
    recRef.current = rec
    rec.lang = lang
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1

    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript
        if (event.results[i].isFinal) finalRef.current += chunk
        else interim += chunk
      }
      setTranscript((finalRef.current + ' ' + interim).trim())
    }
    rec.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('mic-denied')
      } else if (event.error === 'no-speech') {
        setError('no-speech')
      } else {
        setError(event.error || 'error')
      }
    }
    rec.onend = () => {
      setListening(false)
      recRef.current = null
    }

    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [SR, supported, lang])

  useEffect(
    () => () => {
      try {
        recRef.current?.abort()
      } catch {
        /* yoksay */
      }
    },
    []
  )

  return { supported, listening, transcript, error, start, stop, reset }
}
