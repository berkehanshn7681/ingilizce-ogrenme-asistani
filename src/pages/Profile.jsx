import { useEffect, useMemo, useState } from 'react'
import {
  Layers,
  BookOpen,
  GraduationCap,
  Trash2,
  Download,
  Smartphone,
  Check,
} from 'lucide-react'
import { useProgress } from '../context/ProgressContext.jsx'
import { useVocabulary } from '../hooks/useVocabulary.js'

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-soft p-4 ring-1 ring-white/5">
      <Icon className="h-5 w-5 text-brand-300" />
      <span className="mt-1 text-2xl font-extrabold leading-none text-white">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  )
}

export default function Profile() {
  const { learnedWords, resetProgress } = useProgress()
  const { words } = useVocabulary()
  const [confirming, setConfirming] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  // PWA: "Ana ekrana ekle" istemini yakala
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  const learnedSet = useMemo(() => new Set(learnedWords), [learnedWords])
  const learnedList = useMemo(
    () => words.filter((w) => learnedSet.has(w.id)),
    [words, learnedSet]
  )
  const totalWords = words.length
  const levelsStarted = useMemo(
    () => new Set(learnedList.map((w) => w.level)).size,
    [learnedList]
  )

  return (
    <div className="space-y-6">
      {/* Avatar / başlık */}
      <section className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-extrabold text-white shadow-glow">
          👤
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-white">Öğrenci</h2>
          <p className="text-sm text-slate-400">İlerlemen bu cihazda saklanıyor</p>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="grid grid-cols-3 gap-3">
        <StatCard icon={BookOpen} value={learnedList.length} label="Öğrenildi" />
        <StatCard icon={Layers} value={levelsStarted} label="Seviye" />
        <StatCard icon={GraduationCap} value={totalWords} label="Toplam kelime" />
      </section>

      {/* PWA kurulumu */}
      <section className="rounded-2xl border border-white/5 bg-surface-soft p-5">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-brand-300" />
          <h3 className="text-sm font-bold text-white">Uygulamayı Yükle</h3>
        </div>
        {installed ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> Uygulama ana ekranına eklendi.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-400">
              Ana ekrana ekleyerek tıpkı bir mobil uygulama gibi çevrimdışı kullan.
            </p>
            <button
              type="button"
              onClick={handleInstall}
              disabled={!installPrompt}
              className={[
                'mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98]',
                installPrompt
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow'
                  : 'cursor-not-allowed bg-surface-muted text-slate-500',
              ].join(' ')}
            >
              <Download className="h-4 w-4" />
              {installPrompt ? 'Ana ekrana ekle' : 'Tarayıcı menüsünden ekleyebilirsin'}
            </button>
          </>
        )}
      </section>

      {/* Öğrenilen kelimeler */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-white">
          Öğrenilen Kelimeler ({learnedList.length})
        </h3>
        {learnedList.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 bg-surface-soft/50 p-4 text-center text-sm text-slate-500">
            Henüz kelime öğrenmedin. Kelime kartlarıyla başla!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {learnedList.map((w) => (
              <span
                key={w.id}
                className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20"
              >
                {w.word} · {w.translation}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* İlerlemeyi sıfırla */}
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="text-sm font-bold text-red-300">Tehlikeli Bölge</h3>
        <p className="mt-1 text-sm text-slate-400">
          Tüm ilerlemeni siler ve baştan başlarsın.
        </p>
        {confirming ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                resetProgress()
                setConfirming(false)
              }}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              Evet, sıfırla
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-xl bg-surface-muted px-4 py-2.5 text-sm font-semibold text-slate-200 transition active:scale-[0.98]"
            >
              Vazgeç
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition active:scale-[0.98] hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            İlerlemeyi sıfırla
          </button>
        )}
      </section>
    </div>
  )
}
