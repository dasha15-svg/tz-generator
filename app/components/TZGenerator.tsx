'use client'

import { useState, useRef } from 'react'
import styles from './TZGenerator.module.css'

const NICHES = [
  { id: 'medical', label: '🏥 Медицина / Клініки' },
  { id: 'ecommerce_sports', label: '💪 Спортивне харчування' },
  { id: 'ecommerce_general', label: '🛒 Е-комерція (загальна)' },
  { id: 'construction', label: '🏗 Будівництво / Матеріали' },
  { id: 'hvac', label: '❄️ Кондиціонери / HVAC' },
  { id: 'flooring', label: '🪵 Підлогові покриття' },
  { id: 'local_services', label: '📍 Локальні послуги' },
  { id: 'real_estate', label: '🏠 Нерухомість' },
  { id: 'auto', label: '🚗 Авто' },
  { id: 'beauty', label: '💅 Краса / Дерматологія' },
  { id: 'woodworking', label: '🪚 Деревообробка / Матеріали' },
  { id: 'mobile_accessories', label: '📱 Мобільні аксесуари' },
]

const PAGE_TYPES = [
  { id: 'category', label: 'Категорія / Каталог' },
  { id: 'article', label: 'Стаття / Блог' },
  { id: 'service', label: 'Сторінка послуги' },
  { id: 'landing', label: 'Лендінг' },
  { id: 'product', label: 'Картка товару' },
  { id: 'faq', label: 'FAQ-блок' },
  { id: 'city', label: 'Гео-лендінг (місто)' },
]

const LANGUAGES = [
  { id: 'uk', label: '🇺🇦 Українська' },
  { id: 'ru', label: '🇷🇺 Російська' },
  { id: 'en', label: '🇬🇧 English' },
  { id: 'pl', label: '🇵🇱 Polski' },
]

const CHAR_RANGES = [
  { id: '3000-5000', label: '3000–5000 символів' },
  { id: '5000-7000', label: '5000–7000 символів' },
  { id: '7000-9000', label: '7000–9000 символів' },
  { id: '9000-12000', label: '9000–12000 символів' },
  { id: 'auto', label: 'Авто (за топом)' },
  { id: 'custom', label: 'Свій діапазон...' },
]

interface BatchItem {
  category: string
  mainKeyword: string
  keywords: string
}

interface BatchResult {
  category: string
  mainKeyword: string
  result: string
  status: 'pending' | 'processing' | 'done' | 'error'
}

function buildSystemPrompt(niche: string, pageType: string, language: string, charRange: string, customChars?: string) {
  const langName: Record<string, string> = { uk: 'українська', ru: 'російська', en: 'English', pl: 'polska' }
  const nicheLabel = NICHES.find(n => n.id === niche)?.label ?? niche
  const pageLabel = PAGE_TYPES.find(p => p.id === pageType)?.label ?? pageType
  const charLabel = charRange === 'custom' && customChars
    ? `${customChars} символів`
    : CHAR_RANGES.find(w => w.id === charRange)?.label ?? charRange
  const lang = langName[language] ?? language

  const isMedical = niche === 'medical' || niche === 'beauty'
  const isEcom = niche === 'ecommerce_sports' || niche === 'ecommerce_general'
  const isRealEstate = niche === 'real_estate'

  const nicheSpecific = isMedical
    ? `• Використати цитату лікаря / експерта (пряма мова)
• В кінці додати блок <H3>Джерела</H3> з посиланнями на наукові/медичні джерела
• Для FAQ додати "Детальніше тут" з перелінковкою де доречно
• Тон: доказова медицина, людська мова, без жаргону`
    : isEcom
    ? `• Додати таблицю цін якщо доречно
• Вказати анкори для внутрішньої перелінковки (назва товару → URL категорії)
• Тон: інформаційний, допомагає вибрати продукт
• Перший абзац — основний ключ обов'язково`
    : isRealEstate
    ? `• Аналіз районів / локацій де доречно
• Таблиця або список цін по районах
• Відповісти на питання про іноземців, інвестиції, ризики
• Тон: довірливий, експертний`
    : `• Тон відповідно до ніші
• Списки там де є перелічення 3+ пунктів`

  return `Ти — SEO-редактор агенції iLION Digital. Формуєш ТЗ для копірайтерів за форматом агенції.
Нижче наведено реальні приклади наших ТЗ. Дотримуйся такого ж стилю і структури.

=== ПРИКЛАДИ НАШИХ ТЗ (вивчи формат) ===

ПРИКЛАД 1 (медична клініка, сторінка послуги, укр):
---
ТЗ на написання тексту
https://icsi.clinic/нова_категорія
Основне ключове слово — УЗД калитки
Мета тексту: дати важливу інформацію доступною людською мовою, коректно з погляду доказової медицини.
Кількість символів: 3000-4000
Ключі (мінімум 1 раз): узд органів калитки / узд калитки / узд яєчок / узд мошонки / узд калитки київ / узд калитки ціна
Структура:
H1: УЗД калитки
Вступ: для чого і кому рекомендується
H2: Показання до УЗД органів калитки
H2: Що показує УЗД калитки (список проблем)
H2: Захворювання, що діагностує УЗД мошонки
H2: Підготовка до проведення УЗД калитки
H2: Як проходить процедура УЗД яєчок
H2: Чому варто пройти УЗД калитки в ICSI Clinic (переваги клініки)
H2: УЗД органів калитки: ціна в ICSI Clinic
FAQ: Що таке УЗД органів калитки? / Як підготуватися? / Що показує?
Цитата лікаря: обов'язково
---

ПРИКЛАД 2 (медичний блог, стаття, укр):
---
ТЗ на написання тексту — блог
Тема: Доброякісні пухлини молочної залози
Кількість символів: 7000-8000
Структура:
H1: Доброякісні пухлини молочної залози у жінок
Вступ: поширеність, коротко що це
H2: Види доброякісних пухлин → H3 для кожного виду (Фіброаденома, Кісти, Папілома, Ліпома, Мастопатія)
H2: Симптоми
H2: Причини та фактори (стрес, гормони, спадковість)
H2: Відмінність доброякісної від злоякісної
H2: Методи діагностики
H2: Як лікувати (медикаментозне + оперативне)
H2: Профілактика
H2: Прогноз і ускладнення
H2: Висновки → H3: Джерела
FAQ з посиланням "Детальніше тут"
LSI: фіброаденома, кіста, мастопатія, УЗД, мамолог, біопсія, гормональні порушення
---

ПРИКЛАД 3 (спортивне харчування, категорія, укр):
---
Тема: Казеїн для набору маси
Кількість символів: 2500-3500
Основний ключ — в першому абзаці обов'язково, решта рівномірно
H1: Казеїн для набору маси
Вступ (передмова)
H2: Що таке казеїн для набору маси
H2: Користь казеїну
H2: Як приймати
H2: Кому можна приймати
H2: Скільки коштує казеїн в Києві? (таблиця цін)
FAQ: Чи можна пити замість вечері? / Чи набирають жир? / Коли результат?
LSI: який краще, ціна, відгуки, як приймати, перед сном, рейтинг
---

ПРИКЛАД 4 (нерухомість, стаття, рос):
---
Тема: Купить квартиру в Аликанте
Кількість символів: 4000-5000
Ключі рівномірно по тексту
H1: [з основним ключем]
Вступ: починати з визначення "Дом в Испании"
H2: Продажа квартир в Аликанте
H2: В каком районе Аликанте лучше приобрести квартиру (для ПМЖ, інвестиції, сумнівні райони)
H2: Цены на квартиры в Аликанте (середня вартість м², по районах, ризики)
H2: Почему стоит купить квартиру в Аликанте
FAQ: Сколько стоит? / Почему дешевое жилье? / Можно ли иностранцу купить?
---

=== ПАРАМЕТРИ ПОТОЧНОГО ТЗ ===
НІША: ${nicheLabel} | ТИП: ${pageLabel} | МОВА: ${lang} | ОБСЯГ: ${charLabel}

=== ФОРМАТ ТЗ ЯКЕ ТРЕБА СФОРМУВАТИ ===

---
ТЗ НА НАПИСАННЯ ТЕКСТУ
URL: [URL сторінки якщо відомий]

Основне ключове слово — [основний ключ]

Мета тексту: [1-2 речення — яку користь отримає читач]

ТЕХНІЧНІ ВИМОГИ:
• Мова тексту — ${lang}
• Унікальність від 95%
• Наявність маркованих та нумерованих списків
• Вода не більше 15% — без: вступних конструкцій ("безперечно", "до речі", "нарешті"), синонімів в одному реченні, довгих речень без змісту, безликих оцінок ("актуальний", "ефективний", "сучасний", "унікальний", "карколомний")
• Кількість символів: ${charLabel}
• Текст корисний для користувача
${nicheSpecific}

СТОРІНКИ КОНКУРЕНТІВ ДЛЯ АНАЛІЗУ:
[якщо URL надані — проаналізуй; якщо немає — знайди топ-3 за основним ключем самостійно]

КЛЮЧОВІ СЛОВА (використати кожен мінімум 1 раз у тексті):
• [основний ключ]
• [варіанти і словоформи — кожен з нового рядка]
[LSI-слова окремо після структури]

МЕТА-ТЕГИ:
Title: [до 60 символів, основний ключ на початку]
Description: [140-160 символів, заклик до дії в кінці]

СТРУКТУРА (приблизна, можна перефразувати якщо не логічно):

<H1>: [конкретний заголовок]

Вступ (150-200 символів): [що охопити]

<H2>: [конкретна назва]
→ [Що писати: тези, факти, ключі, обсяг блоку]

<H2>: [конкретна назва]
→ [Що писати...]

[мінімум 4-6 H2, додавати H3 де є класифікації або підтипи]

ОБОВ'ЯЗКОВО включити:
• H2 у форматі питання користувача (long-tail, PAA-стиль) — наприклад: "Коли потрібна консультація ембріолога?", "Як вибрати квартиру в Аликанте для інвестицій?" — це важливо для AI-пошуку та голосового пошуку
• H2 з назвою бренду/клініки якщо є: "Чому обирають [бренд]" або "[Послуга]: ціна в [бренді]"
• FAQ блок в кінці (4-5 питань)

LSI-СЛОВА (вплести природно, не спамити):
[15-20 слів через кому]

АНАЛІЗ КОНКУРЕНТІВ (коротко):
• Спільне у топ-3: структура, обсяг, фішки
• Чим відрізнятись: що додати, чого немає у конкурентів
---

ВАЖЛИВО: Всі H2 — конкретні заголовки. Не "Переваги послуги" а "5 причин пройти УЗД калитки в ICSI Clinic". Відповідай тільки готовим ТЗ без вступів. Мова відповіді: українська.`
}

function parseBatchInput(text: string): BatchItem[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  const items: BatchItem[] = []
  for (const line of lines) {
    const sep = line.includes(';') ? ';' : line.includes('\t') ? '\t' : '|'
    const parts = line.split(sep).map(p => p.trim())
    if (parts.length >= 2 && parts[0] && parts[1]) {
      items.push({
        category: parts[0],
        mainKeyword: parts[1],
        keywords: parts[2] ?? '',
      })
    }
  }
  return items
}

export default function TZGenerator() {
  const [mode, setMode] = useState<'single' | 'batch'>('single')

  // Single mode
  const [niche, setNiche] = useState('ecommerce_sports')
  const [pageType, setPageType] = useState('article')
  const [language, setLanguage] = useState('uk')
  const [charRange, setCharRange] = useState('7000-9000')
  const [customChars, setCustomChars] = useState('')
  const [mainKeyword, setMainKeyword] = useState('')
  const [keywords, setKeywords] = useState('')
  const [competitorUrls, setCompetitorUrls] = useState('')
  const [brand, setBrand] = useState('')
  const [extraContext, setExtraContext] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Batch mode
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchTotal, setBatchTotal] = useState(0)
  const [selectedResult, setSelectedResult] = useState<number | null>(null)
  const [copiedBatch, setCopiedBatch] = useState(false)
  const stopRef = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function callAPI(systemPrompt: string, userMessage: string): Promise<string> {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userMessage }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data.text
  }

  async function generate() {
    if (!mainKeyword.trim()) { setError('Введи основний ключ!'); return }
    setError(''); setLoading(true); setOutput(''); setCopied(false)
    const systemPrompt = buildSystemPrompt(niche, pageType, language, charRange, customChars)
    const userMessage = [
      `Основний ключ: ${mainKeyword.trim()}`,
      keywords.trim() ? `Додаткові ключі: ${keywords.trim()}` : '',
      competitorUrls.trim() ? `URL конкурентів:\n${competitorUrls.trim()}` : `Зроби пошук за ключем "${mainKeyword.trim()}" і проаналізуй топ-3.`,
      brand.trim() ? `Бренд: ${brand.trim()}` : '',
      extraContext.trim() ? `Контекст: ${extraContext.trim()}` : '',
    ].filter(Boolean).join('\n')
    try {
      const text = await callAPI(systemPrompt, userMessage)
      setOutput(text)
    } catch (e: unknown) {
      setError('Помилка: ' + (e instanceof Error ? e.message : String(e)))
    }
    setLoading(false)
  }

  async function runBatch() {
    const items = parseBatchInput(batchInput)
    if (!items.length) { setError('Додай дані у форматі: Категорія | Ключ | Додаткові ключі'); return }
    setError('')
    stopRef.current = false
    setBatchRunning(true)
    setBatchTotal(items.length)
    setBatchProgress(0)
    setSelectedResult(null)

    const results: BatchResult[] = items.map(item => ({
      category: item.category,
      mainKeyword: item.mainKeyword,
      result: '',
      status: 'pending',
    }))
    setBatchResults([...results])

    const systemPrompt = buildSystemPrompt(niche, pageType, language, charRange, customChars)

    for (let i = 0; i < items.length; i++) {
      if (stopRef.current) break
      results[i].status = 'processing'
      setBatchResults([...results])

      const item = items[i]
      const userMessage = [
        `Категорія: ${item.category}`,
        `Основний ключ: ${item.mainKeyword}`,
        item.keywords ? `Додаткові ключі: ${item.keywords}` : `Зроби пошук за ключем "${item.mainKeyword}" і проаналізуй топ-3.`,
        brand.trim() ? `Бренд: ${brand.trim()}` : '',
      ].filter(Boolean).join('\n')

      try {
        const text = await callAPI(systemPrompt, userMessage)
        results[i].result = text
        results[i].status = 'done'
      } catch {
        results[i].result = 'Помилка генерації'
        results[i].status = 'error'
      }

      setBatchProgress(i + 1)
      setBatchResults([...results])

      // Small delay between requests
      if (i < items.length - 1 && !stopRef.current) {
        await new Promise(r => setTimeout(r, 1500))
      }
    }
    setBatchRunning(false)
  }

  function downloadAll() {
    const done = batchResults.filter(r => r.status === 'done')
    const text = done.map(r =>
      `${'='.repeat(60)}\n${r.category} | ${r.mainKeyword}\n${'='.repeat(60)}\n\n${r.result}\n\n`
    ).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tz-ilion.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setBatchInput(text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'))
    }
    reader.readAsText(file)
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoI}>i</span>
            <span className={styles.logoLion}>LION</span>
            <span className={styles.logoDot}>.</span>
            <span className={styles.logoDigital}>digital</span>
            <span className={styles.badge}>ТЗ Генератор</span>
          </div>
          <div className={styles.modeTabs}>
            <button
              className={`${styles.modeTab} ${mode === 'single' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('single')}
            >Одне ТЗ</button>
            <button
              className={`${styles.modeTab} ${mode === 'batch' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('batch')}
            >Масово 🚀</button>
          </div>
          <div className={styles.headerHint}>Аналізує топ-3 і генерує ТЗ за 30 сек</div>
        </div>
      </header>

      <main className={styles.main}>
        {/* SIDEBAR — shared settings */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarScroll}>
            <div className={styles.sectionTitle}>Параметри</div>

            <label style={labelStyle}>Ніша</label>
            <select value={niche} onChange={e => setNiche(e.target.value)}>{NICHES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select>

            <label style={labelStyle}>Тип сторінки</label>
            <select value={pageType} onChange={e => setPageType(e.target.value)}>{PAGE_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select>

            <div className={styles.row2}>
              <div>
                <label style={labelStyle}>Мова</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>{LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
              </div>
              <div>
                <label style={labelStyle}>Обсяг</label>
                <select value={charRange} onChange={e => setCharRange(e.target.value)}>{CHAR_RANGES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}</select>
                {charRange === 'custom' && (
                  <input type="text" value={customChars} onChange={e => setCustomChars(e.target.value)} placeholder="напр. 6000-8000" style={{marginTop:6}} />
                )}
              </div>
            </div>

            <div className={styles.divider} />

            {mode === 'single' ? (
              <>
                <div className={styles.sectionTitle}>Ключові слова</div>
                <label style={labelStyle}>Основний ключ *</label>
                <input type="text" value={mainKeyword} onChange={e => setMainKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()} placeholder="купити протеїн Україна" />

                <label style={labelStyle}>Додаткові ключі</label>
                <textarea value={keywords} onChange={e => setKeywords(e.target.value)} placeholder={'протеїн для набору маси\nсироватковий протеїн'} rows={3} />

                <div className={styles.divider} />
                <div className={styles.sectionTitle}>Додатково</div>

                <label style={labelStyle}>URL конкурентів</label>
                <textarea value={competitorUrls} onChange={e => setCompetitorUrls(e.target.value)} placeholder={'https://...\nhttps://...'} rows={2} />
                <div className={styles.hint}>Якщо порожньо — AI шукає сам</div>

                <label style={labelStyle}>Бренд / сайт</label>
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="ILION, Sporter..." />

                <label style={labelStyle}>Контекст / вимоги</label>
                <textarea value={extraContext} onChange={e => setExtraContext(e.target.value)} placeholder="Особливі вимоги..." rows={2} />

                {error && <div className={styles.error}>{error}</div>}

                <button className={styles.generateBtn} onClick={generate} disabled={loading}>
                  {loading ? <span className={styles.btnLoading}><span className={styles.spinner} /> Генерую...</span> : 'Згенерувати ТЗ'}
                </button>
              </>
            ) : (
              <>
                <div className={styles.sectionTitle}>Загальне</div>
                <label style={labelStyle}>Бренд / сайт</label>
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="ILION, Sporter..." />
                <div className={styles.hint} style={{marginTop:8}}>Ніша, тип і мова застосовуються до всіх ТЗ у списку</div>
              </>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <div className={styles.outputPanel}>

          {/* SINGLE MODE */}
          {mode === 'single' && (
            <>
              <div className={styles.outputHeader}>
                <span className={styles.outputTitle}>📋 Готове ТЗ</span>
                {output && (
                  <div className={styles.outputActions}>
                    <button className={styles.actionBtn} onClick={() => { setOutput(''); setMainKeyword(''); setKeywords(''); }}>Очистити</button>
                    <button className={`${styles.actionBtn} ${copied ? styles.actionBtnSuccess : ''}`} onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2500) }}>
                      {copied ? '✓ Скопійовано!' : 'Копіювати'}
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.outputBody}>
                {loading && <div className={styles.loadingState}><div className={styles.loadingIcon}>🔍</div><div className={styles.loadingText}>Аналізую конкурентів...</div><div className={styles.loadingDots}><span /><span /><span /></div><div className={styles.loadingHint}>20–45 секунд</div></div>}
                {!loading && !output && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <div className={styles.emptyTitle}>Тут з'явиться ТЗ</div>
                    <div className={styles.emptyList}>
                      {['Title + Description', 'H1 + структура H2/H3', 'ТЗ по кожному блоку', 'Вимоги до стилю', 'Аналіз топ-3'].map(t => (
                        <div key={t} className={styles.emptyItem}><span className={styles.check}>✓</span> {t}</div>
                      ))}
                    </div>
                  </div>
                )}
                {!loading && output && <pre className={styles.outputText}>{output}</pre>}
              </div>
            </>
          )}

          {/* BATCH MODE */}
          {mode === 'batch' && (
            <>
              <div className={styles.outputHeader}>
                <span className={styles.outputTitle}>🚀 Масова генерація ТЗ</span>
                {batchResults.some(r => r.status === 'done') && (
                  <div className={styles.outputActions}>
                    <button className={styles.actionBtn} onClick={downloadAll}>⬇ Скачати всі ТЗ (.txt)</button>
                    <button className={`${styles.actionBtn} ${copiedBatch ? styles.actionBtnSuccess : ''}`} onClick={() => {
                      const text = batchResults.filter(r => r.status === 'done').map(r => `===\n${r.category}\n===\n${r.result}`).join('\n\n')
                      navigator.clipboard.writeText(text); setCopiedBatch(true); setTimeout(() => setCopiedBatch(false), 2500)
                    }}>{copiedBatch ? '✓ Скопійовано!' : 'Копіювати все'}</button>
                  </div>
                )}
              </div>

              <div className={styles.batchBody}>
                {/* Input area */}
                {!batchRunning && batchResults.length === 0 && (
                  <div className={styles.batchInput}>
                    <div className={styles.batchFormatHint}>
                      <strong>Формат:</strong> кожен рядок = одне ТЗ<br />
                      <code>Категорія | Основний ключ | Додаткові ключі (необов'язково)</code><br />
                      Розділювач: <code>|</code> або <code>;</code> або <code>Tab</code>
                    </div>
                    <div className={styles.batchExample}>
                      <div className={styles.batchExampleTitle}>Приклад:</div>
                      <pre className={styles.batchExampleText}>{`Протеїн | купити протеїн Україна | сироватковий протеїн, протеїн ціна
Креатин | креатин моногідрат купити | kreatin, creatine ukraine
BCAA | bcaa амінокислоти | bcaa для схуднення`}</pre>
                    </div>
                    <textarea
                      className={styles.batchTextarea}
                      value={batchInput}
                      onChange={e => setBatchInput(e.target.value)}
                      placeholder={`Категорія | Основний ключ | Додаткові ключі\nПротеїн | купити протеїн | сироватковий протеїн\nКреатин | креатин моногідрат | kreatin ukraine`}
                      rows={10}
                    />
                    <div className={styles.batchActions}>
                      <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
                        📎 Завантажити CSV
                      </button>
                      <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleCSV} />
                      <span className={styles.batchCount}>{parseBatchInput(batchInput).length > 0 ? `${parseBatchInput(batchInput).length} позицій` : ''}</span>
                      {error && <span className={styles.batchError}>{error}</span>}
                      <button className={styles.generateBtn} style={{ width: 'auto', padding: '10px 24px' }} onClick={runBatch} disabled={batchRunning}>
                        🚀 Запустити
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress & results */}
                {(batchRunning || batchResults.length > 0) && (
                  <div className={styles.batchResults}>
                    {/* Progress bar */}
                    {batchRunning && (
                      <div className={styles.progressWrap}>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${(batchProgress / batchTotal) * 100}%` }} />
                        </div>
                        <div className={styles.progressText}>{batchProgress} / {batchTotal} ТЗ готово</div>
                        <button className={styles.stopBtn} onClick={() => { stopRef.current = true }}>Зупинити</button>
                      </div>
                    )}

                    <div className={styles.batchGrid}>
                      {/* List */}
                      <div className={styles.batchList}>
                        {batchResults.map((r, i) => (
                          <div
                            key={i}
                            className={`${styles.batchItem} ${selectedResult === i ? styles.batchItemActive : ''}`}
                            onClick={() => r.status === 'done' && setSelectedResult(i)}
                          >
                            <span className={styles.batchItemStatus}>
                              {r.status === 'pending' && '○'}
                              {r.status === 'processing' && '⏳'}
                              {r.status === 'done' && '✓'}
                              {r.status === 'error' && '✗'}
                            </span>
                            <div className={styles.batchItemInfo}>
                              <div className={styles.batchItemCat}>{r.category}</div>
                              <div className={styles.batchItemKey}>{r.mainKeyword}</div>
                            </div>
                            {r.status === 'done' && (
                              <button className={styles.copySmall} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(r.result) }}>copy</button>
                            )}
                          </div>
                        ))}
                        {!batchRunning && (
                          <button className={styles.newBatchBtn} onClick={() => { setBatchResults([]); setBatchProgress(0); setBatchTotal(0); setSelectedResult(null) }}>
                            + Новий список
                          </button>
                        )}
                      </div>

                      {/* Preview */}
                      <div className={styles.batchPreview}>
                        {selectedResult !== null && batchResults[selectedResult]?.status === 'done' ? (
                          <pre className={styles.outputText}>{batchResults[selectedResult].result}</pre>
                        ) : (
                          <div className={styles.batchPreviewEmpty}>
                            {batchRunning ? 'Генерую...' : 'Натисни на позицію щоб переглянути ТЗ'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
