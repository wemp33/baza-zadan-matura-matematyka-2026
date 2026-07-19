import { useEffect, useMemo, useRef, useState } from 'react'
import TaskCard from './components/TaskCard.jsx'
import Filters from './components/Filters.jsx'
import { DZIALY_KOLEJNOSC, examOrder } from './meta.js'

const PAGE_SIZE = 20

const DEFAULT_FILTERS = {
  q: '',
  rok: 'all',
  termin: 'all',
  poziom: 'all',
  formulaTier: 'all',
  typ: 'all',
  dzialy: [],
  punkty: [],
  sort: 'domyslne',
}

const stripHtml = (s) =>
  (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[$\\{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()

const withSearch = (rawTasks) =>
  rawTasks.map((t) => ({
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

// The task corpus (~1900 tasks, several MB) is fetched at runtime as a static
// asset rather than bundled into the JS, so the app shell loads instantly.
function useTasks() {
  const [tasks, setTasks] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}tasks.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setTasks(withSearch(data))
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { tasks, error }
}

export default function App() {
  const { tasks, error } = useTasks()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [theme, setTheme] = useTheme()
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  // Any change to filters (or the underlying data) invalidates the current page.
  useEffect(() => {
    setPage(1)
  }, [filters, tasks])

  const matches = (t, f) => {
    if (f.rok !== 'all' && String(t.rok) !== f.rok) return false
    if (f.termin !== 'all' && t.termin !== f.termin) return false
    if (f.poziom !== 'all' && t.poziom !== f.poziom) return false
    if (f.formulaTier !== 'all' && t.formula_tier !== f.formulaTier) return false
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
    if (!tasks) return []
    let list = tasks.filter((t) => matches(t, filters))
    if (filters.sort === 'punkty-rosnaco') list = [...list].sort((a, b) => a.punkty - b.punkty)
    else if (filters.sort === 'punkty-malejaco') list = [...list].sort((a, b) => b.punkty - a.punkty)
    else if (filters.sort === 'rok-najstarsze')
      list = [...list].sort((a, b) => a.rok - b.rok || examOrder(a) - examOrder(b) || parseFloat(a.numer) - parseFloat(b.numer))
    else if (filters.sort === 'rok-najnowsze')
      list = [...list].sort((a, b) => b.rok - a.rok || examOrder(a) - examOrder(b) || parseFloat(a.numer) - parseFloat(b.numer))
    // 'domyslne': tasks.json arrives pre-sorted (newest year first) from the build pipeline.
    return list
  }, [tasks, filters])

  const availableRoki = useMemo(
    () => (tasks ? [...new Set(tasks.map((t) => t.rok))].sort((a, b) => b - a) : []),
    [tasks]
  )

  const availablePunkty = useMemo(
    () => (tasks ? [...new Set(tasks.map((t) => t.punkty))].filter((x) => x != null).sort((a, b) => a - b) : []),
    [tasks]
  )

  const availableDzialy = useMemo(() => {
    if (!tasks) return []
    const present = new Set(tasks.map((t) => t.dzial).filter(Boolean))
    const ordered = DZIALY_KOLEJNOSC.filter((d) => present.has(d))
    const extra = [...present].filter((d) => !DZIALY_KOLEJNOSC.includes(d))
    return [...ordered, ...extra]
  }, [tasks])

  // Dział counts under all filters EXCEPT the dział selection itself.
  const counts = useMemo(() => {
    const dzialy = {}
    if (tasks) {
      const noDzial = { ...filters, dzialy: [] }
      for (const t of tasks) if (matches(t, noDzial)) dzialy[t.dzial] = (dzialy[t.dzial] || 0) + 1
    }
    return { dzialy }
  }, [tasks, filters])

  const activeFilterCount =
    (filters.q.trim() ? 1 : 0) +
    (filters.rok !== 'all' ? 1 : 0) +
    (filters.termin !== 'all' ? 1 : 0) +
    (filters.poziom !== 'all' ? 1 : 0) +
    (filters.formulaTier !== 'all' ? 1 : 0) +
    (filters.typ !== 'all' ? 1 : 0) +
    filters.dzialy.length +
    filters.punkty.length

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
  }

  // After a page change, jump back to the top of the task list. On desktop the
  // list is its own scroll pane; on mobile it's the page. Done in an effect so
  // it runs after the new page has rendered (a smooth scroll during the swap is
  // cancelled by the re-render). Skipped on first mount so the page doesn't jump.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const el = document.querySelector('.results')
    if (!el) return
    if (el.scrollHeight > el.clientHeight + 4) {
      el.scrollTop = 0
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [page])

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark">∑</span>
            <div className="brand-text">
              <h1>Baza Zadań Maturalnych z Matematyki</h1>
              <p>Matura 2015–2026 · formuły 2005/2015/2023 · sesje główna i dodatkowa · poziom podstawowy i rozszerzony</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="print-btn" onClick={() => window.print()} type="button" title="Drukuj zestaw">
              <svg className="print-btn-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span className="print-btn-label">Drukuj zestaw</span>
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
          aria-expanded={showFilters}
        >
          {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
          {activeFilterCount > 0 && <span className="filters-count">{activeFilterCount}</span>}
        </button>

        <div className={`filters-wrap ${showFilters ? 'is-open' : ''}`}>
          <Filters
            filters={filters}
            setFilters={setFilters}
            availableDzialy={availableDzialy}
            availablePunkty={availablePunkty}
            availableRoki={availableRoki}
            counts={counts}
          />
        </div>

        <section className="results">
          {error ? (
            <div className="empty">
              Nie udało się wczytać bazy zadań.
              <br />
              Odśwież stronę, aby spróbować ponownie.
            </div>
          ) : !tasks ? (
            <div className="empty">Ładowanie zadań…</div>
          ) : (
            <>
              <div className="results-head">
                <strong>{filtered.length}</strong>
                <span>{zadanLabel(filtered.length)}</span>
                {filtered.length !== tasks.length && (
                  <span className="results-total">z {tasks.length}</span>
                )}
                {totalPages > 1 && (
                  <span className="results-page-info">
                    Strona {currentPage} z {totalPages}
                  </span>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="empty">
                  Brak zadań spełniających wybrane kryteria.
                  <br />
                  Spróbuj wyczyścić filtry.
                </div>
              ) : (
                <>
                  <div className="cards">
                    {pageItems.map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination page={currentPage} totalPages={totalPages} onGo={goToPage} />
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Zadania pochodzą z arkuszy maturalnych CKE (matura 2015–2026). Treści i klucze odpowiedzi:{' '}
          <a href="https://arkusze.pl" target="_blank" rel="noopener noreferrer">
            arkusze.pl
          </a>
          . Rozwiązania na podstawie oficjalnych zasad oceniania CKE.
        </p>
      </footer>
    </div>
  )
}

function Pagination({ page, totalPages, onGo }) {
  const windowSize = 2
  const nums = []
  for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
    nums.push(p)
  }

  return (
    <nav className="pagination" aria-label="Strony wyników">
      <button
        className="page-btn page-nav"
        onClick={() => onGo(page - 1)}
        disabled={page <= 1}
        type="button"
      >
        ‹ Poprzednia
      </button>

      {nums[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onGo(1)} type="button">
            1
          </button>
          {nums[0] > 2 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {nums.map((p) => (
        <button
          key={p}
          className={`page-btn ${p === page ? 'is-active' : ''}`}
          onClick={() => onGo(p)}
          type="button"
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {nums[nums.length - 1] < totalPages && (
        <>
          {nums[nums.length - 1] < totalPages - 1 && <span className="page-ellipsis">…</span>}
          <button className="page-btn" onClick={() => onGo(totalPages)} type="button">
            {totalPages}
          </button>
        </>
      )}

      <button
        className="page-btn page-nav"
        onClick={() => onGo(page + 1)}
        disabled={page >= totalPages}
        type="button"
      >
        Następna ›
      </button>
    </nav>
  )
}

function zadanLabel(n) {
  if (n === 1) return 'zadanie'
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'zadania'
  return 'zadań'
}
