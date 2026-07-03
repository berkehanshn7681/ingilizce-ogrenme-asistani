/**
 * Ye Ruhe Sesli Asistan — senaryo üretimi.
 * Kullanıcı üstteki alana bir bağlam (context) yazabilir; Ye Ruhe bu role bürünür.
 * Bağlam boşsa genel günlük sohbet senaryosu kullanılır.
 *
 * NOT: Gerçek bir LLM olmadan, bağlam başlığını kullanan şablon tabanlı sorular
 * üretilir. İleride buradaki `turns` üretimi bir yapay zekâ çağrısıyla
 * değiştirilebilir: turns = await fetchQuestionsFromAI(context)
 */

const ACKS = [
  'Great, well said!',
  'Nice, that is a good answer.',
  'Perfect, keep going!',
  'Well done!',
  'I understand, thank you.',
]

export function buildScenario(rawContext) {
  const context = (rawContext || '').trim().replace(/\s+/g, ' ')

  if (!context) {
    return {
      emoji: '🫏',
      roleLabel: 'Genel Sohbet',
      greeting:
        "Hello! I am Ye Ruhe, your English speaking partner. Let's have a friendly conversation. Please answer in English.",
      turns: [
        {
          text: 'Could you tell me a little bit about yourself?',
          keywords: ['i', 'my', 'am', 'name', 'from', 'live', 'work', 'study', 'student', 'year'],
        },
        {
          text: 'What do you usually do on a typical day?',
          keywords: ['day', 'morning', 'work', 'study', 'go', 'usually', 'eat', 'home', 'evening'],
        },
        {
          text: 'What are your hobbies or interests?',
          keywords: ['like', 'love', 'enjoy', 'hobby', 'play', 'read', 'music', 'sport', 'watch', 'game'],
        },
        {
          text: 'What are your plans for the future?',
          keywords: ['want', 'will', 'going', 'plan', 'future', 'hope', 'study', 'work', 'travel'],
        },
      ],
      acks: ACKS,
      closing: 'That was a lovely chat. Well done today! Keep practicing your English. Goodbye!',
    }
  }

  return {
    emoji: '🫏',
    roleLabel: `Bağlam: ${context}`,
    greeting: `Hello! I am Ye Ruhe. Let's role-play about "${context}". I will be your partner in this situation. Please answer in English.`,
    turns: [
      { text: `Let's begin. Can you tell me about your experience with ${context}?`, keywords: [] },
      { text: `What do you find most interesting about ${context}?`, keywords: [] },
      { text: `Can you describe a situation related to ${context}?`, keywords: [] },
      { text: `Finally, what are your thoughts on the future of ${context}?`, keywords: [] },
    ],
    acks: ACKS,
    closing: `Great conversation about ${context}! You did really well. Goodbye!`,
  }
}
