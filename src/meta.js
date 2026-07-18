// Display labels and canonical ordering for filter dimensions.

export const TERMIN = {
  glowna: 'Główna (maj)',
  dodatkowa: 'Dodatkowa (czerwiec/lipiec)',
}

export const TERMIN_KROTKI = {
  glowna: 'Główna',
  dodatkowa: 'Dodatkowa',
}

export const POZIOMY = {
  podstawowy: 'Podstawowy',
  rozszerzony: 'Rozszerzony',
}

// Absolute curriculum formula (the meaningful, non-relative classification —
// arkusze.pl's own "nowa/stara" labels are relative to each exam year, so we
// surface the actual formula generation instead).
export const FORMULA_TIER = {
  '2023': 'Formuła 2023',
  '2015': 'Formuła 2015',
  '2005': 'Formuła 2005',
}

export const TYPY = {
  zamkniete: 'Zamknięte',
  otwarte: 'Otwarte',
}

// Canonical topic order (matches the extraction vocabulary).
export const DZIALY_KOLEJNOSC = [
  'Liczby rzeczywiste',
  'Wyrażenia algebraiczne',
  'Równania i nierówności',
  'Funkcje',
  'Ciągi',
  'Trygonometria',
  'Planimetria',
  'Geometria analityczna',
  'Stereometria',
  'Kombinatoryka i prawdopodobieństwo',
  'Statystyka',
  'Optymalizacja i pochodna',
  'Dowody',
]

export const SORTOWANIE = [
  { value: 'domyslne', label: 'Domyślne (rok, arkusz, nr zadania)' },
  { value: 'rok-najnowsze', label: 'Rok: najnowsze' },
  { value: 'rok-najstarsze', label: 'Rok: najstarsze' },
  { value: 'punkty-rosnaco', label: 'Punkty: rosnąco' },
  { value: 'punkty-malejaco', label: 'Punkty: malejąco' },
]

const MONTH_ORDER = { maj: 0, czerwiec: 1, lipiec: 1 }
const POZIOM_ORDER = { podstawowy: 0, rozszerzony: 1 }
const FORMULA_TIER_ORDER = { '2023': 0, '2015': 1, '2005': 2 }

// Tie-break ordering used within a single year (mirrors the data's own
// pre-sorted order): poziom, termin, month, formula tier, task number.
export function examOrder(t) {
  return (
    (POZIOM_ORDER[t.poziom] ?? 9) * 1000 +
    (t.termin === 'glowna' ? 0 : 100) +
    (MONTH_ORDER[t.month] ?? 9) * 10 +
    (FORMULA_TIER_ORDER[t.formula_tier] ?? 9)
  )
}
