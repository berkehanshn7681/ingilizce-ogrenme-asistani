/**
 * Ye Ruhe "öğretmen" değerlendirme mantığı.
 *
 * evaluateResponse(userText, turn, scenario) -> { type, message }
 *   type: 'needs-improvement' | 'incorrect' | 'correct'
 *
 * NOT: Gerçek bir LLM/gramer motoru olmadan, hafif sezgisel (heuristic)
 * kurallar kullanılır: cevap uzunluğu, belirgin gramer hataları ve konu
 * ilgisi (anahtar kelime örtüşmesi). İleride bu fonksiyonun içi bir yapay
 * zekâ değerlendirme API'siyle değiştirilebilir.
 */

// Belirgin (net) gramer hataları ve nazik düzeltmeleri
export const GRAMMAR_RULES = [
  { test: /\bi is\b/, correction: 'Small correction: we say "I am", not "I is". Please try again.' },
  { test: /\bi are\b/, correction: 'It should be "I am", not "I are". Try once more.' },
  { test: /\b(he|she|it) are\b/, correction: 'Use "is" here, for example "he is" or "she is". Give it another go.' },
  { test: /\b(we|they|you) is\b/, correction: 'Use "are" here, for example "they are" or "we are". Please try again.' },
  { test: /\b(he|she|it) don't\b/, correction: 'With he, she or it we say "doesn\'t", not "don\'t". Try again.' },
  { test: /\bi has\b/, correction: 'We say "I have", not "I has". Please try again.' },
  { test: /\bmuch (people|friends|things|books|cars|places|cities)\b/, correction: 'Use "many" with countable nouns, for example "many people". Try again.' },
  { test: /\bmore better\b/, correction: 'Just say "better", not "more better". Please try again.' },
]

export function evaluateResponse(rawText, turn, scenario) {
  const text = (rawText || '').trim()
  const words = text ? text.split(/\s+/).filter(Boolean) : []

  // 1) Çok kısa / boş cevap -> daha fazla detay iste
  if (words.length < 3) {
    return {
      type: 'needs-improvement',
      message:
        words.length === 0
          ? "I didn't quite catch that. Could you please answer in a full sentence?"
          : 'Could you give me a bit more detail? Please answer in a full sentence.',
    }
  }

  const padded = ' ' + text.toLowerCase() + ' '

  // 2) Belirgin gramer hatası -> nazikçe düzelt
  const rule = GRAMMAR_RULES.find((r) => r.test.test(padded))
  if (rule) {
    return { type: 'incorrect', message: rule.correction }
  }

  // 3) Konu dışı (best-effort): kısa cevapta hiç anahtar kelime örtüşmesi yoksa
  const keywords = (turn && turn.keywords) || []
  if (keywords.length && words.length <= 6) {
    const hit = keywords.some((k) => padded.includes(' ' + k.toLowerCase()))
    if (!hit) {
      return {
        type: 'incorrect',
        message:
          'Hmm, that seems a little off-topic. Please try to answer the question directly, in English.',
      }
    }
  }

  // 4) İyi cevap -> olumlu pekiştirme (senaryonun onay cümlelerinden)
  const acks = (scenario && scenario.acks && scenario.acks.length && scenario.acks) || [
    'Great job!',
    'Well said!',
    'Perfect!',
  ]
  const praise = acks[Math.floor(Math.random() * acks.length)]
  return { type: 'correct', message: praise }
}
