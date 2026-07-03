import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, GraduationCap, User } from 'lucide-react'
import { getGrammarUnit } from '../data/grammarUnits.js'

// Ana sekme kökleri (marka görünümü + modül başlığı)
const TAB_TITLES = {
  '/kelimeler': { title: 'Kelimeler', subtitle: 'Oxford 3000 kelime listesi' },
  '/uniteler': { title: 'Üniteler', subtitle: 'Gramer konuları' },
  '/ye-ruhe': { title: 'Ye Ruhe', subtitle: 'Sesli yapay zekâ asistanı' },
  '/profil': { title: 'Profil', subtitle: 'İlerlemen bu cihazda saklanıyor' },
}

function resolveSubTitle(pathname) {
  const seg = pathname.split('/').filter(Boolean)
  if (seg[0] === 'uniteler' && seg[1]) {
    const unit = getGrammarUnit(seg[1])
    return unit ? unit.name : 'Gramer Ünitesi'
  }
  return null
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const tab = TAB_TITLES[path]
  const showProfileButton = Boolean(tab) && path !== '/profil'

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-surface/80 backdrop-blur-lg">
      <div className="flex h-14 items-center justify-between gap-2 px-4 pt-[env(safe-area-inset-top)]">
        {tab ? (
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-extrabold tracking-tight text-white">{tab.title}</h1>
              <p className="text-[11px] text-slate-400">{tab.subtitle}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Geri"
              className="grid h-9 w-9 place-items-center rounded-xl bg-surface-soft text-slate-300 transition active:scale-95 hover:bg-surface-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-white">{resolveSubTitle(path)}</h1>
          </div>
        )}

        {showProfileButton && (
          <button
            type="button"
            onClick={() => navigate('/profil')}
            aria-label="Profil"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-slate-300 transition active:scale-95 hover:bg-surface-muted hover:text-brand-300"
          >
            <User className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  )
}
