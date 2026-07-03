import { useState, useRef, useEffect, useCallback } from 'react'
import { evaluateResponse } from '../utils/evaluate.js'

/**
 * Ye Ruhe "Analitik Sesli Roleplay" konuşma döngüsü.
 *
 * start(scenario):
 *   (mikrofon izni) -> Ye Ruhe rolüne girer, karşılar (TTS)
 *   -> her `turn` için:
 *        Ye Ruhe repliği söyler (speaking, mavi)
 *        -> kullanıcı konuşur (listening, yeşil)
 *        -> 1.5 sn sessizlik = Konuşma Aktivite Tespiti (VAD)
 *        -> analiz (analyzing, sarı) -> evaluateResponse(...)
 *        -> geri bildirim (speaking + feedback rengi):
 *             correct  -> yeşil, sonraki soruya geç
 *             incorrect-> kırmızı, nazik düzeltme, aynı soruyu tekrar dinle
 *             needs-improvement -> sarı, daha fazla detay iste, tekrar dinle
 *   -> kapanış
 *
 * status: 'idle' | 'speaking' | 'listening' | 'analyzing' | 'finished'
 * feedback: 'neutral' | 'correct' | 'incorrect' | 'needs-improvement'
 */

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined

const CANCELLED = Symbol('cancelled')
const SILENCE_MS = 1500 // konuştuktan sonra bu kadar sessizlik = cevap bitti
const NO_SPEECH_MS = 8000 // hiç konuşulmazsa tıkanmayı önle
const MAX_RETRIES = 2 // aynı soru için en fazla tekrar denemesi

export function useVoiceConversation() {
  const ttsSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window
  const sttSupported = Boolean(SpeechRecognition)

  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('neutral')
  const [index, setIndex] = useState(-1)
  const [total, setTotal] = useState(0)
  const [caption, setCaption] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)

  const voicesRef = useRef([])
  const recognitionRef = useRef(null)
  const cancelledRef = useRef(false)
  const runningRef = useRef(false)

  useEffect(() => {
    if (!ttsSupported) return
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [ttsSupported])

  const pickMaleVoice = useCallback(() => {
    const voices = voicesRef.current || []
    const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'))
    const maleRe = /male|david|george|daniel|alex|fred|james|arthur|ryan|mark|guy|aaron/i
    return (
      en.find((v) => v.lang.toLowerCase() === 'en-gb' && maleRe.test(v.name)) ||
      en.find((v) => maleRe.test(v.name)) ||
      en.find((v) => v.lang.toLowerCase() === 'en-gb') ||
      en.find((v) => v.lang.toLowerCase() === 'en-us') ||
      en[0] ||
      null
    )
  }, [])

  // Metni seslendir; bitince resolve olan Promise
  const speak = useCallback(
    (text) =>
      new Promise((resolve, reject) => {
        if (cancelledRef.current) return reject(CANCELLED)
        if (!ttsSupported || !text) return resolve()

        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'en-GB'
        utter.rate = 0.85
        utter.pitch = 0.9
        const voice = pickMaleVoice()
        if (voice) utter.voice = voice

        setCaption(text)
        setTranscript('')
        setStatus('speaking')

        let done = false
        const finish = () => {
          if (done) return
          done = true
          cancelledRef.current ? reject(CANCELLED) : resolve()
        }
        utter.onend = finish
        utter.onerror = finish
        window.speechSynthesis.speak(utter)
      }),
    [ttsSupported, pickMaleVoice]
  )

  // Kullanıcıyı dinle: VAD (sessizlik zamanlayıcısı) ile.
  // 1.5 sn sessizlikte 'analyzing'e geçip tanınan metinle resolve olur.
  const listen = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (cancelledRef.current) return reject(CANCELLED)
        if (!sttSupported) return resolve('')

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.lang = 'en-US'
        recognition.interimResults = true
        recognition.continuous = true
        recognition.maxAlternatives = 1

        let finalText = ''
        let lastInterim = ''
        let done = false
        let timer = null

        const clearTimer = () => {
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
        }

        const armTimer = (ms) => {
          clearTimer()
          timer = setTimeout(() => {
            // Sessizlik algılandı -> analiz fazına geç ve dinlemeyi bitir
            if (!cancelledRef.current) setStatus('analyzing')
            try {
              recognition.stop()
            } catch {
              /* yoksay */
            }
          }, ms)
        }

        setTranscript('')
        setStatus('listening')

        recognition.onresult = (event) => {
          let interim = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const chunk = event.results[i][0].transcript
            if (event.results[i].isFinal) finalText += chunk
            else interim += chunk
          }
          lastInterim = interim
          const shown = (finalText + ' ' + interim).trim()
          setTranscript(shown)
          if (shown) armTimer(SILENCE_MS)
        }

        recognition.onerror = (event) => {
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('mic-denied')
          }
        }

        recognition.onend = () => {
          clearTimer()
          recognitionRef.current = null
          if (done) return
          done = true
          if (cancelledRef.current) return reject(CANCELLED)
          resolve((finalText.trim() || lastInterim.trim()).trim())
        }

        try {
          recognition.start()
          armTimer(NO_SPEECH_MS) // hiç konuşulmazsa da bir süre sonra bitir
        } catch {
          done = true
          resolve('')
        }
      }),
    [sttSupported]
  )

  const wait = (ms) =>
    new Promise((resolve, reject) => {
      if (cancelledRef.current) return reject(CANCELLED)
      setTimeout(() => (cancelledRef.current ? reject(CANCELLED) : resolve()), ms)
    })

  const stop = useCallback(() => {
    cancelledRef.current = true
    runningRef.current = false
    try {
      if (ttsSupported) window.speechSynthesis.cancel()
    } catch {
      /* yoksay */
    }
    try {
      recognitionRef.current?.abort()
    } catch {
      /* yoksay */
    }
    recognitionRef.current = null
    setStatus('idle')
    setFeedback('neutral')
    setIndex(-1)
    setCaption('')
    setTranscript('')
  }, [ttsSupported])

  const start = useCallback(
    async (scenario) => {
      if (runningRef.current || !scenario) return
      if (!ttsSupported) {
        setError('unsupported')
        return
      }

      if (sttSupported && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream.getTracks().forEach((t) => t.stop())
        } catch {
          setError('mic-denied')
          return
        }
      }

      setError(null)
      cancelledRef.current = false
      runningRef.current = true
      setTotal(scenario.turns.length)

      try {
        window.speechSynthesis.resume()
        setFeedback('neutral')
        await speak(scenario.greeting)

        for (let i = 0; i < scenario.turns.length; i++) {
          if (cancelledRef.current) throw CANCELLED
          const turn = scenario.turns[i]
          setIndex(i)
          setFeedback('neutral')
          await speak(turn.text)

          let attempts = 0
          // Öğretmen döngüsü: doğru olana ya da deneme hakkı bitene kadar
          // aynı soruda kal.
          // eslint-disable-next-line no-constant-condition
          while (true) {
            if (cancelledRef.current) throw CANCELLED
            await wait(200)
            const answer = await listen()
            setStatus('analyzing')
            await wait(600) // görünür analiz fazı (sarı)

            const result = evaluateResponse(answer, turn, scenario)
            setFeedback(result.type)
            await speak(result.message)

            if (result.type === 'correct') break

            attempts += 1
            if (attempts >= MAX_RETRIES) {
              setFeedback('neutral')
              await speak('No worries, let us move on to the next one.')
              break
            }
            // Aksi halde aynı soruyu tekrar dinle (yeni deneme)
          }
        }

        setIndex(-1)
        setFeedback('neutral')
        await speak(scenario.closing)
        setStatus('finished')
        setCaption(scenario.closing)
      } catch (err) {
        if (err !== CANCELLED) {
          console.error('Sesli sohbet hatası:', err)
        }
      } finally {
        runningRef.current = false
      }
    },
    [ttsSupported, sttSupported, speak, listen]
  )

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      try {
        window.speechSynthesis?.cancel()
      } catch {
        /* yoksay */
      }
      try {
        recognitionRef.current?.abort()
      } catch {
        /* yoksay */
      }
    }
  }, [])

  return {
    status,
    feedback,
    index,
    total,
    caption,
    transcript,
    error,
    ttsSupported,
    sttSupported,
    start,
    stop,
  }
}
