import { useEffect, useState } from 'react'
import { ensureOxford3000, getAllVocabulary, isFullLoaded } from '../data/vocabulary.js'

/**
 * Kelime kütüphanesini yükleyen kanca.
 * - İlk çağrıda tam Oxford 3000 listesini (uzak kaynak + localStorage önbelleği)
 *   yüklemeye çalışır; yüklenene kadar yerel yedek listeyi döndürür.
 * - `loading` yalnızca tam liste henüz hazır değilken true olur.
 *
 * @returns {{ words: Array, loading: boolean, loaded: boolean }}
 */
export function useVocabulary() {
  const [words, setWords] = useState(() => getAllVocabulary())
  const [loading, setLoading] = useState(() => !isFullLoaded())

  useEffect(() => {
    let alive = true
    if (isFullLoaded()) {
      setWords(getAllVocabulary())
      setLoading(false)
      return () => {
        alive = false
      }
    }
    setLoading(true)
    ensureOxford3000()
      .then((list) => {
        if (!alive) return
        setWords(list)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { words, loading, loaded: !loading }
}
