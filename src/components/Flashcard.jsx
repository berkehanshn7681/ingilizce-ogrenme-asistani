import { RotateCw, Volume2, Check, Plus } from 'lucide-react'

const TYPE_LABEL = { noun: 'isim', verb: 'fiil', adjective: 'sıfat', adverb: 'zarf' }

const LEVEL_BADGE = {
  a1: 'bg-emerald-500/20 text-emerald-200',
  a2: 'bg-teal-500/20 text-teal-200',
  b1: 'bg-sky-500/20 text-sky-200',
  b2: 'bg-indigo-500/20 text-indigo-200',
  c1: 'bg-violet-500/20 text-violet-200',
  c2: 'bg-fuchsia-500/20 text-fuchsia-200',
}

/**
 * Dönen kelime kartı (flip card) — kontrollü bileşen.
 * Ön yüz: kelime + seviye · Arka yüz: Türkçe çeviri.
 */
export default function Flashcard({ word, flipped, onToggleFlip, learned, onToggleLearned }) {
  const speak = (e) => {
    e.stopPropagation()
    if (!('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance(word.word)
    utter.lang = 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const toggleLearned = (e) => {
    e.stopPropagation()
    onToggleLearned(word.id)
  }

  const LearnedButton = () => (
    <span
      role="button"
      tabIndex={0}
      onClick={toggleLearned}
      onKeyDown={(e) => e.key === 'Enter' && toggleLearned(e)}
      aria-label={learned ? 'Öğrenildi işaretini kaldır' : 'Öğrendim'}
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-90',
        learned ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:text-emerald-200',
      ].join(' ')}
    >
      {learned ? <Check className="h-3 w-3" strokeWidth={3} /> : <Plus className="h-3 w-3" />}
      {learned ? 'Öğrenildi' : 'Öğrendim'}
    </span>
  )

  return (
    <div className="card-3d h-56 w-full select-none">
      <button
        type="button"
        onClick={onToggleFlip}
        aria-label={flipped ? 'Kartı çevir (İngilizce)' : 'Kartı çevir (Türkçe)'}
        className="h-full w-full text-left"
      >
        <div className={['card-inner', flipped ? 'is-flipped' : ''].join(' ')}>
          {/* ÖN YÜZ - İngilizce + seviye */}
          <div
            className={[
              'card-face flex flex-col justify-between rounded-3xl border p-5 shadow-card',
              learned
                ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-600/15 to-surface'
                : 'border-white/10 bg-gradient-to-br from-surface-soft to-surface',
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={['rounded-full px-2 py-0.5 text-[11px] font-bold uppercase', LEVEL_BADGE[word.level]].join(' ')}>
                  {word.level}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                  {TYPE_LABEL[word.type] ?? word.type}
                </span>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={speak}
                onKeyDown={(e) => e.key === 'Enter' && speak(e)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-slate-300 transition active:scale-90 hover:text-brand-300"
                aria-label="Sesli oku"
              >
                <Volume2 className="h-4 w-4" />
              </span>
            </div>

            <div className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-white">{word.word}</p>
              {word.example && <p className="mt-2 text-sm italic text-slate-400">“{word.example}”</p>}
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <RotateCw className="h-3.5 w-3.5" />
                Çevirmek için dokun
              </span>
              <LearnedButton />
            </div>
          </div>

          {/* ARKA YÜZ - Türkçe */}
          <div className="card-face card-face--back flex flex-col justify-between rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-600/25 to-surface p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                Türkçe
              </span>
              <span className="text-[11px] text-slate-400">{word.word}</span>
            </div>

            <div className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-white">{word.translation}</p>
              {word.exampleTr && <p className="mt-2 text-sm text-brand-100/80">{word.exampleTr}</p>}
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-brand-200/70">
                <RotateCw className="h-3.5 w-3.5" />
                Geri çevir
              </span>
              <LearnedButton />
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
