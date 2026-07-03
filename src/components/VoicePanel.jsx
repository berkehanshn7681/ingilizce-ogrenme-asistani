import { useEffect, useRef } from 'react'
import { Mic, PhoneOff, Play, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react'
import { useVoiceConversation } from '../hooks/useVoiceConversation.js'

/**
 * Yeniden kullanılabilir Ye Ruhe sesli sohbet paneli.
 * Bir `scenario` alır (greeting, turns:[{text,keywords}], acks, closing, emoji, roleLabel)
 * ve konuşma bitince `onComplete` çağırır.
 *
 * Görsel geri bildirim (halka renkleri):
 *   Dinleme = Yeşil · Analiz = Sarı · Doğru = Yeşil · Yanlış = Kırmızı · Konuşma = Mavi
 */

const COLOR = {
  blue: { ring: 'text-brand-400', glow: 'bg-brand-500/40', dot: 'bg-brand-400', grad: 'rgba(59,130,246,0.34)', chip: 'bg-white/5 text-slate-100 ring-white/10' },
  green: { ring: 'text-emerald-400', glow: 'bg-emerald-500/30', dot: 'bg-emerald-400', grad: 'rgba(16,185,129,0.32)', chip: 'bg-emerald-500/10 text-emerald-100 ring-emerald-500/20' },
  yellow: { ring: 'text-amber-400', glow: 'bg-amber-500/30', dot: 'bg-amber-400', grad: 'rgba(245,158,11,0.30)', chip: 'bg-amber-500/10 text-amber-100 ring-amber-500/20' },
  red: { ring: 'text-red-400', glow: 'bg-red-500/30', dot: 'bg-red-400', grad: 'rgba(239,68,68,0.30)', chip: 'bg-red-500/10 text-red-100 ring-red-500/20' },
}

function resolvePhase(status, feedback) {
  if (status === 'listening') return 'green'
  if (status === 'analyzing') return 'yellow'
  if (status === 'finished') return 'green'
  if (status === 'speaking') {
    if (feedback === 'correct') return 'green'
    if (feedback === 'incorrect') return 'red'
    if (feedback === 'needs-improvement') return 'yellow'
    return 'blue'
  }
  return 'blue'
}

function statusLabel(status, feedback) {
  if (status === 'listening') return 'Seni dinliyorum…'
  if (status === 'analyzing') return 'Yanıtın değerlendiriliyor…'
  if (status === 'finished') return 'Konuşma tamamlandı 🎉'
  if (status === 'speaking') {
    if (feedback === 'correct') return 'Doğru! 👏'
    if (feedback === 'incorrect') return 'Küçük bir düzeltme 📝'
    if (feedback === 'needs-improvement') return 'Biraz daha detay 💭'
    return 'Ye Ruhe konuşuyor…'
  }
  return 'Sohbete hazır'
}

export default function VoicePanel({ scenario, onComplete, startLabel = 'Sohbeti Başlat' }) {
  const {
    status,
    feedback,
    index,
    total,
    caption,
    transcript,
    error,
    sttSupported,
    start,
    stop,
  } = useVoiceConversation()

  const completedRef = useRef(false)

  const isListening = status === 'listening'
  const isAnalyzing = status === 'analyzing'
  const isSpeaking = status === 'speaking'
  const isActive = isSpeaking || isListening || isAnalyzing
  const isFinished = status === 'finished'
  const isIdle = status === 'idle'

  // Konuşma bittiğinde bir kez üst bileşeni bilgilendir
  useEffect(() => {
    if (isFinished && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
    if (!isFinished && status !== 'idle') completedRef.current = false
  }, [isFinished, status, onComplete])

  const phase = resolvePhase(status, feedback)
  const c = COLOR[phase]

  let subtitle = null
  if (error === 'mic-denied' || error === 'unsupported') subtitle = null
  else if (isListening) subtitle = transcript || 'Şimdi İngilizce konuş…'
  else if (isAnalyzing) subtitle = transcript || 'Değerlendiriliyor…'
  else if (isSpeaking || isFinished) subtitle = caption

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5">
      <div
        className="pointer-events-none absolute inset-0 bg-slate-950 transition-[background] duration-700"
        style={{ backgroundImage: `radial-gradient(circle at 50% 34%, ${c.grad}, rgba(2,6,23,0) 66%)` }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-4 py-7">
        {/* Durum satırı */}
        {(isActive || isFinished) && (
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2">
              <span className={['h-2 w-2 rounded-full', c.dot, isActive ? 'animate-pulse' : ''].join(' ')} />
              <span className="text-sm font-semibold text-white">{statusLabel(status, feedback)}</span>
            </div>
            <span className="text-xs text-slate-400">
              {scenario.emoji} {scenario.roleLabel}
              {index >= 0 && ` · Soru ${index + 1}/${total}`}
            </span>
          </div>
        )}

        {/* Avatar + ses dalgaları */}
        <button
          type="button"
          onClick={isActive ? stop : () => start(scenario)}
          aria-label={isActive ? 'Sohbeti bitir' : 'Sohbeti başlat'}
          className="relative grid h-40 w-40 place-items-center rounded-full outline-none"
        >
          {isActive && (
            <span className={c.ring} aria-hidden="true">
              <span className="voice-ring" style={{ animationDelay: '0s' }} />
              <span className="voice-ring" style={{ animationDelay: '0.8s' }} />
              <span className="voice-ring" style={{ animationDelay: '1.6s' }} />
            </span>
          )}
          <span className={['absolute inset-3 rounded-full blur-2xl transition-colors duration-500', c.glow].join(' ')} />
          <span
            className={[
              'relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 text-5xl shadow-glow ring-4 ring-white/10 transition-transform',
              isActive ? 'voice-breathe' : '',
            ].join(' ')}
          >
            🫏
          </span>
        </button>

        {/* Altyazı / hata */}
        <div className="min-h-[3.5rem] w-full max-w-sm px-1 text-center">
          {error === 'unsupported' ? (
            <ErrorNote>Tarayıcın sesli okumayı desteklemiyor. Güncel bir tarayıcı kullan.</ErrorNote>
          ) : error === 'mic-denied' ? (
            <ErrorNote>Mikrofon izni verilmedi. İzin verip tekrar başlat.</ErrorNote>
          ) : subtitle ? (
            <p
              className={[
                'animate-pop-in rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1',
                isActive || isFinished ? c.chip : 'bg-white/5 text-slate-100 ring-white/10',
              ].join(' ')}
            >
              {isListening && <Mic className="mr-1.5 inline h-3.5 w-3.5" />}
              {isSpeaking && feedback === 'neutral' && <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />}
              {subtitle}
            </p>
          ) : (
            isIdle && (
              <p className="text-xs text-slate-400">
                Butona dokun, Ye Ruhe seninle İngilizce {scenario.turns.length} soruluk sohbet etsin.
              </p>
            )
          )}
        </div>

        {/* Kontroller */}
        <div className="flex w-full max-w-sm flex-col items-center gap-2">
          {!sttSupported && !error && (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sesli yanıt için Chrome önerilir.
            </p>
          )}

          {isActive ? (
            <button
              type="button"
              onClick={stop}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/90 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
            >
              <PhoneOff className="h-5 w-5" />
              Bitir
            </button>
          ) : isFinished ? (
            <button
              type="button"
              onClick={() => start(scenario)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-glow transition active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Tekrar Konuş
            </button>
          ) : (
            <button
              type="button"
              onClick={() => start(scenario)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-glow transition active:scale-[0.98]"
            >
              <Play className="h-5 w-5" />
              {startLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ErrorNote({ children }) {
  return (
    <p className="animate-pop-in flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
