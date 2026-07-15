# Baza Zadań Maturalnych z Matematyki 2026

Przeglądarka zadań z arkuszy maturalnych z matematyki **2026** (formuła 2023),
wzorowana układem na bazie zadań z fizyki. Każde zadanie jest opisane trzema
parametrami klasyfikacji:

- **edycja / formuła** — nowa (2023) / stara (2015),
- **sesja** — majowa (termin główny) / czerwcowa (termin dodatkowy),
- **poziom** — podstawowy / rozszerzony.

Odpowiedzi (rozwiązania z oficjalnych zasad oceniania CKE) są domyślnie ukryte —
pokazują się po kliknięciu **„Pokaż odpowiedź”**.

## Stos technologiczny

- **Vite + React** — jednostronicowa aplikacja (SPA),
- **KaTeX** — składanie wzorów matematycznych,
- **Express** (`server.js`) — serwuje zbudowaną stronę na produkcji (Railway).

Dane zadań znajdują się w [`src/data/tasks.json`](src/data/tasks.json).

## Uruchomienie lokalne

```bash
npm install
npm run dev        # tryb deweloperski (http://localhost:5173)
```

## Build produkcyjny

```bash
npm run build      # tworzy katalog dist/
npm start          # uruchamia serwer (PORT z env, domyślnie 3000)
```

## Wdrożenie na Railway

Repozytorium jest gotowe do wdrożenia na [Railway](https://railway.app):

1. Railway wykrywa Node.js i buduje przez Nixpacks (`npm install` → `npm run build`).
2. `npm start` uruchamia serwer Express serwujący `dist/`.
3. Port jest pobierany z `process.env.PORT` (ustawiany automatycznie przez Railway).

Konfiguracja wdrożenia: [`railway.json`](railway.json).

## Źródła

Treści zadań i klucze odpowiedzi pochodzą z arkuszy CKE opublikowanych na
[arkusze.pl](https://arkusze.pl). Rozwiązania opracowano na podstawie oficjalnych
zasad oceniania CKE. Materiał ma charakter edukacyjny.
