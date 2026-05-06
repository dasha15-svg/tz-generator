'use client'

import { useState } from 'react'
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

const WORD_RANGES = [
  { id: '300-500', label: '300–500 (коротко)' },
  { id: '600-900', label: '600–900 (середньо)' },
  { id: '1000-1500', label: '1000–1500 (стандарт)' },
  { id: '1500-2500', label: '1500–2500 (розгорнуто)' },
  { id: 'auto', label: 'Авто (за топом)' },
]

function buildSystemPrompt(niche: string, pageType: string, language: string, wordRange: string) {
  const langName: Record<string, string> = {
    uk: 'українська', ru: 'російська', en: 'English', pl: 'polska',
  }
  const nicheLabel = NICHES.find(n => n.id === niche)?.label ?? niche
  const pageLabel = PAGE_TYPES.find(p => p.id === pageType)?.label ?? pageType
  const wordLabel = WORD_RANGES.find(w => w.id === wordRange)?.label ?? wordRange

  return `Ти — досвідчений SEO-редактор і контент-стратег. Твоя задача — формувати чіткі, структуровані ТЗ (технічні завдання) для копірайтерів на основі аналізу конкурентів та ключових слів.

НІША: ${nicheLabel}
ТИП СТОРІНКИ: ${pageLabel}
МОВА ТЕКСТУ: ${langName[language] ?? language}
ОБСЯГ: ${wordLabel}

СТРУКТУРА ТЗ — завжди дотримуйся такого формату:

---
📋 ТЕХНІЧНЕ ЗАВДАННЯ ДЛЯ КОПІРАЙТЕРА
---
🔑 КЛЮЧОВІ СЛОВА
- Основне: [ключ]
- Додаткові: [список через кому]
- LSI/семантика: [список]

📏 ОБСЯГ: [кількість слів]
🌐 МОВА: [мова]

🏷 МЕТА-ТЕГИ
Title: [до 60 символів, основний ключ на початку]
Description: [140–160 символів, заклик до дії в кінці]

📝 СТРУКТУРА ТЕКСТУ

H1: [конкретний варіант — не шаблон, а реальний текст заголовку]

Вступ (1 абзац): [мета, тон, кількість речень, що охопити]

H2: [конкретна назва]
→ [що писати, яких ключів вживати, обсяг цього блоку]

H2: [конкретна назва]
→ [опис блоку...]

[продовжити для всіх розділів]

Висновок / CTA: [що написати у фіналі, заклик до дії]

⚠️ ВИМОГИ ДО СТИЛЮ
- [конкретні правила стилю]
- Заборонені кліше та штампи: [перелік]
- Тон: [формальний / експертний / розмовний]
- Без AI-шаблонності: не починати з "У сучасному світі", "В наш час" тощо
- [інші обмеження]

🔗 ВНУТРІШНЯ ПЕРЕЛІНКОВКА
- [рекомендації які розділи / категорії варто залінкувати]

📊 АНАЛІЗ КОНКУРЕНТІВ (коротко)
- Що є у топ-3: структура, обсяг, фішки, стиль
- Чим відрізнятись: конкретні рекомендації

---

ВАЖЛИВО:
- Давай КОНКРЕТНІ приклади заголовків, не шаблони. Замість "Напишіть про переваги" — "H2: 5 причин обрати сироватковий протеїн для набору маси"
- Якщо є URL конкурентів — проаналізуй структуру, H-теги, обсяг, стиль
- Якщо URL немає — зроби веб-пошук за основним ключем, проаналізуй топ-3
- Відповідай ТІЛЬКИ ТЗ-ком, без вступних фраз
- Мова відповіді: українська (навіть якщо текст буде іншою мовою)`
}

export default function TZGenerator() {
  const [niche, setNiche] = useState('ecommerce_sports')
  const [pageType, setPageType] = useState('article')
  const [language, setLanguage] = useState('uk')
  const [wordRange, setWordRange] = useState('1000-1500')
  const [mainKeyword, setMainKeyword] = useState('')
  const [keywords, setKeywords] = useState('')
  const [competitorUrls, setCompetitorUrls] = useState('')
  const [brand, setBrand] = useState('')
  const [extraContext, setExtraContext] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!mainKeyword.trim()) { setError('Введи основний ключ!'); return }
    setError(''); setLoading(true); setOutput(''); setCopied(false)

    const systemPrompt = buildSystemPrompt(niche, pageType, language, wordRange)
    const userMessage = [
      `Основний ключ: ${mainKeyword.trim()}`,
      keywords.trim() ? `Додаткові ключі: ${keywords.trim()}` : '',
      competitorUrls.trim()
        ? `URL конкурентів для аналізу:\n${competitorUrls.trim()}`
        : `Зроби пошук за ключем "${mainKeyword.trim()}" і проаналізуй топ-3 результати.`,
      brand.trim() ? `Бренд / назва сайту: ${brand.trim()}` : '',
      extraContext.trim() ? `Додатковий контекст: ${extraContext.trim()}` : '',
    ].filter(Boolean).join('\n')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userMessage }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setOutput(data.text)
    } catch (e: unknown) {
      setError('Помилка з\'єднання: ' + (e instanceof Error ? e.message : String(e)))
    }
    setLoading(false)
  }

  function copyOutput() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className={styles.app}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span>ТЗ Генератор</span>
            <span className={styles.badge}>SEO Studio</span>
          </div>
          <div className={styles.headerHint}>Введи ключ → отримай готове ТЗ для копірайтера за 30 сек</div>
        </div>
      </header>

      <main className={styles.main}>
        {/* LEFT: SETTINGS */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarScroll}>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Тип контенту</div>
              <label className={styles.label}>Ніша</label>
              <select value={niche} onChange={e => setNiche(e.target.value)}>
                {NICHES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>

              <label className={styles.label}>Тип сторінки</label>
              <select value={pageType} onChange={e => setPageType(e.target.value)}>
                {PAGE_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>

              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>Мова</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={styles.label}>Обсяг</label>
                  <select value={wordRange} onChange={e => setWordRange(e.target.value)}>
                    {WORD_RANGES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Ключові слова</div>
              <label className={styles.label}>Основний ключ *</label>
              <input
                type="text"
                value={mainKeyword}
                onChange={e => setMainKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder="купити протеїн Україна"
              />

              <label className={styles.label}>Додаткові ключі</label>
              <textarea
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder={'протеїн для набору маси\nсироватковий протеїн\nкраща ціна протеїн'}
                rows={4}
              />
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Аналіз конкурентів</div>
              <label className={styles.label}>URL конкурентів (1 на рядок)</label>
              <textarea
                value={competitorUrls}
                onChange={e => setCompetitorUrls(e.target.value)}
                placeholder={'https://sporter.ua/...\nhttps://belok.ua/...'}
                rows={3}
              />
              <div className={styles.hint}>Якщо порожньо — AI сам знайде топ-3</div>
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Додатково</div>
              <label className={styles.label}>Бренд / назва сайту</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Sporter, Medical Plaza..."
              />

              <label className={styles.label}>Контекст / особливі вимоги</label>
              <textarea
                value={extraContext}
                onChange={e => setExtraContext(e.target.value)}
                placeholder="Стильові обмеження, приклади попередніх ТЗ..."
                rows={3}
              />
            </section>

            {error && <div className={styles.error}>{error}</div>}

            <button
              className={styles.generateBtn}
              onClick={generate}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.btnLoading}>
                  <span className={styles.spinner} /> Генерую...
                </span>
              ) : '⚡ Згенерувати ТЗ'}
            </button>
          </div>
        </aside>

        {/* RIGHT: OUTPUT */}
        <div className={styles.outputPanel}>
          <div className={styles.outputHeader}>
            <span className={styles.outputTitle}>📋 Готове ТЗ</span>
            {output && (
              <div className={styles.outputActions}>
                <button className={styles.actionBtn} onClick={() => { setOutput(''); setMainKeyword(''); setKeywords(''); setCompetitorUrls(''); setBrand(''); setExtraContext(''); }}>
                  Очистити
                </button>
                <button
                  className={`${styles.actionBtn} ${copied ? styles.actionBtnSuccess : ''}`}
                  onClick={copyOutput}
                >
                  {copied ? '✓ Скопійовано!' : 'Копіювати ТЗ'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.outputBody}>
            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.loadingIcon}>🔍</div>
                <div className={styles.loadingText}>
                  Аналізую топ конкурентів та формую ТЗ...
                </div>
                <div className={styles.loadingDots}>
                  <span /><span /><span />
                </div>
                <div className={styles.loadingHint}>Зазвичай займає 20–45 секунд</div>
              </div>
            )}

            {!loading && !output && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <div className={styles.emptyTitle}>Тут з'явиться ТЗ для копірайтера</div>
                <div className={styles.emptyList}>
                  <div className={styles.emptyItem}><span className={styles.check}>✓</span> Title + Description</div>
                  <div className={styles.emptyItem}><span className={styles.check}>✓</span> H1 + структура H2/H3</div>
                  <div className={styles.emptyItem}><span className={styles.check}>✓</span> ТЗ по кожному блоку</div>
                  <div className={styles.emptyItem}><span className={styles.check}>✓</span> Вимоги до стилю</div>
                  <div className={styles.emptyItem}><span className={styles.check}>✓</span> Аналіз топ-3 конкурентів</div>
                </div>
              </div>
            )}

            {!loading && output && (
              <pre className={styles.outputText}>{output}</pre>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
