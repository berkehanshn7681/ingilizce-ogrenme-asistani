import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Değeri localStorage ile senkronize tutan hook.
 * - Uygulama/tarayıcı kapansa bile veri korunur.
 * - Aynı anahtarı kullanan diğer sekmelerle (storage olayı) senkronize olur.
 *
 * @param {string} key localStorage anahtarı
 * @param {*} initialValue başlangıç değeri (fonksiyon da olabilir)
 */
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return typeof initialValue === 'function' ? initialValue() : initialValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.warn(`localStorage okunamadı ("${key}"):`, error)
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const [storedValue, setStoredValue] = useState(readValue)

  // İlk render'dan sonra harici değişiklikleri yakalamak için
  const keyRef = useRef(key)
  keyRef.current = key

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(keyRef.current, JSON.stringify(next))
        } catch (error) {
          console.warn(`localStorage yazılamadı ("${keyRef.current}"):`, error)
        }
        return next
      })
    },
    []
  )

  // Diğer sekmelerdeki değişiklikleri dinle
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === keyRef.current) {
        setStoredValue(readValue())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [readValue])

  return [storedValue, setValue]
}
