import { useState } from 'react'
import MathHtml from './MathHtml.jsx'
import { SESJE_KROTKIE, POZIOMY, FORMULY, TYPY } from '../meta.js'

export default function TaskCard({ task }) {
  const [open, setOpen] = useState(false)

  const crumbs = [
    `Matura ${task.rok}`,
    SESJE_KROTKIE[task.sesja] || task.sesja,
    POZIOMY[task.poziom] || task.poziom,
    `${FORMULY[task.formula] ? FORMULY[task.formula].split(' ')[0] : task.formula} formuła`,
    `Zad. ${task.numer}`,
  ].join(' • ')

  return (
    <article className="card">
      <header className="card-head">
        <span className="crumbs">{crumbs}</span>
        <span className="badges">
          <span className={`badge badge-typ typ-${task.typ}`}>{TYPY[task.typ] || task.typ}</span>
          <span className="badge badge-pkt">
            {task.punkty} {pktLabel(task.punkty)}
          </span>
        </span>
      </header>

      <div className="card-tags">
        {task.dzial && <span className="tag tag-dzial">{task.dzial}</span>}
        <a className="pdf-link" href={task.arkusz_pdf} target="_blank" rel="noopener noreferrer">
          Arkusz pytań
        </a>
        <a className="pdf-link" href={task.klucz_pdf} target="_blank" rel="noopener noreferrer">
          Klucz odpowiedzi
        </a>
      </div>

      {task.informacja_html && task.informacja_html.trim() && (
        <div className="informacja">
          <div className="informacja-label">Informacja do zadania</div>
          <MathHtml className="mathhtml" html={task.informacja_html} />
        </div>
      )}

      <MathHtml className="mathhtml tresc" html={task.tresc_html} />

      <button
        className={`reveal-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Ukryj odpowiedź' : 'Pokaż odpowiedź'}
      </button>

      {open && (
        <div className="odpowiedz">
          {task.odpowiedz_zwiezla && task.odpowiedz_zwiezla.trim() && (
            <div className="odp-krotka">
              <span className="odp-krotka-label">Odpowiedź:</span>{' '}
              <MathHtml className="mathhtml inline" html={task.odpowiedz_zwiezla} />
            </div>
          )}
          <div className="odp-label">Rozwiązanie</div>
          <MathHtml className="mathhtml" html={task.odpowiedz_html} />
        </div>
      )}
    </article>
  )
}

function pktLabel(n) {
  if (n === 1) return 'pkt'
  return 'pkt'
}
