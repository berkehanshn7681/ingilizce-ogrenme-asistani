/**
 * Üniteler (İnteraktif Gramer Lab) için dinamik içerik motoru.
 *
 * NOT (LLM ENTEGRASYONU):
 * `fetchPracticeContent` bir Promise döndürür. Şu an içeriği yerel bir havuzdan
 * rastgele seçerek "sonsuz alıştırma" hissi verir. Gerçek bir LLM API'sine
 * geçmek için tek yapılması gereken `fetchPracticeContent` gövdesini bir
 * `fetch(...)` çağrısıyla değiştirmektir; bileşenler (GrammarPractice) zaten
 * async/loading akışına göre yazılmıştır.
 *
 * Beklenen içerik şekli:
 * {
 *   unitId, reading: string,
 *   gapFills: [{ id, sentence, answer, alts }],
 *   questions: [string, string, string],
 *   keywords: string[]
 * }
 */

const CONTENT = {
  'present-simple': {
    readings: [
      "Every morning Mia wakes up at seven. She drinks a cup of coffee and reads the news. She works at a hospital and helps sick people. She usually finishes at five.",
      "Sam lives in a small village. He walks to work every day because he does not have a car. On weekends he visits his parents and they cook dinner together.",
    ],
    gapFills: [
      { sentence: 'She ___ (go) to work by bus every day.', answer: 'goes' },
      { sentence: 'They ___ (not / like) cold weather.', answer: "don't like", alts: ['do not like'] },
      { sentence: '___ (he / play) tennis on Sundays?', answer: 'Does he play' },
      { sentence: 'Water ___ (boil) at one hundred degrees.', answer: 'boils' },
    ],
    questions: [
      'What do you usually do every morning?',
      'Where do you live, and what do you like about it?',
      'What does your best friend do in their free time?',
      'How often do you read or exercise?',
    ],
    keywords: ['every', 'usually', 'always', 'often', 'work', 'live', 'play', 'like', 'go', 'read', 'study', 'morning'],
  },

  'present-continuous': {
    readings: [
      "Right now, I am sitting in a café near the river. A waiter is bringing my coffee, and two children are playing outside. The sun is shining and everyone is smiling.",
      "Look at the street! It is raining heavily and people are running to their cars. A dog is barking and a man is trying to open his umbrella.",
    ],
    gapFills: [
      { sentence: 'Listen! The baby ___ (cry).', answer: 'is crying' },
      { sentence: 'They ___ (not / work) at the moment.', answer: "aren't working", alts: ['are not working'] },
      { sentence: 'What ___ (you / do) right now?', answer: 'are you doing' },
      { sentence: 'We ___ (have) dinner at the moment.', answer: 'are having' },
    ],
    questions: [
      'What are you doing right now?',
      'What is happening around you at the moment?',
      'What are you wearing today?',
      'What are your friends or family doing these days?',
    ],
    keywords: ['now', 'moment', 'currently', 'today', 'am', 'is', 'are', 'doing', 'happening', 'wearing', 'working', 'reading'],
  },

  'past-simple': {
    readings: [
      "Last summer we traveled to Italy. We visited old cities, ate delicious pizza and swam in the sea. One evening we watched a beautiful sunset and took many photos.",
      "Yesterday Tom had a busy day. He woke up early, went to the gym and then studied for his exam. In the evening he called his family and cooked pasta.",
    ],
    gapFills: [
      { sentence: 'I ___ (see) a good film yesterday.', answer: 'saw' },
      { sentence: 'They ___ (not / come) to the party.', answer: "didn't come", alts: ['did not come'] },
      { sentence: '___ (you / visit) Paris last year?', answer: 'Did you visit' },
      { sentence: 'She ___ (buy) a new phone last week.', answer: 'bought' },
    ],
    questions: [
      'What did you do last weekend?',
      'Where did you go on your last holiday?',
      'What was the last film you watched?',
      'Tell me about something interesting you did yesterday.',
    ],
    keywords: ['yesterday', 'last', 'ago', 'went', 'did', 'saw', 'was', 'were', 'visited', 'played', 'watched', 'bought'],
  },

  'past-continuous': {
    readings: [
      "At eight o'clock last night, I was reading a book while my brother was playing video games. Our mother was cooking dinner and the rain was falling outside.",
      "When the phone rang, I was taking a shower. My sister was watching TV and my father was working in the garden, so nobody heard it at first.",
    ],
    gapFills: [
      { sentence: 'While I ___ (walk) home, it started to rain.', answer: 'was walking' },
      { sentence: 'They ___ (not / listen) when the teacher spoke.', answer: "weren't listening", alts: ['were not listening'] },
      { sentence: 'What ___ (you / do) at ten last night?', answer: 'were you doing' },
      { sentence: 'She ___ (cook) when the guests arrived.', answer: 'was cooking' },
    ],
    questions: [
      "What were you doing yesterday evening at eight o'clock?",
      'What were you doing when you last heard some big news?',
      'Were you sleeping or working late last night?',
      'Describe what was happening around you this morning.',
    ],
    keywords: ['while', 'when', 'was', 'were', 'doing', 'cooking', 'walking', 'playing', 'working', 'last', 'night', 'evening'],
  },

  'present-perfect': {
    readings: [
      "I have lived in this city for ten years. I have made many friends and have visited almost every museum. However, I have never tried the famous local dessert.",
      "She has just finished her first novel. She has already sent it to three publishers, but she hasn't received an answer yet. She has worked very hard.",
    ],
    gapFills: [
      { sentence: 'I ___ (never / be) to Japan.', answer: 'have never been' },
      { sentence: 'She ___ (just / finish) her homework.', answer: 'has just finished' },
      { sentence: '___ (you / ever / eat) sushi?', answer: 'Have you ever eaten' },
      { sentence: 'We ___ (not / see) that film yet.', answer: "haven't seen", alts: ['have not seen'] },
    ],
    questions: [
      'What countries have you visited?',
      'What is something you have never done but want to try?',
      'Have you learned anything new recently?',
      'What is the best book or film you have ever experienced?',
    ],
    keywords: ['have', 'has', 'ever', 'never', 'already', 'yet', 'just', 'been', 'done', 'seen', 'visited', 'since'],
  },

  future: {
    readings: [
      "Next year I am going to start a new job in another city. I will rent a small flat near the office. I think I will meet many new people and learn a lot.",
      "The forecast says it will be sunny tomorrow. We are going to have a picnic in the park. My friends will bring food and I will bring the music.",
    ],
    gapFills: [
      { sentence: 'I think it ___ (rain) tomorrow.', answer: 'will rain' },
      { sentence: 'They ___ (going to / travel) next month.', answer: 'are going to travel' },
      { sentence: '___ (you / help) me later?', answer: 'Will you help' },
      { sentence: 'She ___ (not / come) to the meeting.', answer: "won't come", alts: ['will not come'] },
    ],
    questions: [
      'What are you going to do this weekend?',
      'What do you think the world will be like in twenty years?',
      'What are your plans for the future?',
      'Where will you travel next?',
    ],
    keywords: ['will', 'going', 'tomorrow', 'next', 'future', 'plan', 'soon', 'later', 'travel'],
  },

  conditionals: {
    readings: [
      "If it rains tomorrow, we will stay at home and watch films. If I had more free time, I would learn to play the guitar. Life is full of small choices.",
      "If you heat ice, it melts. If I win the lottery, I will travel around the world. But if I had studied harder, I would have passed the exam.",
    ],
    gapFills: [
      { sentence: 'If it ___ (rain), we will cancel the trip.', answer: 'rains' },
      { sentence: 'If I ___ (be) you, I would apologize.', answer: 'were', alts: ['was'] },
      { sentence: 'She would help if she ___ (have) time.', answer: 'had' },
      { sentence: 'If you heat water, it ___ (boil).', answer: 'boils' },
    ],
    questions: [
      'What would you do if you won a lot of money?',
      'If you could live anywhere in the world, where would you live?',
      'What will you do if the weather is bad this weekend?',
      'If you could change one thing about your city, what would it be?',
    ],
    keywords: ['if', 'would', 'will', 'were', 'had', 'could', 'when', 'unless'],
  },

  modals: {
    readings: [
      "You should drink more water and you must not skip breakfast. You can walk to work if you want to stay healthy. You might feel tired at first, but it helps.",
      "In a library, you must be quiet. You can borrow books, but you should return them on time. You mustn't eat near the computers.",
    ],
    gapFills: [
      { sentence: 'You ___ see a doctor. (tavsiye: should)', answer: 'should' },
      { sentence: 'He ___ speak three languages. (yetenek: can)', answer: 'can' },
      { sentence: 'You ___ smoke here. (yasak: must not)', answer: 'must not', alts: ["mustn't"] },
      { sentence: '___ I ask a question? (izin: may)', answer: 'May' },
    ],
    questions: [
      'What should a tourist do in your city?',
      'What can you do that most people cannot?',
      'What must students do to succeed?',
      'What should people do to stay healthy?',
    ],
    keywords: ['should', 'must', 'can', 'could', 'may', 'might', 'have', 'ought', 'shouldn', 'cannot'],
  },

  comparatives: {
    readings: [
      "My new phone is faster than my old one, but it is more expensive. The blue car is the most beautiful in the shop, and it is also the safest.",
      "Winter is colder than autumn. Mount Everest is the highest mountain in the world. For me, reading is more relaxing than watching television.",
    ],
    gapFills: [
      { sentence: 'A train is ___ (fast) than a bus.', answer: 'faster' },
      { sentence: 'This is the ___ (good) film I have ever seen.', answer: 'best' },
      { sentence: 'Gold is ___ (expensive) than silver.', answer: 'more expensive' },
      { sentence: 'She is the ___ (tall) girl in the class.', answer: 'tallest' },
    ],
    questions: [
      'What is the best city you have ever visited?',
      'Is life today easier or harder than in the past? Why?',
      'Who is the most interesting person you know?',
      'What is more important to you, money or free time? Why?',
    ],
    keywords: ['than', 'more', 'most', 'best', 'better', 'less', 'biggest', 'faster', 'easier', 'as'],
  },

  passive: {
    readings: [
      "The bridge was built in 1920. Every year, it is visited by thousands of tourists. Last month, it was repaired by a local company and now it is used again.",
      "Coffee is grown in many countries. The beans are picked by hand and then they are dried in the sun. Finally, the coffee is sold all around the world.",
    ],
    gapFills: [
      { sentence: 'The letter ___ (send) yesterday.', answer: 'was sent' },
      { sentence: 'English ___ (speak) in many countries.', answer: 'is spoken' },
      { sentence: 'The room ___ (clean) every day.', answer: 'is cleaned' },
      { sentence: 'The cars ___ (make) in Germany.', answer: 'are made' },
    ],
    questions: [
      'What famous building was built in your country?',
      'What products are made in your city or region?',
      'Tell me about something that is celebrated in your culture.',
      'What languages are spoken in your family?',
    ],
    keywords: ['was', 'were', 'is', 'are', 'by', 'made', 'built', 'spoken', 'done', 'used', 'grown', 'sold'],
  },
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const buildLocalPractice = (unitId) => {
  const data = CONTENT[unitId]
  if (!data) return null
  const gapFills = shuffle(data.gapFills)
    .slice(0, 3)
    .map((g, i) => ({ id: `${unitId}-gap-${i}`, ...g }))
  const questions = shuffle(data.questions).slice(0, 3)
  return {
    unitId,
    reading: pick(data.readings),
    gapFills,
    questions,
    keywords: data.keywords || [],
  }
}

/**
 * Ünite için pratik içeriği getirir. (Şu an yerel; ileride LLM API'si ile değiştirilebilir.)
 * @returns {Promise<object|null>}
 */
export function fetchPracticeContent(unitId) {
  return new Promise((resolve) => {
    // --- LLM entegrasyonu burada olacak ---
    // const res = await fetch('/api/generate-practice', { method:'POST', body: JSON.stringify({ unitId }) })
    // resolve(await res.json())
    // ---------------------------------------
    setTimeout(() => resolve(buildLocalPractice(unitId)), 550)
  })
}

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[.?!,]+$/g, '')
    .replace(/\s+/g, ' ')

/** Boşluk doldurma cevabını doğrular (küçük/büyük harf ve fazla boşluğa duyarsız). */
export function checkGapFill(userInput, item) {
  const u = normalize(userInput)
  if (!u) return false
  const candidates = [item.answer, ...(item.alts || [])].map(normalize)
  return candidates.includes(u)
}

// --- Konuşma analizi (Üniteler → Konuşma adımı) -----------------------------
// Ye Ruhe'den bağımsız, üniteye özel hafif değerlendirme. Kullanıcının sesli
// yanıtını hedef gramerin anahtar kelimeleri ve belirgin gramer hatalarıyla
// karşılaştırır.

const SPEAKING_GRAMMAR_RULES = [
  { test: /\bi is\b/, fix: '“I am” demeliyiz, “I is” değil.' },
  { test: /\bi are\b/, fix: '“I am” demeliyiz, “I are” değil.' },
  { test: /\b(he|she|it) are\b/, fix: 'Burada “is” kullanılır (ör. “he is”, “she is”).' },
  { test: /\b(we|they|you) is\b/, fix: 'Burada “are” kullanılır (ör. “they are”, “we are”).' },
  { test: /\b(he|she|it) don't\b/, fix: 'He/She/It ile “doesn’t” denir, “don’t” değil.' },
  { test: /\bi has\b/, fix: '“I have” demeliyiz, “I has” değil.' },
  { test: /\bmore better\b/, fix: 'Sadece “better” denir, “more better” değil.' },
  { test: /\bdidn't (went|saw|came|had|made)\b/, fix: '“didn’t” sonrası fiilin yalın hâli gelir (ör. “didn’t go”).' },
]

/**
 * Kullanıcının konuşma metnini hedef gramer/konuyla karşılaştırır.
 * @param {string} rawText  Kullanıcının transkripti
 * @param {string[]} keywords  Ünitenin hedef anahtar kelimeleri
 * @returns {{ status:'correct'|'improve'|'incorrect', title:string, message:string, matched:string[] }}
 */
export function analyzeSpeaking(rawText, keywords = []) {
  const text = String(rawText || '').trim()
  const words = text ? text.split(/\s+/).filter(Boolean) : []

  if (words.length < 3) {
    return {
      status: 'improve',
      title: 'Biraz daha detay',
      message:
        words.length === 0
          ? 'Ses algılanamadı. Tam bir cümleyle tekrar dener misin?'
          : 'Cevabın çok kısa. Hedef yapıyı kullanarak tam bir cümle kur.',
      matched: [],
    }
  }

  const padded = ' ' + text.toLowerCase() + ' '

  const rule = SPEAKING_GRAMMAR_RULES.find((r) => r.test.test(padded))
  if (rule) {
    return {
      status: 'incorrect',
      title: 'Küçük bir düzeltme',
      message: rule.fix + ' Sonra tekrar dene.',
      matched: [],
    }
  }

  const matched = keywords.filter((k) => padded.includes(' ' + String(k).toLowerCase()))
  if (keywords.length && matched.length === 0) {
    return {
      status: 'improve',
      title: 'Hedef yapıyı kullan',
      message:
        'Cümlen anlaşılıyor ama bu ünitenin gramer yapısını kullanmayı dene ' +
        `(ör. ${keywords.slice(0, 4).join(', ')}).`,
      matched,
    }
  }

  return {
    status: 'correct',
    title: 'Harika!',
    message: matched.length
      ? `Hedef yapıyı doğru kullandın: ${matched.slice(0, 4).join(', ')}.`
      : 'Akıcı ve doğru bir cevap. Böyle devam et!',
    matched,
  }
}
