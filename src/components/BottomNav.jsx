import { NavLink } from 'react-router-dom'
import { BookText, List, Mic } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/kelimeler', label: 'Kelimeler', icon: BookText },
  { to: '/uniteler', label: 'Üniteler', icon: List },
  { to: '/ye-ruhe', label: 'Ye Ruhe', icon: Mic },
]

export default function BottomNav() {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-white/5 bg-surface/90 backdrop-blur-lg">
      <ul className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} className="group flex flex-col items-center gap-1 py-2.5">
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'grid h-10 w-14 place-items-center rounded-2xl transition-all duration-200',
                      isActive
                        ? 'bg-brand-500/15 text-brand-300'
                        : 'text-slate-500 group-hover:text-slate-300',
                    ].join(' ')}
                  >
                    <Icon
                      className={[
                        'h-5 w-5 transition-transform',
                        isActive ? 'scale-110' : 'group-active:scale-95',
                      ].join(' ')}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                  </span>
                  <span
                    className={[
                      'text-[11px] font-medium transition-colors',
                      isActive ? 'text-brand-300' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
