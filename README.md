# Stage Sync - Cyfrowy Repertuar Koncertowy

**Stage Sync** to platforma do wyświetlania repertuaru koncertowego na żywo na telefonach użytkowników podczas występów scenicznych. System oparty na klonie projektu [ccw-platform](https://github.com/mka142/ccw-platform), wykorzystuje architekturę **device-manager** i **web-client** do synchronizacji treści w czasie rzeczywistym.

## 🎯 Cel Projektu

Głównym celem jest stworzenie cyfrowego repertuaru, który pozwoli widzom śledzić aktualnie wykonywany utwór wraz z dodatkowymi informacjami (zdjęcia, teksty, notatki programowe). W obecnej wersji obsługa interfejsu i przejść odbywa się ręcznie, jednak w przyszłości planowane jest rozszerzenie o system CRM do programowania cyfrowego repertuaru.

**Cele badawcze:** System zbiera szczegółowe metryki aktywności użytkowników (śledzenie czy użytkownik opuszcza aplikację, przełącza karty, kiedy patrzy na ekran) w celach badawczych.

## 📱 Struktura Projektu

### 🖥️ `device-manager` - Serwer Zarządzający

Centralny serwer zarządzający stanem aplikacji i dostarczający panel administracyjny.

**Technologie:** Bun, Express, WebSockets, MQTT, MongoDB  
**Port:** `3001`

**Funkcjonalności:**
- Panel administracyjny do kontroli repertuaru w czasie rzeczywistym
- Zarządzanie użytkownikami i sesjami
- Zbieranie i przechowywanie metryk aktywności użytkowników
- API do synchronizacji treści koncertowych

**Uruchomienie:**

```bash
cd device-manager
bun install
bun run start
```

Panel administracyjny dostępny pod adresem: <http://localhost:3001>

### � `web-client` - Aplikacja dla Widzów

Progresywna aplikacja webowa dla uczestników koncertu wyświetlająca aktualny repertuar.

**Technologie:** React 19, Bun, TypeScript, Tailwind CSS, Framer Motion  
**Port:** `3000`

**Funkcjonalności:**
- Wyświetlanie aktualnego utworu i informacji o nim
- Synchronizacja w czasie rzeczywistym z serwerem
- Automatyczne śledzenie aktywności użytkownika
- Progressive Web App (możliwość instalacji na telefonie)

**Uruchomienie:**

```bash
cd web-client
bun install
bun dev
```

Aplikacja dostępna pod adresem: <http://localhost:3000>

**Kompatybilność:** Zachowane komponenty sliderów z oryginalnego projektu (możliwość przyszłego wykorzystania)

## 🏗️ Architektura Systemu

```
┌─────────────────┐
│   web-client    │ ←─── Uczestnicy koncertu
│ (React 19 PWA)  │      (wyświetlanie repertuaru)
└────────┬────────┘
         │
         │ WebSocket/MQTT
         ▼
┌─────────────────┐
│ device-manager  │ ←─── Administrator koncertu
│  (Bun Server)   │      (panel kontrolny)
└────────┬────────┘
         │
         │ Zapisywanie danych
         ▼
┌─────────────────┐
│    MongoDB      │      (metryki użytkowników
│                 │       + treści koncertowe)
└─────────────────┘
```

## 🎯 Funkcjonalności

### 👥 Dla Użytkowników (web-client):
- **Repertuar na żywo** - Aktualny utwór z informacjami (tytuł, kompozytor, notatki)
- **Treści dodatkowe** - Zdjęcia, teksty, ciekawostki programowe
- **Synchronizacja** - Automatyczne aktualizacje w czasie rzeczywistym
- **PWA** - Możliwość instalacji jako aplikacja na telefonie

### 🎛️ Dla Administratorów (device-manager):
- **Panel kontrolny** - Zarządzanie aktualnym repertuarem
- **Treści dynamiczne** - Edycja i publikacja informacji o utworach
- **Analityka** - Dashboard metryk aktywności użytkowników
- **Zarządzanie sesjami** - Kontrola aktywnych połączeń

### 📊 Śledzenie Aktywności:
- **Focus/Blur** - Czy użytkownik patrzy na aplikację czy przełączył kartę
- **Widoczność strony** - Aktywne korzystanie z aplikacji
- **Czas sesji** - Długość i częstotliwość korzystania
- **Interakcje** - Dotknięcia, przewijanie, nawigacja

## 🚀 Szybki Start

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/mka142/stage-sync.git
   cd stage-sync
   ```

2. **Uruchom serwer zarządzający:**

   ```bash
   cd device-manager
   bun install
   bun run start
   ```

3. **Uruchom aplikację kliencką:**

   ```bash
   cd web-client
   bun install
   bun dev
   ```

4. **Dostęp do aplikacji:**
   - Panel administratora: <http://localhost:3001>
   - Aplikacja dla widzów: <http://localhost:3000>

## 🛠️ Stack Technologiczny

- **Runtime:** Bun (device-manager, web-client)
- **Frontend:** React 19, TypeScript, Tailwind CSS, Framer Motion  
- **Backend:** Express, WebSockets, MQTT, MongoDB
- **PWA:** Service Workers, Web App Manifest
- **Analityka:** Page Visibility API, Intersection Observer, Focus Events
- **Narzędzia:** TypeScript, ESLint, Vite/Bun bundler

## 🔮 Roadmap

- **Q1 2026:** Podstawowa funkcjonalność repertuaru cyfrowego + metryki użytkowników
- **Q2 2026:** Dashboard analityczny dla administratorów  
- **Q3 2026:** System CRM do programowania cyfrowego repertuaru
- **Q4 2026:** Zaawansowane funkcjonalności (notyfikacje push, tryb offline)

## 📊 Badania

System zbiera anonimowe dane o aktywności użytkowników w celach badawczych:
- Analiza zaangażowania widzów podczas różnych typów koncertów
- Optymalizacja interfejsu aplikacji mobilnych dla środowisk koncertowych
- Badanie wzorców uwagi podczas prezentacji treści kulturalnych

## 📝 Licencja

Prywatny projekt badawczy oparty na [ccw-platform](https://github.com/mka142/ccw-platform).

## 👥 Kontakt

Projekt rozwijany w ramach badań nad cyfrowymi repertuarami koncertowymi i analizą aktywności użytkowników.
