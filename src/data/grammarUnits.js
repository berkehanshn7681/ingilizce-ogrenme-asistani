/**
 * "Üniteler" (İnteraktif Gramer Lab) modülü için konu listesi.
 * Dinamik alıştırma içeriği için bkz. grammarContent.js
 */

export const GRAMMAR_UNITS = [
  { id: 'present-simple', name: 'Present Simple', tr: 'Geniş zaman — alışkanlıklar ve genel gerçekler', level: 'A1', emoji: '🔁', gradient: 'from-emerald-500/25 to-emerald-700/10' },
  { id: 'present-continuous', name: 'Present Continuous', tr: 'Şimdiki zaman — tam şu an olan eylemler', level: 'A1', emoji: '⏳', gradient: 'from-teal-500/25 to-teal-700/10' },
  { id: 'past-simple', name: 'Past Simple', tr: 'Geçmiş zaman — bitmiş eylemler', level: 'A2', emoji: '⏮️', gradient: 'from-sky-500/25 to-sky-700/10' },
  { id: 'past-continuous', name: 'Past Continuous', tr: 'Geçmişte süregelen eylemler', level: 'B1', emoji: '🎞️', gradient: 'from-cyan-500/25 to-cyan-700/10' },
  { id: 'present-perfect', name: 'Present Perfect', tr: 'Yakın geçmiş ve deneyimler', level: 'B1', emoji: '✅', gradient: 'from-indigo-500/25 to-indigo-700/10' },
  { id: 'future', name: 'Future (will / going to)', tr: 'Gelecek — tahmin ve planlar', level: 'A2', emoji: '🔮', gradient: 'from-blue-500/25 to-blue-700/10' },
  { id: 'conditionals', name: 'Conditionals', tr: 'Koşul cümleleri (if)', level: 'B2', emoji: '🔀', gradient: 'from-violet-500/25 to-violet-700/10' },
  { id: 'modals', name: 'Modal Verbs', tr: 'can / must / should — kip fiilleri', level: 'B1', emoji: '🗝️', gradient: 'from-purple-500/25 to-purple-700/10' },
  { id: 'comparatives', name: 'Comparatives & Superlatives', tr: 'Karşılaştırma ve üstünlük', level: 'A2', emoji: '⚖️', gradient: 'from-amber-500/25 to-amber-700/10' },
  { id: 'passive', name: 'Passive Voice', tr: 'Edilgen çatı', level: 'B2', emoji: '🔄', gradient: 'from-fuchsia-500/25 to-fuchsia-700/10' },
]

export const getGrammarUnit = (id) => GRAMMAR_UNITS.find((u) => u.id === id)
