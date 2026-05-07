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

const WORD_RANGES = [
  { id: '300-500', label: '300–500 (коротко)' },
  { id: '600-900', label: '600–900 (середньо)' },
  { id: '1000-1500', label: '1000–1500 (стандарт)' },
  { id: '1500-2500', label: '1500–2500 (розгорнуто)' },
  { id: 'auto', label: 'Авто (за топом)' },
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

function buildSystemPrompt(niche: string, pageType: string, language: string, wordRange: string) {
  const langName: Record<string, string> = { uk: 'українська', ru: 'російська', en: 'English', pl: 'polska' }
  const nicheLabel = NICHES.find(n => n.id === niche)?.label ?? niche
  const pageLabel = PAGE_TYPES.find(p => p.id === pageType)?.label ?? pageType
  const wordLabel = WORD_RANGES.find(w => w.id === wordRange)?.label ?? wordRange

  return `Ти — досвідчений SEO-редактор і контент-стратег. Формуєш чіткі ТЗ для копірайтерів.

НІША: ${nicheLabel} | ТИП: ${pageLabel} | МОВА: ${langName[language] ?? language} | ОБСЯГ: ${wordLabel}

Структура ТЗ:
---
📋 ТЗ ДЛЯ КОПІРАЙТЕРА: [назва категорії]
---
🔑 КЛЮЧОВІ СЛОВА
- Основне: [ключ]
- Додаткові: [список]
- LSI/семантика: [список]

📏 ОБСЯГ: [слів] | 🌐 МОВА: [мова]

🏷 МЕТА-ТЕГИ
Title: [до 60 символів]
Description: [140–160 символів]

📝 СТРУКТУРА
H1: [конкретний заголовок]
Вступ: [що писати]
H2: [назва] → [що писати, які ключі]
H2: [назва] → [що писати]
[продовжити...]
Висновок/CTA: [що написати]

⚠️ СТИЛЬ
- [вимоги до тону та стилю]
- Заборонені штампи: [перелік]

📊 АНАЛІЗ ТОП-3: [коротко що є у конкурентів і чим відрізнятись]
---

Давай КОНКРЕТНІ заголовки, не шаблони. Роби пошук за ключем якщо немає URL. Відповідай тільки ТЗ-ком без вступів. Мова відповіді: українська.`
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

  // Batch mode
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [batchRunning, setBatchRunning] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'txt'|'csv'|'xlsx'>('csv')
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
    const systemPrompt = buildSystemPrompt(niche, pageType, language, wordRange)
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

    const systemPrompt = buildSystemPrompt(niche, pageType, language, wordRange)

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
    let blob: Blob
    let filename: string

    if (downloadFormat === 'csv') {
      const header = 'Категорія;Ключ;ТЗ\n'
      const rows = done.map(r =>
        `"${r.category}";"${r.mainKeyword}";"${r.result.replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ).join('\n')
      blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' })
      filename = 'tz-ilion.csv'
    } else if (downloadFormat === 'xlsx') {
      // Simple TSV that Excel opens natively
      const header = 'Категорія\tКлюч\tТЗ\n'
      const rows = done.map(r =>
        `${r.category}\t${r.mainKeyword}\t${r.result.replace(/\n/g, ' | ')}`
      ).join('\n')
      blob = new Blob(['\uFEFF' + header + rows], { type: 'text/tab-separated-values;charset=utf-8' })
      filename = 'tz-ilion.xls'
    } else {
      const text = done.map(r =>
        `${'='.repeat(60)}\n${r.category} | ${r.mainKeyword}\n${'='.repeat(60)}\n\n${r.result}\n\n`
      ).join('\n')
      blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      filename = 'tz-ilion.txt'
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
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
            <img src="data:image/png;base64,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" alt="ILION Digital" className={styles.logoImg} />
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
                <select value={wordRange} onChange={e => setWordRange(e.target.value)}>{WORD_RANGES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}</select>
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
                    <select value={downloadFormat} onChange={e => setDownloadFormat(e.target.value as 'txt'|'csv'|'xlsx')} style={{width:'auto',padding:'5px 10px'}}>
                    <option value="csv">CSV (Excel)</option>
                    <option value="xlsx">XLS (Excel)</option>
                    <option value="txt">TXT</option>
                  </select>
                  <button className={styles.actionBtn} onClick={downloadAll}>⬇ Скачати</button>
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
