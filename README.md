# İngilizce Öğrenme Asistanı 📚

Kişiselleştirilmiş, **mobil öncelikli** bir İngilizce öğrenme uygulaması.
Arayüz **Türkçe**, öğrenme içeriği **İngilizce**'dir. **PWA** olarak yapılandırılmıştır;
telefonda "Ana ekrana ekle" ile tıpkı yerel bir uygulama gibi kullanılabilir.

## ✨ Özellikler (Faz 1)

- **LocalStorage ile ilerleme takibi** — Açılan üniteler, öğrenilen kelimeler ve quiz
  puanları tarayıcı/uygulama kapansa bile korunur.
- **Dilbilgisi ünite navigasyonu** — "Essential Grammar in Use" esinli üniteler.
  _Ünite 1: Am/Is/Are_ açık başlar; sonraki üniteler önkoşul tamamlanana kadar kilitli
  (🔒) görünür.
- **Oxford 1000 kelime kartları** — Ünite 1 içinde 20 temel kelime. Kartlar tıklayınca
  zarifçe dönerek Türkçe karşılığı gösterir.
  - **Öğrendim** → kelimeyi tekrar döngüsünden çıkarır ve ilerleme çubuğunu günceller.
  - **Tekrar Et** → kelimeyi rotasyonda tutar ve sonraki karta geçer.
- **Mobil için optimize arayüz** — Alt gezinme çubuğu (tek elle başparmak kullanımı),
  koyu tema (derin arduvaz + yumuşak mavi + net beyaz metin).

## 🎯 Özellikler (Faz 2 - Ye Ruhe Sesli Roleplay Asistanı)

Anasayfadaki **"Sesli Pratik"** bölümü, tek birleşik **Ye Ruhe Sesli Asistan**
(`/ye-ruhe`) ekranına yönlendirir. Tüm senaryolar tek bir **canlı, hands-free sesli
roleplay** deneyiminde birleştirildi (eski statik "Aralık Seyahati" okuma/dinleme
sayfası kaldırıldı).

**Senaryo Seçici** (sohbet başlamadan önce): Ye Ruhe seçilen role bürünür.

- 🎓 **Yeterlilik Mülakatı** — Ye Ruhe mülakat görevlisi olur (Kayseri, günlük konuşma).
- ☕ **Paris'te Kafede Sipariş** — Ye Ruhe kafe garsonu olur.
- 🧾 **Brüksel'de Tax-Free Sorma** — Ye Ruhe mağaza görevlisi olur.

**Canlı Sesli Mod (her senaryo için aynı):**

- Ekranın merkezinde büyük, dairesel **Ye Ruhe** (🫏) avatarı; immersive koyu radyal
  degrade arka plan (metin alanı yok).
- **CSS ses dalgaları:** Ye Ruhe konuşurken dışa doğru genişleyen mavi parlayan halkalar;
  kullanıcı dinlenirken yeşil nabız animasyonu (mikrofon aktif göstergesi).
- **Ye Ruhe (TTS):** `window.speechSynthesis`, erkek İngilizce ses, yavaş hız (~0.85).
- **Otomatik dinleme (STT):** Ye Ruhe repliği bitirir bitirmez `webkitSpeechRecognition`
  otomatik devreye girer, kullanıcının İngilizce cevabını dinler ve **altyazı** gösterir.
- **"Sohbeti Başlat"** butonu ilk etkileşimi tetikler ve mikrofon iznini nazikçe ister.
  Bittiğinde **"Tekrar Başlat"** / **"Senaryo Değiştir"** seçenekleri sunulur.

### 🧠 Analitik Öğretmen Modu

- **Akıllı Konuşma Aktivite Tespiti (VAD):** Sistem hemen yanıt vermez; kullanıcı
  sustuktan sonra **1.5 sn sessizlik** beklenir, ancak o zaman cevap işlenir.
- **Görsel durum renkleri:** Dinleme = **yeşil** nabız, analiz = **sarı**, doğru cevap =
  **yeşil** pulse, hatalı/konu dışı = **kırmızı** pulse, yetersiz = **sarı** pulse.
  (CSS halka animasyonları + arka plan degradesi bu durumlara göre değişir.)
- **`evaluateResponse` (öğretmen mantığı):** robotik "I see" yerine cevabı analiz eder:
  - Cevap **3 kelimeden kısa** ise → _needs-improvement_ (sarı): "Could you give me a bit
    more detail?" der ve aynı soruyu tekrar dinler.
  - **Belirgin gramer hatası** ya da **konu dışı** ise → _incorrect_ (kırmızı): nazikçe
    düzeltir ve tekrar dener.
  - Cevap iyiyse → _correct_ (yeşil): olumlu pekiştirme verip sonraki soruya geçer.
  - _Not: Gerçek bir LLM olmadan hafif sezgisel kurallar kullanılır
    (`src/utils/evaluate.js`); ileride bir yapay zekâ API'siyle değiştirilebilir._
- **Dinamik özel senaryolar:** Senaryo seçicinin altındaki **"Yeni Sohbet Başlığı Ekle"**
  alanına bir konu yaz → Ye Ruhe o konuda bir **sohbet partneri** olur ve başlığa göre
  dinamik takip soruları üretir. Özel senaryolar `localStorage`'da saklanır ve silinebilir.

> Sesli okuma/tanıma tarayıcının yerel **Web Speech API**'sini kullanır. En iyi deneyim
> için **Chrome** önerilir; cihazda İngilizce bir ses (voice) yüklü olmalıdır.

## 🛠 Teknolojiler

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [lucide-react](https://lucide.dev/) ikonlar
- PWA: `manifest.json` + elle yazılmış `service worker`

## 🚀 Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu (telefondan test için ağ üzerinden erişilebilir)
npm run dev

# Üretim derlemesi
npm run build

# Derlemeyi önizle (Service worker yalnızca üretimde aktiftir)
npm run preview
```

> **Not:** Service worker yalnızca üretim derlemesinde (`build` / `preview`) kayıt olur.
> PWA'yı test etmek için `npm run build` sonrası `npm run preview` kullanın.

## 📁 Klasör Yapısı

```
.
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ public/
│  ├─ manifest.json          # PWA manifesti
│  ├─ sw.js                  # Service worker (çevrimdışı destek)
│  └─ icons/                 # SVG uygulama ikonları
└─ src/
   ├─ main.jsx               # Giriş + SW kaydı
   ├─ App.jsx                # Rotalar
   ├─ index.css              # Tailwind + kart çevirme stilleri
   ├─ context/
   │  └─ ProgressContext.jsx # İlerleme durumu + kilit mantığı
   ├─ hooks/
   │  ├─ useLocalStorage.js       # localStorage senkronizasyonu
   │  └─ useVoiceConversation.js  # Sesli roleplay: TTS + STT döngüsü (senaryo tabanlı)
   ├─ data/
   │  ├─ units.js            # Dilbilgisi üniteleri
   │  ├─ vocabulary.js       # Oxford 1000 örnek kelimeler
   │  └─ scenarios.js        # Roleplay senaryoları + özel senaryo üreteci
   ├─ utils/
   │  └─ evaluate.js         # Öğretmen değerlendirme mantığı (uzunluk/gramer/konu)
   ├─ components/
   │  ├─ Layout.jsx          # Mobil uygulama kabuğu
   │  ├─ Header.jsx
   │  ├─ BottomNav.jsx       # Alt gezinme çubuğu
   │  ├─ ProgressBar.jsx
   │  ├─ UnitCard.jsx
   │  └─ Flashcard.jsx       # Çevrilebilen kelime kartı
   └─ pages/
      ├─ Dashboard.jsx           # Ünite listesi + Sesli Pratik + genel ilerleme
      ├─ UnitDetail.jsx          # Ünite dilbilgisi özeti
      ├─ Flashcards.jsx          # Kelime kartı destesi
      ├─ VocabularyHub.jsx       # Kelime setleri
      ├─ VoiceAssistant.jsx      # Ye Ruhe sesli roleplay (senaryo seçici + sesli mod)
      └─ Profile.jsx             # İstatistikler, PWA kurulumu, sıfırlama
```

## 🔓 Ünite kilit mantığı

Bir ünitenin açılması için önkoşul ünitesinin **tüm kelimelerinin öğrenilmiş** olması
gerekir. Ünite 1'deki tüm kelimeleri "Öğrendim" olarak işaretlediğinde Ünite 2 otomatik
açılır. Bu mantık `src/context/ProgressContext.jsx` içindedir.

## 🗺 Yol Haritası (sonraki fazlar)

- Ünite başına dilbilgisi alıştırmaları ve quizler
- Daha fazla ünitede kelime setleri
- Tekrar (spaced repetition) algoritması
- Günlük hedef ve seri (streak) takibi
```
