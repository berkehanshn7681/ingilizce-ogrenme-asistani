import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Target, Trophy, RotateCcw } from 'lucide-react'
import { SESSION_SIZE } from '../data/vocabulary.js'
import { useVocabulary } from '../hooks/useVocabulary.js'
import { useProgress } from '../context/ProgressContext.jsx'
import Flashcard from '../components/Flashcard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

export default function Vocabulary() {
  const { words, loading } = useVocabulary()
  const { isWordLearned, toggleWordLearned, sessionStart, setSessionStart } = useProgress()

  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const total = words.length
  const totalSets = Math.max(1, Math.ceil(total / SESSION_SIZE))
  const clampedStart = Math.min(Math.max(0, sessionStart), (totalSets - 1) * SESSION_SIZE)
  const setNumber = Math.floor(clampedStart / SESSION_SIZE) + 1

  const sessionWords = useMemo(
    () => words.slice(clampedStart, clampedStart + SESSION_SIZE),
    [words, clampedStart]
  )

  // Yeni oturum / liste yüklenince ilk karta dön
  useEffect(() => {
    setCardIndex(0)
    setFlipped(false)
  }, [clampedStart, total])

  const learnedInList = useMemo(
    () => words.reduce((n, w) => n + (isWordLearned(w.id) ? 1 : 0), 0),
    [words, isWordLearned]
  )
  const learnedInSet = useMemo(
    () => sessionWords.reduce((n, w) => n + (isWordLearned(w.id) ? 1 : 0), 0),
    [sessionWords, isWordLearned]
  )

  const safeIndex = Math.min(cardIndex, Math.max(0, sessionWords.length - 1))
  const current = sessionWords[safeIndex]
  const setSize = sessionWords.length
  const setComplete = setSize > 0 && learnedInSet === setSize
  const hasNextSet = clampedStart + SESSION_SIZE < total
  const hasPrevSet = clampedStart > 0

  const overallPercent = total === 0 ? 0 : Math.round((learnedInList / total) * 100)
  const sessionPercent = setSize === 0 ? 0 : Math.round((learnedInSet / setSize) * 100)

  const prevWord = () => {
    setFlipped(false)
    setCardIndex((i) => Math.max(0, i - 1))
  }
  const nextWord = () => {
    setFlipped(false)
    setCardIndex((i) => Math.min(setSize - 1, i + 1))
  }
  const goNextSet = () => hasNextSet && setSessionStart(clampedStart + SESSION_SIZE)
  const goPrevSet = () => hasPrevSet && setSessionStart(Math.max(0, clampedStart - SESSION_SIZE))

  return (
    <div className="space-y-4">
      {/* Genel ilerleme (tüm 3000 kelime) */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-brand-600/20 to-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-300">
              Oxford 3000
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-white">Kelime Kartları</h2>
          </div>
          {loading && (
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              <Loader2 className="h-3 w-3 animate-spin" />
              Kütüphane yükleniyor
            </span>
          )}
        </div>
        <div className="mt-3">
          <ProgressBar value={overallPercent} label={`${learnedInList} / ${total} kelime öğrenildi`} />
        </div>
      </section>

      {/* Günlük Hedef (oturum) */}
      <section className="rounded-2xl border border-white/5 bg-surface-soft p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Günlük Hedef</p>
              <p className="text-[11px] text-slate-400">
                Set {setNumber} / {totalSets} · {SESSION_SIZE} kelimelik oturum
              </p>
            </div>
          </div>
          <span
            className={[
              'rounded-full px-2.5 py-1 text-[11px] font-bold',
              setComplete ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-200',
            ].join(' ')}
          >
            {learnedInSet} / {setSize}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={sessionPercent} showPercent={false} />
        </div>
      </section>

      {/* Tek kart görünümü (ortalanmış) */}
      {current ? (
        <div className="mx-auto w-full max-w-sm">
          <Flashcard
            key={current.id}
            word={current}
            flipped={flipped}
            onToggleFlip={() => setFlipped((f) => !f)}
            learned={isWordLearned(current.id)}
            onToggleLearned={toggleWordLearned}
          />

          {/* Önceki / Sonraki (oturum içinde sıralı gezinme) */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={prevWord}
              disabled={safeIndex === 0}
              className="flex items-center justify-center gap-1 rounded-2xl bg-surface-muted px-4 py-3.5 text-sm font-semibold text-slate-200 transition active:scale-95 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </button>

            <span className="flex-1 text-center text-xs font-medium text-slate-400">
              {safeIndex + 1} / {setSize}
            </span>

            <button
              type="button"
              onClick={nextWord}
              disabled={safeIndex >= setSize - 1}
              className="flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-glow transition active:scale-95 disabled:opacity-30"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-surface-soft py-16 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
          <p className="text-sm text-slate-400">Kelimeler hazırlanıyor…</p>
        </div>
      )}

      {/* Set tamamlandı bildirimi */}
      {setComplete && (
        <div className="animate-pop-in flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Trophy className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-emerald-200">Bu seti tamamladın!</p>
            <p className="text-[11px] text-emerald-300/80">
              {hasNextSet ? 'Sonraki 20 kelimeye geçebilirsin.' : 'Tüm listeyi bitirdin. Tebrikler!'}
            </p>
          </div>
        </div>
      )}

      {/* Set gezinmesi (Günlük Hedef) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goPrevSet}
          disabled={!hasPrevSet}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface-muted px-4 py-3 text-sm font-semibold text-slate-200 transition active:scale-95 disabled:opacity-30"
        >
          <RotateCcw className="h-4 w-4" />
          Önceki Set
        </button>
        <button
          type="button"
          onClick={goNextSet}
          disabled={!hasNextSet}
          className={[
            'flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:opacity-30',
            setComplete
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-glow'
              : 'bg-white/10 text-white hover:bg-white/15',
          ].join(' ')}
        >
          Sonraki Set
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
