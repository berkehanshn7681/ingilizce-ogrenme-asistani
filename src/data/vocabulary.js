/**
 * Kelimeler modülü veri katmanı — Oxford 3000 (A1–C2).
 *
 * VERİ KAYNAĞI:
 * Tam Oxford 3000 listesi (İngilizce + Türkçe + CEFR seviyesi) ilk açılışta
 * uzak bir JSON kaynağından indirilir, normalize edilir ve localStorage'a
 * yazılır. Sonraki açılışlarda (çevrimdışı dâhil) önbellekten okunur.
 * İndirme başarısız olursa aşağıdaki `FALLBACK_VOCABULARY` (özenle seçilmiş
 * ~120 kelime) kullanılır; böylece uygulama her koşulda çalışır.
 *
 * word shape: { id, level, word, translation, type, example?, exampleTr? }
 * level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
 */

export const CEFR_LEVELS = [
  { id: 'a1', label: 'A1', name: 'Başlangıç', desc: 'Günlük temel kelimeler', gradient: 'from-emerald-500/25 to-emerald-700/10' },
  { id: 'a2', label: 'A2', name: 'Temel', desc: 'Sık kullanılan kelimeler', gradient: 'from-teal-500/25 to-teal-700/10' },
  { id: 'b1', label: 'B1', name: 'Orta', desc: 'Bağımsız kullanım', gradient: 'from-sky-500/25 to-sky-700/10' },
  { id: 'b2', label: 'B2', name: 'Orta-Üstü', desc: 'Akıcı iletişim', gradient: 'from-indigo-500/25 to-indigo-700/10' },
  { id: 'c1', label: 'C1', name: 'İleri', desc: 'Etkili ve esnek dil', gradient: 'from-violet-500/25 to-violet-700/10' },
  { id: 'c2', label: 'C2', name: 'Ustalık', desc: 'Ana dile yakın seviye', gradient: 'from-fuchsia-500/25 to-fuchsia-700/10' },
]

export const LEVEL_ORDER = { a1: 0, a2: 1, b1: 2, b2: 3, c1: 4, c2: 5 }

/** Günlük hedef: bir oturumda gösterilecek kelime sayısı. */
export const SESSION_SIZE = 20

const SOURCE_URL =
  'https://gist.githubusercontent.com/enciyo/0cc13513b587999fe686ed22f46b4e1b/raw/oxford_3000_tr_en_type.json'
const CACHE_KEY = 'eng-asistan/oxford3000-v1'

// Çevrimdışı / yedek liste (indirme başarısız olursa) --------------------------
const FALLBACK_VOCABULARY = [
  // A1
  { id: 'a1-1', level: 'a1', word: 'house', translation: 'ev', type: 'noun', example: 'This is my house.', exampleTr: 'Bu benim evim.' },
  { id: 'a1-2', level: 'a1', word: 'water', translation: 'su', type: 'noun', example: 'The water is cold.', exampleTr: 'Su soğuk.' },
  { id: 'a1-3', level: 'a1', word: 'book', translation: 'kitap', type: 'noun', example: 'I read a book.', exampleTr: 'Bir kitap okurum.' },
  { id: 'a1-4', level: 'a1', word: 'friend', translation: 'arkadaş', type: 'noun', example: 'She is my friend.', exampleTr: 'O benim arkadaşım.' },
  { id: 'a1-5', level: 'a1', word: 'day', translation: 'gün', type: 'noun', example: 'Have a nice day.', exampleTr: 'İyi günler.' },
  { id: 'a1-6', level: 'a1', word: 'eat', translation: 'yemek yemek', type: 'verb', example: 'We eat at noon.', exampleTr: 'Öğlen yemek yeriz.' },
  { id: 'a1-7', level: 'a1', word: 'go', translation: 'gitmek', type: 'verb', example: 'I go to school.', exampleTr: 'Okula giderim.' },
  { id: 'a1-8', level: 'a1', word: 'big', translation: 'büyük', type: 'adjective', example: 'It is a big city.', exampleTr: 'Bu büyük bir şehir.' },
  { id: 'a1-9', level: 'a1', word: 'happy', translation: 'mutlu', type: 'adjective', example: 'I am very happy.', exampleTr: 'Çok mutluyum.' },
  { id: 'a1-10', level: 'a1', word: 'family', translation: 'aile', type: 'noun', example: 'I love my family.', exampleTr: 'Ailemi seviyorum.' },
  { id: 'a1-11', level: 'a1', word: 'time', translation: 'zaman', type: 'noun' },
  { id: 'a1-12', level: 'a1', word: 'man', translation: 'adam', type: 'noun' },
  { id: 'a1-13', level: 'a1', word: 'woman', translation: 'kadın', type: 'noun' },
  { id: 'a1-14', level: 'a1', word: 'child', translation: 'çocuk', type: 'noun' },
  { id: 'a1-15', level: 'a1', word: 'work', translation: 'çalışmak', type: 'verb' },
  { id: 'a1-16', level: 'a1', word: 'come', translation: 'gelmek', type: 'verb' },
  { id: 'a1-17', level: 'a1', word: 'see', translation: 'görmek', type: 'verb' },
  { id: 'a1-18', level: 'a1', word: 'know', translation: 'bilmek', type: 'verb' },
  { id: 'a1-19', level: 'a1', word: 'small', translation: 'küçük', type: 'adjective' },
  { id: 'a1-20', level: 'a1', word: 'new', translation: 'yeni', type: 'adjective' },

  // A2
  { id: 'a2-1', level: 'a2', word: 'travel', translation: 'seyahat etmek', type: 'verb', example: 'I love to travel.', exampleTr: 'Seyahat etmeyi severim.' },
  { id: 'a2-2', level: 'a2', word: 'weather', translation: 'hava durumu', type: 'noun', example: 'The weather is nice.', exampleTr: 'Hava güzel.' },
  { id: 'a2-3', level: 'a2', word: 'money', translation: 'para', type: 'noun', example: 'I have some money.', exampleTr: 'Biraz param var.' },
  { id: 'a2-4', level: 'a2', word: 'health', translation: 'sağlık', type: 'noun', example: 'Health is important.', exampleTr: 'Sağlık önemlidir.' },
  { id: 'a2-5', level: 'a2', word: 'busy', translation: 'meşgul', type: 'adjective', example: 'I am busy today.', exampleTr: 'Bugün meşgulüm.' },
  { id: 'a2-6', level: 'a2', word: 'remember', translation: 'hatırlamak', type: 'verb', example: 'I remember you.', exampleTr: 'Seni hatırlıyorum.' },
  { id: 'a2-7', level: 'a2', word: 'decide', translation: 'karar vermek', type: 'verb', example: 'You must decide now.', exampleTr: 'Şimdi karar vermelisin.' },
  { id: 'a2-8', level: 'a2', word: 'country', translation: 'ülke', type: 'noun', example: 'Italy is a country.', exampleTr: 'İtalya bir ülkedir.' },
  { id: 'a2-9', level: 'a2', word: 'holiday', translation: 'tatil', type: 'noun', example: 'We are on holiday.', exampleTr: 'Tatildeyiz.' },
  { id: 'a2-10', level: 'a2', word: 'important', translation: 'önemli', type: 'adjective', example: 'This is important.', exampleTr: 'Bu önemli.' },
  { id: 'a2-11', level: 'a2', word: 'city', translation: 'şehir', type: 'noun' },
  { id: 'a2-12', level: 'a2', word: 'job', translation: 'iş', type: 'noun' },
  { id: 'a2-13', level: 'a2', word: 'music', translation: 'müzik', type: 'noun' },
  { id: 'a2-14', level: 'a2', word: 'morning', translation: 'sabah', type: 'noun' },
  { id: 'a2-15', level: 'a2', word: 'night', translation: 'gece', type: 'noun' },
  { id: 'a2-16', level: 'a2', word: 'buy', translation: 'satın almak', type: 'verb' },
  { id: 'a2-17', level: 'a2', word: 'learn', translation: 'öğrenmek', type: 'verb' },
  { id: 'a2-18', level: 'a2', word: 'help', translation: 'yardım etmek', type: 'verb' },
  { id: 'a2-19', level: 'a2', word: 'start', translation: 'başlamak', type: 'verb' },
  { id: 'a2-20', level: 'a2', word: 'clean', translation: 'temiz', type: 'adjective' },

  // B1
  { id: 'b1-1', level: 'b1', word: 'environment', translation: 'çevre', type: 'noun', example: 'We must protect the environment.', exampleTr: 'Çevreyi korumalıyız.' },
  { id: 'b1-2', level: 'b1', word: 'experience', translation: 'deneyim', type: 'noun', example: 'It was a great experience.', exampleTr: 'Harika bir deneyimdi.' },
  { id: 'b1-3', level: 'b1', word: 'suggest', translation: 'önermek', type: 'verb', example: 'I suggest a short break.', exampleTr: 'Kısa bir mola öneriyorum.' },
  { id: 'b1-4', level: 'b1', word: 'improve', translation: 'geliştirmek', type: 'verb', example: 'I want to improve my English.', exampleTr: 'İngilizcemi geliştirmek istiyorum.' },
  { id: 'b1-5', level: 'b1', word: 'realize', translation: 'fark etmek', type: 'verb', example: 'I realize my mistake.', exampleTr: 'Hatamı fark ediyorum.' },
  { id: 'b1-6', level: 'b1', word: 'opportunity', translation: 'fırsat', type: 'noun', example: 'This is a good opportunity.', exampleTr: 'Bu iyi bir fırsat.' },
  { id: 'b1-7', level: 'b1', word: 'society', translation: 'toplum', type: 'noun', example: 'Society is changing.', exampleTr: 'Toplum değişiyor.' },
  { id: 'b1-8', level: 'b1', word: 'knowledge', translation: 'bilgi', type: 'noun', example: 'Knowledge is power.', exampleTr: 'Bilgi güçtür.' },
  { id: 'b1-9', level: 'b1', word: 'achieve', translation: 'başarmak', type: 'verb', example: 'You can achieve your goals.', exampleTr: 'Hedeflerine ulaşabilirsin.' },
  { id: 'b1-10', level: 'b1', word: 'develop', translation: 'geliştirmek', type: 'verb', example: 'They develop new apps.', exampleTr: 'Yeni uygulamalar geliştirirler.' },
  { id: 'b1-11', level: 'b1', word: 'culture', translation: 'kültür', type: 'noun' },
  { id: 'b1-12', level: 'b1', word: 'decision', translation: 'karar', type: 'noun' },
  { id: 'b1-13', level: 'b1', word: 'reduce', translation: 'azaltmak', type: 'verb' },
  { id: 'b1-14', level: 'b1', word: 'affect', translation: 'etkilemek', type: 'verb' },
  { id: 'b1-15', level: 'b1', word: 'benefit', translation: 'fayda', type: 'noun' },
  { id: 'b1-16', level: 'b1', word: 'community', translation: 'topluluk', type: 'noun' },
  { id: 'b1-17', level: 'b1', word: 'education', translation: 'eğitim', type: 'noun' },
  { id: 'b1-18', level: 'b1', word: 'increase', translation: 'artırmak', type: 'verb' },
  { id: 'b1-19', level: 'b1', word: 'support', translation: 'desteklemek', type: 'verb' },
  { id: 'b1-20', level: 'b1', word: 'goal', translation: 'hedef', type: 'noun' },

  // B2
  { id: 'b2-1', level: 'b2', word: 'significant', translation: 'kayda değer', type: 'adjective', example: 'There is a significant change.', exampleTr: 'Kayda değer bir değişim var.' },
  { id: 'b2-2', level: 'b2', word: 'assume', translation: 'varsaymak', type: 'verb', example: 'Do not assume too much.', exampleTr: 'Fazla varsayımda bulunma.' },
  { id: 'b2-3', level: 'b2', word: 'maintain', translation: 'sürdürmek', type: 'verb', example: 'We must maintain quality.', exampleTr: 'Kaliteyi sürdürmeliyiz.' },
  { id: 'b2-4', level: 'b2', word: 'consequence', translation: 'sonuç', type: 'noun', example: 'Every action has a consequence.', exampleTr: 'Her eylemin bir sonucu vardır.' },
  { id: 'b2-5', level: 'b2', word: 'efficient', translation: 'verimli', type: 'adjective', example: 'This method is efficient.', exampleTr: 'Bu yöntem verimli.' },
  { id: 'b2-6', level: 'b2', word: 'attitude', translation: 'tutum', type: 'noun', example: 'She has a positive attitude.', exampleTr: 'Olumlu bir tutumu var.' },
  { id: 'b2-7', level: 'b2', word: 'emphasize', translation: 'vurgulamak', type: 'verb', example: 'I want to emphasize this point.', exampleTr: 'Bu noktayı vurgulamak istiyorum.' },
  { id: 'b2-8', level: 'b2', word: 'reliable', translation: 'güvenilir', type: 'adjective', example: 'He is a reliable friend.', exampleTr: 'O güvenilir bir arkadaş.' },
  { id: 'b2-9', level: 'b2', word: 'influence', translation: 'etki', type: 'noun', example: 'Music has a big influence.', exampleTr: 'Müziğin büyük etkisi vardır.' },
  { id: 'b2-10', level: 'b2', word: 'determine', translation: 'belirlemek', type: 'verb', example: 'Effort determines success.', exampleTr: 'Çaba başarıyı belirler.' },
  { id: 'b2-11', level: 'b2', word: 'approach', translation: 'yaklaşım', type: 'noun' },
  { id: 'b2-12', level: 'b2', word: 'evidence', translation: 'kanıt', type: 'noun' },
  { id: 'b2-13', level: 'b2', word: 'establish', translation: 'kurmak', type: 'verb' },
  { id: 'b2-14', level: 'b2', word: 'tendency', translation: 'eğilim', type: 'noun' },
  { id: 'b2-15', level: 'b2', word: 'crucial', translation: 'çok önemli', type: 'adjective' },
  { id: 'b2-16', level: 'b2', word: 'acknowledge', translation: 'kabul etmek', type: 'verb' },
  { id: 'b2-17', level: 'b2', word: 'adequate', translation: 'yeterli', type: 'adjective' },
  { id: 'b2-18', level: 'b2', word: 'constraint', translation: 'kısıt', type: 'noun' },
  { id: 'b2-19', level: 'b2', word: 'framework', translation: 'çerçeve', type: 'noun' },
  { id: 'b2-20', level: 'b2', word: 'perspective', translation: 'bakış açısı', type: 'noun' },

  // C1
  { id: 'c1-1', level: 'c1', word: 'comprehensive', translation: 'kapsamlı', type: 'adjective', example: 'We need a comprehensive plan.', exampleTr: 'Kapsamlı bir plana ihtiyacımız var.' },
  { id: 'c1-2', level: 'c1', word: 'inevitable', translation: 'kaçınılmaz', type: 'adjective', example: 'Change is inevitable.', exampleTr: 'Değişim kaçınılmazdır.' },
  { id: 'c1-3', level: 'c1', word: 'coherent', translation: 'tutarlı', type: 'adjective', example: 'Write a coherent essay.', exampleTr: 'Tutarlı bir deneme yaz.' },
  { id: 'c1-4', level: 'c1', word: 'profound', translation: 'derin', type: 'adjective', example: 'It had a profound effect.', exampleTr: 'Derin bir etkisi oldu.' },
  { id: 'c1-5', level: 'c1', word: 'advocate', translation: 'savunmak', type: 'verb', example: 'They advocate for reform.', exampleTr: 'Reformu savunuyorlar.' },
  { id: 'c1-6', level: 'c1', word: 'notion', translation: 'kavram', type: 'noun', example: 'It is an old notion.', exampleTr: 'Bu eski bir fikir.' },
  { id: 'c1-7', level: 'c1', word: 'resilient', translation: 'dayanıklı', type: 'adjective', example: 'Children are resilient.', exampleTr: 'Çocuklar dayanıklıdır.' },
  { id: 'c1-8', level: 'c1', word: 'prevail', translation: 'galip gelmek', type: 'verb', example: 'Justice will prevail.', exampleTr: 'Adalet galip gelecek.' },
  { id: 'c1-9', level: 'c1', word: 'intricate', translation: 'karmaşık', type: 'adjective', example: 'The design is intricate.', exampleTr: 'Tasarım karmaşık.' },
  { id: 'c1-10', level: 'c1', word: 'plausible', translation: 'makul', type: 'adjective', example: 'That is a plausible answer.', exampleTr: 'Bu makul bir cevap.' },
  { id: 'c1-11', level: 'c1', word: 'alleviate', translation: 'hafifletmek', type: 'verb' },
  { id: 'c1-12', level: 'c1', word: 'compelling', translation: 'ikna edici', type: 'adjective' },
  { id: 'c1-13', level: 'c1', word: 'diminish', translation: 'azalmak', type: 'verb' },
  { id: 'c1-14', level: 'c1', word: 'foster', translation: 'teşvik etmek', type: 'verb' },
  { id: 'c1-15', level: 'c1', word: 'implication', translation: 'çıkarım', type: 'noun' },
  { id: 'c1-16', level: 'c1', word: 'undermine', translation: 'baltalamak', type: 'verb' },
  { id: 'c1-17', level: 'c1', word: 'viable', translation: 'uygulanabilir', type: 'adjective' },
  { id: 'c1-18', level: 'c1', word: 'robust', translation: 'sağlam', type: 'adjective' },
  { id: 'c1-19', level: 'c1', word: 'scrutinize', translation: 'incelemek', type: 'verb' },
  { id: 'c1-20', level: 'c1', word: 'nuanced', translation: 'incelikli', type: 'adjective' },

  // C2
  { id: 'c2-1', level: 'c2', word: 'ubiquitous', translation: 'her yerde bulunan', type: 'adjective', example: 'Phones are ubiquitous.', exampleTr: 'Telefonlar her yerde.' },
  { id: 'c2-2', level: 'c2', word: 'meticulous', translation: 'titiz', type: 'adjective', example: 'She is meticulous.', exampleTr: 'O çok titiz.' },
  { id: 'c2-3', level: 'c2', word: 'pragmatic', translation: 'faydacı', type: 'adjective', example: 'Take a pragmatic approach.', exampleTr: 'Pragmatik bir yaklaşım benimse.' },
  { id: 'c2-4', level: 'c2', word: 'nuance', translation: 'nüans', type: 'noun', example: 'I understand the nuance.', exampleTr: 'Nüansı anlıyorum.' },
  { id: 'c2-5', level: 'c2', word: 'paradigm', translation: 'paradigma', type: 'noun', example: 'It is a new paradigm.', exampleTr: 'Bu yeni bir paradigma.' },
  { id: 'c2-6', level: 'c2', word: 'ephemeral', translation: 'gelip geçici', type: 'adjective', example: 'Fame is ephemeral.', exampleTr: 'Şöhret gelip geçicidir.' },
  { id: 'c2-7', level: 'c2', word: 'pertinent', translation: 'konuya uygun', type: 'adjective', example: 'Ask a pertinent question.', exampleTr: 'Konuya uygun bir soru sor.' },
  { id: 'c2-8', level: 'c2', word: 'cogent', translation: 'inandırıcı', type: 'adjective', example: 'He made a cogent argument.', exampleTr: 'İnandırıcı bir argüman sundu.' },
  { id: 'c2-9', level: 'c2', word: 'salient', translation: 'göze çarpan', type: 'adjective', example: 'Note the salient points.', exampleTr: 'Göze çarpan noktaları not et.' },
  { id: 'c2-10', level: 'c2', word: 'juxtapose', translation: 'yan yana koymak', type: 'verb', example: 'The film juxtaposes past and present.', exampleTr: 'Film geçmiş ve şimdiyi yan yana koyar.' },
  { id: 'c2-11', level: 'c2', word: 'proliferate', translation: 'çoğalmak', type: 'verb' },
  { id: 'c2-12', level: 'c2', word: 'ostensibly', translation: 'görünüşte', type: 'adverb' },
  { id: 'c2-13', level: 'c2', word: 'paramount', translation: 'en önemli', type: 'adjective' },
  { id: 'c2-14', level: 'c2', word: 'tenuous', translation: 'zayıf, belirsiz', type: 'adjective' },
  { id: 'c2-15', level: 'c2', word: 'archetype', translation: 'arketip', type: 'noun' },
  { id: 'c2-16', level: 'c2', word: 'dichotomy', translation: 'ikilik', type: 'noun' },
  { id: 'c2-17', level: 'c2', word: 'empirical', translation: 'deneysel', type: 'adjective' },
  { id: 'c2-18', level: 'c2', word: 'hegemony', translation: 'hegemonya', type: 'noun' },
  { id: 'c2-19', level: 'c2', word: 'idiosyncratic', translation: 'kendine özgü', type: 'adjective' },
  { id: 'c2-20', level: 'c2', word: 'proponent', translation: 'savunucu', type: 'noun' },
]

// Normalizasyon yardımcıları -------------------------------------------------
const TYPE_MAP = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  prep: 'preposition',
  conj: 'conjunction',
  pron: 'pronoun',
  det: 'determiner',
  num: 'number',
  excl: 'exclamation',
  int: 'exclamation',
  modal: 'modal',
  aux: 'auxiliary',
  article: 'determiner',
}

const normType = (raw) => {
  if (!raw) return 'other'
  const first = String(raw).split(/[,/]/)[0].trim().replace(/\./g, '').toLowerCase()
  return TYPE_MAP[first] || 'other'
}

const normLevel = (raw) => {
  const l = String(raw || '').trim().toLowerCase()
  return LEVEL_ORDER[l] !== undefined ? l : 'a1'
}

const byLevelThenWord = (a, b) => {
  const lv = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
  if (lv !== 0) return lv
  return a.word.toLowerCase().localeCompare(b.word.toLowerCase(), 'en')
}

/** Uzak kaynaktaki ham diziyi uygulama şekline dönüştürür (A1 → C2 sıralı). */
function normalizeOxford(rawList) {
  if (!Array.isArray(rawList)) return []
  const seen = new Set()
  const items = []
  for (const e of rawList) {
    const word = String(e.word || e.en || '').trim()
    const translation = String(e.meaning || e.tr || '').trim()
    if (!word || !translation) continue
    const key = word.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ word, translation, type: normType(e.type), level: normLevel(e.level) })
  }
  items.sort(byLevelThenWord)
  return items.map((it, i) => ({
    id: `ox-${String(i + 1).padStart(4, '0')}`,
    word: it.word,
    translation: it.translation,
    type: it.type,
    level: it.level,
  }))
}

// Durum (module-level) -------------------------------------------------------
const sortedFallback = [...FALLBACK_VOCABULARY].sort(byLevelThenWord)

let _words = sortedFallback
let _loadedFull = false
let _inflight = null

// Açılışta önbelleği (varsa) senkron oku
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const cached = window.localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length >= 500) {
        _words = parsed
        _loadedFull = true
      }
    }
  }
} catch {
  /* önbellek okunamadı, yedek liste ile devam */
}

/**
 * Tam Oxford 3000 listesini garanti eder.
 * Önbellekte yoksa uzak kaynaktan indirir, normalize eder ve önbelleğe yazar.
 * Hata durumunda mevcut listeyi (yedek) döndürür — uygulama asla kırılmaz.
 * @returns {Promise<Array>}
 */
export function ensureOxford3000() {
  if (_loadedFull) return Promise.resolve(_words)
  if (_inflight) return _inflight

  _inflight = (async () => {
    try {
      const res = await fetch(SOURCE_URL, { cache: 'force-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const norm = normalizeOxford(raw)
      if (norm.length >= 500) {
        _words = norm
        _loadedFull = true
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(norm))
        } catch {
          /* kota dolabilir; önbelleksiz devam */
        }
      }
      return _words
    } catch (err) {
      console.warn('Oxford 3000 indirilemedi, yerel liste kullanılıyor:', err)
      return _words
    } finally {
      _inflight = null
    }
  })()

  return _inflight
}

/** Şu an bellekte olan tüm kelimeler (A1 → C2 sıralı). */
export const getAllVocabulary = () => _words

/** Belirli seviyedeki kelimeler. */
export const getVocabularyByLevel = (level) =>
  _words.filter((w) => w.level === String(level).toLowerCase())

/** Seviye meta bilgisi. */
export const getLevelMeta = (level) =>
  CEFR_LEVELS.find((l) => l.id === String(level).toLowerCase())

/** Toplam kelime sayısı. */
export const getWordCount = () => _words.length

/** Tam kütüphane yüklendi mi? (3000+ kelime) */
export const isFullLoaded = () => _loadedFull
