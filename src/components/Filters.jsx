import { TERMIN, POZIOMY, FORMULA_TIER, TYPY, SORTOWANIE } from '../meta.js'

function Segmented({ label, hint, value, onChange, options }) {
  return (
    <div className="filter-group">
      <div className="filter-label">
        {label}
        {hint && <span className="filter-hint" title={hint}>?</span>}
      </div>
      <div className="segmented" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            className={`seg ${value === o.value ? 'is-active' : ''}`}
            onClick={() => onChange(o.value)}
            type="button"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Filters({ filters, setFilters, availableDzialy, availablePunkty, availableRoki, counts }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  const toggleDzial = (d) =>
    set({
      dzialy: filters.dzialy.includes(d)
        ? filters.dzialy.filter((x) => x !== d)
        : [...filters.dzialy, d],
    })

  const togglePkt = (p) =>
    set({
      punkty: filters.punkty.includes(p)
        ? filters.punkty.filter((x) => x !== p)
        : [...filters.punkty, p],
    })

  const clear = () =>
    setFilters({
      q: '',
      rok: 'all',
      termin: 'all',
      poziom: 'all',
      formulaTier: 'all',
      typ: 'all',
      dzialy: [],
      punkty: [],
      sort: 'domyslne',
    })

  const opt = (map, allLabel) => [
    { value: 'all', label: allLabel },
    ...Object.entries(map).map(([value, label]) => ({ value, label })),
  ]

  return (
    <aside className="filters">
      <div className="filters-top">
        <h2>Filtry</h2>
        <button className="clear-btn" onClick={clear} type="button">
          Wyczyść filtry
        </button>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="q">
          Szukaj w treści
        </label>
        <input
          id="q"
          className="search-input"
          type="search"
          placeholder="np. logarytm, ostrosłup, granica…"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="rok">
          Rok
        </label>
        <select
          id="rok"
          className="select-input"
          value={filters.rok}
          onChange={(e) => set({ rok: e.target.value })}
        >
          <option value="all">Wszystkie lata</option>
          {availableRoki.map((r) => (
            <option key={r} value={String(r)}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <Segmented
        label="Termin"
        hint="Główna – sesja majowa, Dodatkowa – sesja czerwcowa/lipcowa (matura dodatkowa)"
        value={filters.termin}
        onChange={(v) => set({ termin: v })}
        options={opt(TERMIN, 'Wszystkie')}
      />

      <Segmented
        label="Poziom"
        value={filters.poziom}
        onChange={(v) => set({ poziom: v })}
        options={opt(POZIOMY, 'Wszystkie')}
      />

      <Segmented
        label="Formuła"
        hint="Program nauczania, pod którym zdawano maturę — 2023 (obecna), 2015 lub 2005"
        value={filters.formulaTier}
        onChange={(v) => set({ formulaTier: v })}
        options={opt(FORMULA_TIER, 'Wszystkie')}
      />

      <Segmented
        label="Typ zadania"
        value={filters.typ}
        onChange={(v) => set({ typ: v })}
        options={opt(TYPY, 'Wszystkie')}
      />

      <div className="filter-group">
        <div className="filter-label">Punkty</div>
        <div className="chips">
          {availablePunkty.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${filters.punkty.includes(p) ? 'is-active' : ''}`}
              onClick={() => togglePkt(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label">Działy</div>
        <div className="dzialy-list">
          {availableDzialy.map((d) => (
            <label key={d} className={`dzial-item ${filters.dzialy.includes(d) ? 'is-active' : ''}`}>
              <input
                type="checkbox"
                checked={filters.dzialy.includes(d)}
                onChange={() => toggleDzial(d)}
              />
              <span className="dzial-name">{d}</span>
              {counts?.dzialy?.[d] != null && <span className="dzial-count">{counts.dzialy[d]}</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="sort">
          Sortuj według
        </label>
        <select
          id="sort"
          className="select-input"
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
        >
          {SORTOWANIE.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}
