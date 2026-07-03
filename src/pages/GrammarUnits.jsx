import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { GRAMMAR_UNITS } from '../data/grammarUnits.js'

export default function GrammarUnits() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-violet-600/20 to-surface p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">
          İnteraktif Gramer Lab
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-white">Konu seç, 4 adımda pratik yap</h2>
        <p className="mt-1 text-sm text-slate-400">
          Yapay zekâ üretimli alıştırmalar: <span className="text-slate-300">Okuma → Dinleme → Yazma → Konuşma</span>.
          İçerik her seferinde yenilenir.
        </p>
      </section>

      <section className="space-y-3">
        {GRAMMAR_UNITS.map((unit) => (
          <button
            key={unit.id}
            type="button"
            onClick={() => navigate(`/uniteler/${unit.id}`)}
            className={[
              'flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-gradient-to-br p-4 text-left transition active:scale-[0.98] hover:border-white/15',
              unit.gradient,
            ].join(' ')}
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15">
              {unit.emoji}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold text-white">{unit.name}</h3>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
                  {unit.level}
                </span>
              </div>
              <p className="truncate text-xs text-slate-300">{unit.tr}</p>
            </div>

            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </button>
        ))}
      </section>
    </div>
  )
}
