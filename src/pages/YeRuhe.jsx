import { useMemo, useState } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { buildScenario } from '../data/voiceScenarios.js'
import VoicePanel from '../components/VoicePanel.jsx'

/**
 * Ye Ruhe — bağımsız Sesli Yapay Zekâ modülü.
 * - Üstte özel senaryo (bağlam) girişi → AI bu role bürünür.
 * - VoicePanel: VAD (1.5 sn sessizlik) + değerlendirme (yeşil/sarı/kırmızı nabız halkaları).
 */
export default function YeRuhe() {
  const [context, setContext] = useState('')

  // Senaryo, "Sohbeti Başlat"a basıldığında güncel bağlamla oluşturulur.
  const scenario = useMemo(() => buildScenario(context), [context])

  return (
    <div className="space-y-4">
      {/* Özel senaryo girişi (en üstte) */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-brand-600/15 to-surface p-5">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-brand-300" />
          <h2 className="text-sm font-bold text-white">Özel Senaryo</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Ye Ruhe'nin canlandıracağı bağlamı yaz. Boş bırakırsan genel bir sohbet başlar.
        </p>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          maxLength={60}
          placeholder="Örn: Bir iş görüşmesi, kafede sipariş, doktor randevusu…"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        {context.trim() && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Bağlam: “{context.trim()}” — Ye Ruhe bu role göre soru soracak.
          </p>
        )}
      </section>

      {/* Sesli sohbet paneli (nabız halkaları durumlara bağlı) */}
      <VoicePanel key={scenario.roleLabel} scenario={scenario} startLabel="Sohbeti Başlat" />

      {/* Durum rehberi */}
      <section className="rounded-2xl border border-white/5 bg-surface-soft p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Nabız Renkleri
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Dinleniyor / Doğru cevap
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Analiz ediliyor / Daha fazla detay
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Hatalı — nazik düzeltme
          </li>
        </ul>
      </section>
    </div>
  )
}
