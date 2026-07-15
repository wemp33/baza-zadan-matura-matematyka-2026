import { useEffect, useMemo, useState } from 'react'
import TaskCard from './components/TaskCard.jsx'
import Filters from './components/Filters.jsx'
import { DZIALY_KOLEJNOSC } from './meta.js'
import rawTasks from './data/tasks.json'

const DEFAULT_FILTERS = {
  q: '',
  sesja: 'all',
  poziom: 'all',
  formula: 'all',
  typ: 'all',
  dzialy: [],
  punkty: [],
  sort: 'domyslne',
}

const examRank = (t) =>
  (t.sesja === 'maj' ? 0 : 2) + (t.poziom === 'podstawowy' ? 0 : 1)

const stripHtml = (s) =>
  (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[$\\{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()

// Precompute a search blob per task once.
const tasks = rawTasks.map((t) => ({
  ...t,
  _search: stripHtml(
    [t.dzial, t.tresc_html, t.informacja_html, t.odpowiedz_html, t.odpowiedz_zwiezla, `zadanie ${t.numer}`].join(' ')
  ),
}))

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('mbr-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('mbr-theme', theme)
    } catch {}
  }, [theme])
  return [theme, setTheme]
}

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [theme, setTheme] = useTheme()
  const [showFilters, setShowFilters] = useState(false)

  const matches = (t, f) => {
    if (f.sesja !== 'all' && t.sesja !== f.sesja) return false
    if (f.poziom !== 'all' && t.poziom !== f.poziom) return false
    if (f.formula !== 'all' && t.formula !== f.formula) return false
    if (f.typ !== 'all' && t.typ !== f.typ) return false
    if (f.dzialy.length && !f.dzialy.includes(t.dzial)) return false
    if (f.punkty.length && !f.punkty.includes(t.punkty)) return false
    if (f.q.trim()) {
      const q = f.q.trim().toLowerCase()
      if (!t._search.includes(q)) return false
    }
    return true
  }

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => matches(t, filters))
    if (filters.sort === 'punkty-rosnaco') list = [...list].sort((a, b) => a.punkty - b.punkty)
    else if (filters.sort === 'punkty-malejaco') list = [...list].sort((a, b) => b.punkty - a.punkty)
    else
      list = [...list].sort(
        (a, b) => examRank(a) - examRank(b) || parseFloat(a.numer) - parseFloat(b.numer)
      )
    return list
  }, [filters])

  const availablePunkty = useMemo(
    () => [...new Set(tasks.map((t) => t.punkty))].filter((x) => x != null).sort((a, b) => a - b),
    []
  )

  const availableDzialy = useMemo(() => {
    const present = new Set(tasks.map((t) => t.dzial).filter(Boolean))
    const ordered = DZIALY_KOLEJNOSC.filter((d) => present.has(d))
    const extra = [...present].filter((d) => !DZIALY_KOLEJNOSC.includes(d))
    return [...ordered, ...extra]
  }, [])

  // Dział counts under all filters EXCEPT the dział selection itself.
  const counts = useMemo(() => {
    const noDzial = { ...filters, dzialy: [] }
    const dzialy = {}
    for (const t of tasks) if (matches(t, noDzial)) dzialy[t.dzial] = (dzialy[t.dzial] || 0) + 1
    return { dzialy }
  }, [filters])

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark">∑</span>
            <div className="brand-text">
              <h1>Baza Zadań Maturalnych z Matematyki</h1>
              <p>Matura 2026 · formuła 2023 · arkusze majowe i czerwcowe · poziom podstawowy i rozszerzony</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="print-btn" onClick={() => window.print()} type="button">
              Drukuj zestaw
            </button>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Przełącz motyw"
              type="button"
            >
              {theme === 'dark' ? '☀︎' : '☾'}
            </button>
          </div>
        </div>
      </header>

      <main className="layout">
        <button
          className="filters-mobile-toggle"
          type="button"
          onClick={() => setShowFilters((v) => !v)}
        >
          {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>

        <div className={`filters-wrap ${showFilters ? 'is-open' : ''}`}>
          <Filters
            filters={filters}
            setFilters={setFilters}
            availableDzialy={availableDzialy}
            availablePunkty={availablePunkty}
            counts={counts}
          />
        </div>

        <section className="results">
          <div className="results-head">
            <strong>{filtered.length}</strong>
            <span>{zadanLabel(filtered.length)}</span>
            {filtered.length !== tasks.length && (
              <span className="results-total">z {tasks.length}</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              Brak zadań spełniających wybrane kryteria.
              <br />
              Spróbuj wyczyścić filtry.
            </div>
          ) : (
            <div className="cards">
              {filtered.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Zadania pochodzą z arkuszy maturalnych CKE (matura 2026). Treści i klucze odpowiedzi:{' '}
          <a href="https://arkusze.pl" target="_blank" rel="noopener noreferrer">
            arkusze.pl
          </a>
          . Rozwiązania na podstawie oficjalnych zasad oceniania CKE.
        </p>
      </footer>
    </div>
  )
}

function zadanLabel(n) {
  if (n === 1) return 'zadanie'
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'zadania'
  return 'zadań'
}
