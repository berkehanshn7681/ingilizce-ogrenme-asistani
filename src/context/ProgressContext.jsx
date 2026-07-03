import { createContext, useContext, useCallback, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const STORAGE_KEYS = {
  learned: 'eng-asistan/learned-words',
  session: 'eng-asistan/session-start',
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  // Öğrenilen kelime id'leri (Kelimeler modülü)
  const [learnedWords, setLearnedWords] = useLocalStorage(STORAGE_KEYS.learned, [])
  // "Günlük Hedef": mevcut oturumun tam listedeki başlangıç indeksi
  const [sessionStart, setSessionStartRaw] = useLocalStorage(STORAGE_KEYS.session, 0)

  const learnedSet = useMemo(() => new Set(learnedWords), [learnedWords])

  const isWordLearned = useCallback((wordId) => learnedSet.has(wordId), [learnedSet])

  const markWordLearned = useCallback(
    (wordId) => {
      setLearnedWords((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]))
    },
    [setLearnedWords]
  )

  const markWordForReview = useCallback(
    (wordId) => {
      setLearnedWords((prev) => prev.filter((id) => id !== wordId))
    },
    [setLearnedWords]
  )

  const toggleWordLearned = useCallback(
    (wordId) => {
      setLearnedWords((prev) =>
        prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
      )
    },
    [setLearnedWords]
  )

  // Oturum (Günlük Hedef) gezinmesi ---------------------------------------
  const setSessionStart = useCallback(
    (value) => {
      setSessionStartRaw((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        return Math.max(0, Math.floor(next) || 0)
      })
    },
    [setSessionStartRaw]
  )

  const resetProgress = useCallback(() => {
    setLearnedWords([])
    setSessionStartRaw(0)
  }, [setLearnedWords, setSessionStartRaw])

  const stats = useMemo(
    () => ({ learnedCount: learnedWords.length }),
    [learnedWords]
  )

  const value = useMemo(
    () => ({
      learnedWords,
      isWordLearned,
      markWordLearned,
      markWordForReview,
      toggleWordLearned,
      sessionStart,
      setSessionStart,
      resetProgress,
      stats,
    }),
    [
      learnedWords,
      isWordLearned,
      markWordLearned,
      markWordForReview,
      toggleWordLearned,
      sessionStart,
      setSessionStart,
      resetProgress,
      stats,
    ]
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress, ProgressProvider içinde kullanılmalıdır.')
  }
  return ctx
}
