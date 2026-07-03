import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import {
  BookOpen,
  Headphones,
  PencilLine,
  MessageCircle,
  Volume2,
  Square,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Mic,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react'
import { getGrammarUnit } from '../data/grammarUnits.js'
import { fetchPracticeContent, checkGapFill, analyzeSpeaking } from '../data/grammarContent.js'
import { useTts } from '../hooks/useTts.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'

const STEPS = [
  { key: 'reading', label: 'Okuma', icon: BookOpen },
  { key: 'listening', label: 'Dinleme', icon: Headphones },
  { key: 'writing', label: 'Yazma', icon: PencilLine },
  { key: 'speaking', label: 'Konuşma', icon: MessageCircle },
]

export default function GrammarPractice() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { speak, stop: stopTts, speaking, supported: ttsSupported } = useTts()

  const unit = getGrammarUnit(unitId)

  const [step, setStep] = useState(0)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [showListenText, setShowListenText] = useState(false)
  const [qIndex, setQIndex] = useState(0)

  const loadContent = useCallback(async () => {
    setLoading(true)
    setContent(null)
    setStep(0)
    setAnswers({})
    setResults(null)
    setShowListenText(false)
    setQIndex(0)
    const data = await fetchPracticeContent(unitId)
    setContent(data)
    setLoading(false)
  }, [unitId])

  useEffect(() => {
    if (!unit) return
    loadContent()
  }, [unit, loadContent])

  // Adım değişince sesi durdur
  useEffect(() => {
    stopTts()
  }, [step, stopTts])

  if (!unit) return <Navigate to="/uniteler" replace />

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const checkWriting = () => {
    const res = {}
    content.gapFills.forEach((item) => {
      res[item.id] = checkGapFill(answers[item.id] || '', item)
    })
    setResults(res)
  }

  return (
    <div className="space-y-5">
      {/* Ünite başlığı + Yeni içerik */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-surface-soft p-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-xl ring-1 ring-white/10">
          {unit.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-white">{unit.name}</h2>
          <p className="truncate text-xs text-slate-400">{unit.tr}</p>
        </div>
        <button
          type="button"
          onClick={loadContent}
          disabled={loading}
          aria-label="Yeni içerik üret"
          className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition active:scale-95 hover:bg-white/10 disabled:opacity-40"
        >
          <RefreshCw className={['h-3.5 w-3.5', loading ? 'animate-spin' : ''].join(' ')} />
          Yeni
        </button>
      </div>

      {/* Adım sekmeleri */}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const active = i === step
          const done = i < step
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => !loading && setStep(i)}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span
                className={[
                  'grid h-9 w-9 place-items-center rounded-full text-xs font-bold ring-1 transition',
                  active
                    ? 'bg-brand-500 text-white ring-brand-400'
                    : done
                      ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30'
                      : 'bg-white/5 text-slate-400 ring-white/10',
                ].join(' ')}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
              </span>
              <span className={['text-[10px] font-medium', active ? 'text-white' : 'text-slate-500'].join(' ')}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* İçerik */}
      {loading || !content ? (
        <LoadingCard />
      ) : (
        <div className="animate-fade-in-up">
          {step === 0 && <ReadingStep text={content.reading} />}
          {step === 1 && (
            <ListeningStep
              text={content.reading}
              speaking={speaking}
              ttsSupported={ttsSupported}
              onSpeak={() => speak(content.reading)}
              onStop={stopTts}
              showText={showListenText}
              onToggleText={() => setShowListenText((v) => !v)}
            />
          )}
          {step === 2 && (
            <WritingStep
              items={content.gapFills}
              answers={answers}
              setAnswers={setAnswers}
              results={results}
              onCheck={checkWriting}
            />
          )}
          {step === 3 && (
            <SpeakingStep
              questions={content.questions}
              keywords={content.keywords}
              qIndex={qIndex}
              setQIndex={setQIndex}
              speaking={speaking}
              ttsSupported={ttsSupported}
              onSpeak={speak}
              onStop={stopTts}
              onNewExercise={loadContent}
              onBackToList={() => navigate('/uniteler')}
            />
          )}
        </div>
      )}

      {/* Adım gezinme (Konuşma hariç) */}
      {!loading && content && step < 3 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center justify-center gap-1 rounded-2xl bg-surface-muted px-4 py-3.5 text-sm font-semibold text-slate-200 transition active:scale-[0.98] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Geri
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-glow transition active:scale-[0.98]"
          >
            Devam
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-surface-soft py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      <p className="text-sm font-semibold text-white">Yapay zekâ içerik hazırlıyor…</p>
      <p className="text-xs text-slate-500">Bu üniteye özel yeni bir alıştırma üretiliyor</p>
    </div>
  )
}

function StepHeader({ icon: Icon, title, hint }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-300" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function ReadingStep({ text }) {
  return (
    <div>
      <StepHeader icon={BookOpen} title="Okuma" hint="Metni oku ve hedef gramer yapısını fark et." />
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface-soft to-surface p-5">
        <p className="text-[15px] leading-relaxed text-slate-100">{text}</p>
      </div>
    </div>
  )
}

function ListeningStep({ text, speaking, ttsSupported, onSpeak, onStop, showText, onToggleText }) {
  return (
    <div>
      <StepHeader icon={Headphones} title="Dinleme" hint="Metni dinle, telaffuz ve tonlamaya odaklan." />
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface-soft to-surface p-6">
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={speaking ? onStop : onSpeak}
            disabled={!ttsSupported}
            className={[
              'grid h-20 w-20 place-items-center rounded-full shadow-glow transition active:scale-95',
              speaking ? 'bg-red-500/90 text-white' : 'bg-gradient-to-br from-brand-400 to-brand-600 text-white',
              !ttsSupported ? 'cursor-not-allowed opacity-40' : '',
            ].join(' ')}
            aria-label={speaking ? 'Durdur' : 'Dinle'}
          >
            {speaking ? <Square className="h-7 w-7" /> : <Volume2 className="h-8 w-8" />}
          </button>
          <p className="text-sm font-semibold text-white">
            {speaking ? 'Okunuyor…' : 'Metni dinlemek için dokun'}
          </p>
          {!ttsSupported && <p className="text-xs text-amber-400/80">Tarayıcın sesli okumayı desteklemiyor.</p>}

          <button
            type="button"
            onClick={onToggleText}
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            {showText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showText ? 'Metni gizle' : 'Metni göster'}
          </button>

          {showText && (
            <p className="animate-pop-in rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-slate-200">{text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function WritingStep({ items, answers, setAnswers, results, onCheck }) {
  return (
    <div>
      <StepHeader icon={PencilLine} title="Yazma" hint="Boşluğa doğru formu yaz. Parantez içindeki ipuçlarını kullan." />
      <div className="space-y-3">
        {items.map((item, i) => {
          const val = answers[item.id] || ''
          const checked = results != null
          const ok = checked && results[item.id]
          return (
            <div
              key={item.id}
              className={[
                'rounded-2xl border p-4 transition',
                checked ? (ok ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5') : 'border-white/10 bg-surface-soft',
              ].join(' ')}
            >
              <p className="mb-2 text-sm text-slate-100">
                <span className="mr-1 text-slate-500">{i + 1}.</span>
                {item.sentence}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Cevabın…"
                  className="flex-1 rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                {checked && (
                  <span
                    className={[
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                      ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300',
                    ].join(' ')}
                  >
                    {ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
                  </span>
                )}
              </div>
              {checked && !ok && (
                <p className="mt-2 text-xs text-emerald-300">
                  Doğru cevap: <span className="font-semibold">{item.answer}</span>
                </p>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onCheck}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 ring-1 ring-white/10 transition active:scale-[0.98] hover:bg-white/10"
      >
        <Sparkles className="h-4 w-4 text-brand-300" />
        Kontrol Et
      </button>
    </div>
  )
}

const FEEDBACK_STYLE = {
  correct: {
    box: 'border-emerald-500/40 bg-emerald-500/10',
    title: 'text-emerald-200',
    body: 'text-emerald-300/90',
    icon: Check,
    iconWrap: 'bg-emerald-500/20 text-emerald-300',
  },
  improve: {
    box: 'border-amber-500/40 bg-amber-500/10',
    title: 'text-amber-200',
    body: 'text-amber-300/90',
    icon: Lightbulb,
    iconWrap: 'bg-amber-500/20 text-amber-300',
  },
  incorrect: {
    box: 'border-red-500/40 bg-red-500/10',
    title: 'text-red-200',
    body: 'text-red-300/90',
    icon: AlertTriangle,
    iconWrap: 'bg-red-500/20 text-red-300',
  },
}

function SpeakingStep({ questions, keywords, qIndex, setQIndex, speaking, ttsSupported, onSpeak, onStop, onNewExercise, onBackToList }) {
  const total = questions.length
  const current = questions[qIndex]
  const isLast = qIndex >= total - 1

  const {
    supported: sttSupported,
    listening,
    transcript,
    error,
    start,
    stop,
    reset,
  } = useSpeechRecognition()
  const [feedback, setFeedback] = useState(null)

  // Soru değişince transkript ve geri bildirimi sıfırla
  useEffect(() => {
    reset()
    setFeedback(null)
  }, [qIndex, reset])

  const goQuestion = (nextIndex) => {
    if (listening) stop()
    setQIndex(nextIndex)
  }

  const startListening = () => {
    setFeedback(null)
    reset()
    start()
  }

  const analyze = () => {
    setFeedback(analyzeSpeaking(transcript, keywords))
  }

  const tryAgain = () => {
    setFeedback(null)
    reset()
  }

  const errorText =
    error === 'mic-denied'
      ? 'Mikrofon izni reddedildi. Tarayıcı ayarlarından izin ver.'
      : error === 'no-speech'
        ? 'Ses algılanmadı. Tekrar dener misin?'
        : error && error !== 'unsupported'
          ? 'Bir sorun oluştu, tekrar dene.'
          : null

  const fb = feedback ? FEEDBACK_STYLE[feedback.status] : null

  return (
    <div>
      <StepHeader
        icon={MessageCircle}
        title="Konuşma"
        hint="Soruyu dinle, sesli yanıtla ve cevabını analiz et."
      />

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface-soft to-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
            Soru {qIndex + 1} / {total}
          </span>
          <button
            type="button"
            onClick={speaking ? onStop : () => onSpeak(current)}
            disabled={!ttsSupported}
            className={[
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95',
              speaking ? 'bg-red-500/90 text-white' : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow',
              !ttsSupported ? 'cursor-not-allowed opacity-40' : '',
            ].join(' ')}
          >
            {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {speaking ? 'Durdur' : 'Dinle'}
          </button>
        </div>

        <p className="min-h-[3.5rem] text-lg font-semibold leading-relaxed text-white">{current}</p>

        {/* Konuşma tanıma alanı */}
        {!sttSupported ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Tarayıcın konuşma tanımayı desteklemiyor (Chrome önerilir).
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={listening ? stop : startListening}
              className={[
                'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition active:scale-[0.98]',
                listening
                  ? 'bg-red-500/90 animate-pulse'
                  : 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-glow',
              ].join(' ')}
            >
              {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? 'Dinleniyor… (Durdur)' : 'Konuşmayı Başlat'}
            </button>

            {errorText && <p className="text-center text-xs text-red-300">{errorText}</p>}

            {transcript && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Senin cevabın
                </p>
                <p className="text-sm leading-relaxed text-slate-100">“{transcript}”</p>
              </div>
            )}

            {transcript && !listening && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={tryAgain}
                  className="rounded-2xl bg-surface-muted px-4 py-3 text-sm font-semibold text-slate-200 transition active:scale-95"
                >
                  Tekrar Dene
                </button>
                <button
                  type="button"
                  onClick={analyze}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] hover:bg-white/15"
                >
                  <Sparkles className="h-4 w-4 text-brand-300" />
                  Analiz Et
                </button>
              </div>
            )}

            {feedback && fb && (
              <div className={['animate-pop-in flex items-start gap-3 rounded-2xl border p-4', fb.box].join(' ')}>
                <span className={['grid h-8 w-8 shrink-0 place-items-center rounded-xl', fb.iconWrap].join(' ')}>
                  <fb.icon className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={['text-sm font-bold', fb.title].join(' ')}>{feedback.title}</p>
                  <p className={['mt-0.5 text-xs leading-relaxed', fb.body].join(' ')}>{feedback.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Soru gezinme */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => goQuestion(Math.max(0, qIndex - 1))}
            disabled={qIndex === 0}
            className="rounded-2xl bg-surface-muted px-4 py-3 text-sm font-semibold text-slate-200 transition active:scale-95 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goQuestion(Math.min(total - 1, qIndex + 1))}
            disabled={isLast}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-30"
          >
            Sonraki Soru
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Döngü: sonraki alıştırma / listeye dön */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToList}
          className="flex flex-1 items-center justify-center rounded-2xl bg-surface-muted px-4 py-3.5 text-sm font-semibold text-slate-200 transition active:scale-[0.98]"
        >
          Ünitelere dön
        </button>
        <button
          type="button"
          onClick={onNewExercise}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-glow transition active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Sonraki Alıştırma
        </button>
      </div>
    </div>
  )
}
