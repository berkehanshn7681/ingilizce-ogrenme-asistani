import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Vocabulary from './pages/Vocabulary.jsx'
import GrammarUnits from './pages/GrammarUnits.jsx'
import GrammarPractice from './pages/GrammarPractice.jsx'
import YeRuhe from './pages/YeRuhe.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/kelimeler" replace />} />

        {/* 1) Kelimeler modülü (bağımsız) */}
        <Route path="/kelimeler" element={<Vocabulary />} />

        {/* 2) Üniteler modülü (interaktif gramer lab, bağımsız) */}
        <Route path="/uniteler" element={<GrammarUnits />} />
        <Route path="/uniteler/:unitId" element={<GrammarPractice />} />

        {/* 3) Ye Ruhe modülü (sesli AI, bağımsız) */}
        <Route path="/ye-ruhe" element={<YeRuhe />} />

        {/* Yardımcı: Profil (üst menüden erişilir) */}
        <Route path="/profil" element={<Profile />} />

        <Route path="*" element={<Navigate to="/kelimeler" replace />} />
      </Route>
    </Routes>
  )
}
