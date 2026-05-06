# ⚡ ТЗ Генератор — SEO Studio

Інструмент для автоматичного формування технічних завдань для копірайтерів.
Аналізує топ-3 конкурентів і генерує готове ТЗ за 30 секунд.

---

## 🚀 Деплой на Vercel (5 хвилин)

### Крок 1 — GitHub
1. Створи новий репозиторій на https://github.com → "New repository"
2. Назви його `tz-generator` (або будь-як)
3. Завантаж файли цього проєкту туди

### Крок 2 — Vercel
1. Зайди на https://vercel.com → "Add New Project"
2. Підключи свій GitHub репозиторій
3. Framework Preset вибери **Next.js** (визначиться автоматично)
4. Перед деплоєм — додай змінну середовища:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-...` (твій ключ з console.anthropic.com)
5. Натисни **Deploy**

Через 1–2 хвилини отримаєш посилання виду `tz-generator-xxx.vercel.app`

### Крок 3 — Свій домен (опціонально)
У Vercel → Settings → Domains → Add Domain
Додай свій домен і налаштуй DNS за інструкцією Vercel.

---

## 💻 Локальна розробка

```bash
# Встанови залежності
npm install

# Скопіюй .env.example
cp .env.example .env.local

# Встав свій API ключ у .env.local
# ANTHROPIC_API_KEY=sk-ant-...

# Запусти
npm run dev
```

Відкрий http://localhost:3000

---

## 🔑 Де взяти API ключ

1. https://console.anthropic.com
2. API Keys → Create Key
3. Скопіюй і вставте у Vercel як змінну `ANTHROPIC_API_KEY`

**Важливо:** ключ зберігається тільки на сервері Vercel — звичайні користувачі не мають до нього доступу.

---

## 🛠 Стек

- **Next.js 15** — фреймворк
- **TypeScript** — типізація
- **Anthropic SDK** — API Claude
- **Web Search** — аналіз топ-3 конкурентів
- **Vercel** — хостинг
