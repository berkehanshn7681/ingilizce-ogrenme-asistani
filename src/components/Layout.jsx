import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'

/**
 * Mobil uygulama kabuğu.
 * Masaüstünde ortalanmış bir "telefon çerçevesi" görünümü verir;
 * mobilde tüm ekranı kaplar. Alt gezinme çubuğu başparmakla
 * tek elle kullanım için ekranın altına sabitlenmiştir.
 */
export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100">
      {/* Masaüstünde ortalanmış mobil kap */}
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-surface shadow-2xl sm:my-0 sm:min-h-[100dvh]">
        <Header />

        {/* İçerik alanı - alt navigasyon için altta boşluk bırakır */}
        <main
          key={location.pathname}
          className="flex-1 overflow-y-auto px-4 pb-28 pt-4 animate-fade-in-up"
        >
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
