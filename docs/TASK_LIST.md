# Task List

> Hackathon build tasks broken into phases. Each phase has a demo checkpoint.
> Complete phases in order — you can demo after every phase ends.

**Project:** KuryenteKo  
**Last updated:** 2026-05-13 (Phase 7 done — rebuild needed for Maps + API keys)

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Blocked |
| `[-]` | Skipped / cancelled |

---

## Phase 0: Setup ✅
**Goal:** Project running on device, Supabase connected, navigation scaffolded.  
**Demo checkpoint:** App opens on phone via Expo Go or APK, shows home screen.

- [x] Initialize Expo project with TypeScript template (Expo SDK 54, RN 0.81.5)
- [x] Install and configure Expo Router (file-based navigation)
- [x] Install and configure NativeWind v4 (Tailwind for React Native)
- [x] Configure `babel.config.js`, `metro.config.js`, `tailwind.config.js`
- [x] Add `nativewind-env.d.ts` — TypeScript type augmentation for `className`
- [x] Create `.env.example` with placeholder values
- [x] Set up typed lib files: `supabase.ts`, `constants.ts`
- [x] Define all TypeScript types: `bill.ts`
- [x] Hardcode ERC rate table in `lib/constants.ts`
- [x] TypeScript check passes — zero errors
- [x] Copy `.env.example` → `.env` and fill in API keys
- [x] Initialize Supabase project (free tier) and add keys to `.env`
- [x] Run Supabase schema migration (`docs/supabase-migration.sql`)
- [x] Configure EAS Build (`eas.json`) with preview APK profile
- [x] Confirm app runs on physical Android device via Expo Go
- [-] Set up ESLint + Prettier — skipped for hackathon speed

---

## Phase 1: Input Screens ✅
**Goal:** User can enter bill data manually or via photo scan.  
**Demo checkpoint:** Manual input form fills, scan button opens camera.

### Manual Input

- [x] Build Home screen (`app/index.tsx`) — Scan vs Manual entry points, orange brand design
- [x] Build Manual Input screen (`app/manual-input.tsx`) with 3 required fields:
  - Bill total amount (₱) with peso prefix
  - kWh consumed with kWh suffix
  - City/municipality inline dropdown (all Metro Manila cities)
- [x] Add optional Advanced section — generation, transmission, system loss, distribution, taxes
- [x] Add form validation via React Hook Form — required fields, numeric inputs
- [x] Add "I-CHECK NGAYON ⚡" CTA navigating to Bill Decoder
- [x] Zustand store (`store/billStore.ts`) — holds `billInput` and `verdict` globally

### Bill Scanner (OCR)

- [x] Install `expo-image-picker`, camera permissions configured in `app.json`
- [x] Build camera capture + gallery upload UI (`app/scanner.tsx`)
- [x] Send image as base64 to OpenRouter (nvidia/nemotron-nano-12b-v2-vl:free) via `services/ocrService.ts`
- [x] Parse structured JSON response — extracts all Meralco line items
- [x] Build "Tama ba ito?" confirmation screen with editable extracted fields
- [x] City picker at top of confirm screen (OCR rarely extracts city)
- [x] Allow user to edit any incorrectly extracted field before proceeding
- [x] Loading state — "Binabasa ang bill mo..." with spinner
- [x] Error state — friendly Taglish message + fallback to manual input

### Also completed (not in original task list)

- [x] `services/billAnalysis.ts` — full overcharge detection logic vs ERC rates
- [x] `app/bill-decoder.tsx` — charge breakdown screen (Phase 2)
- [x] Root layout (`app/_layout.tsx`) — all screen headers + navigation config
- [x] OCR provider abstraction — `EXPO_PUBLIC_OCR_PROVIDER` supports openrouter / gemini / openai

---

## Phase 2: Bill Decoder + Verdict ✅
**Goal:** User sees their bill explained and gets a clear 🟢/🔴 verdict.  
**Demo checkpoint:** Input any bill → see decoded charges → see verdict with peso amount.

### Bill Decoder

- [x] Build Bill Decoder screen (`app/bill-decoder.tsx`) listing all charges
- [x] Map each charge to a plain Taglish explanation with ✅⚠️🚨 status per line
- [x] Tap any charge card to expand Taglish explanation
- [x] Summary row: Total Bill / kWh / Rate per kWh

### Overcharge Detector

- [x] ERC-approved maximum rates in `lib/constants.ts` (April 2026)
- [x] Detection logic in `services/billAnalysis.ts` — compares per-kWh rate vs ERC max
- [x] Calculates exact peso overcharge amount
- [x] Verdict screen (`app/verdict.tsx`):
  - ✅ NORMAL — action tips + links to heat map and AI chat
  - ⚠️ MEDYO MATAAS — monitor next bill prompt
  - 🚨 NA-OVERCHARGE — exact overcharge amount + ERC complaint CTA
- [x] Fixed: `router.replace('/')` moved to `useEffect` — no more render-phase navigation crash

### Also completed

- [x] Updated OCR prompt — extracts `ratePerKwh`, `universalCharges`, `fitAll`
- [x] Fixed `totalAmount` extraction — "Charges for this billing period" not "Total Amount Due"
- [x] Updated `types/bill.ts` — added `ratePerKwh`, `universalCharges`, `fitAll` fields
- [x] Action cards on verdict — ERC complaint, Lifeline Checker, DTI Report, Heat Map, AI chat

---

## Phase 2.5: Auth (Added — not in original plan) ✅

- [x] Build `app/sign-in.tsx` — Email + Password sign in / sign up
- [x] Anonymous skip button — continues without account
- [x] `app/index.tsx` — `<Redirect href="/sign-in" />` if no session
- [x] `app/_layout.tsx` — auto anonymous auth in `__DEV__` mode
- [x] Supabase email confirmation disabled (free tier 2/hr limit)
- [-] Google OAuth — deferred (needs EAS build SHA-1 fingerprint)

---

## Phase 3: Killer Combination ✅
**Goal:** Overcharged users see why + community proof + can ask AI.  
**Demo checkpoint:** 🔴 verdict → heat map → AI chatbot all working.

### Bill Spike Explainer

- [-] Separate Spike Explainer screen — skipped
- [x] **Alternative:** 16-month rate history + 7 key issues embedded in `data/electricity-context.json`
- [x] AI chatbot uses this context to explain bill spikes when asked (Taglish, sources included)

### Community Heat Map

- [x] `react-native-maps` with OSM `UrlTile` — real interactive map, no Leaflet/WebView
- [x] Tab switcher: 🗺️ Mapa (full-screen MapView) / 📋 Listahan (scrollable cards)
- [x] 24-city colored pins (green/yellow/red by average bill) from Supabase `city_heat_map`
- [x] Personal orange 📍 pin — user's bill city
- [x] `CITY_COORDS` map with 31 Philippine cities in `heat-map.tsx`
- [!] Map blocked in Expo Go — needs Google Maps API key in `app.json` + rebuild
- [x] List view with pull-to-refresh, city average and report count
- [x] Anonymous bill submission form (city, kWh, amount, status)
- [!] Submit 401 error — run in Supabase SQL Editor: `GRANT INSERT ON community_reports TO anon, authenticated;`
- [x] `docs/seed-heat-map.sql` — 24-city realistic dummy data seeded

### AI Chatbot (Taglish)

- [x] Build Chat screen (`app/chat.tsx`) with message bubble UI
- [x] Connect to Cerebras `llama3.1-8b` (not OpenAI — free, fast)
- [x] System prompt: Taglish, electricity-only topic restriction, bill context injected
- [x] Hard topic block — refuses non-electricity questions (no code, no roleplay, no math)
- [x] `data/electricity-context.json` — 16-month rate history, 7 key issues, sources, consumer rights
- [x] Markdown rendering — custom `MarkdownBody` component handles **bold**, *italic*, - bullets, numbered lists
- [x] 12 quick prompt chips, 3 shown randomly per session via `useFocusEffect`
- [x] Source cards — tappable link previews with favicons (`google.com/s2/favicons`)
- [-] Offline FAQ fallback — skipped (Cerebras is free and fast enough)

---

## Phase 4: Action Screens ✅
**Goal:** User can see complaint guides and apply for Lifeline from within the app.  
**Demo checkpoint:** One tap from verdict → complete guide screen.

### ERC Complaint Screen

- [x] Build `app/erc-complaint.tsx` — grounds for complaint, 4-step guide
- [x] Tappable ERC contacts (phone, email, website)
- [-] Auto-fill complaint letter generator — skipped (out of scope for hackathon)
- [-] "I-EMAIL" button — skipped

### DTI Sub-Meter Report

- [x] Build `app/dti-report.tsx` — sub-meter abuse guide, violations list, steps
- [x] Tappable DTI contacts
- [-] Auto-fill DTI complaint letter — skipped

### Lifeline Rate Checker

- [x] Build `app/lifeline-checker.tsx` — auto-detects qualification from bill kWh
- [x] Bracket table, eligibility checklist, how-to-apply guide
- [-] Application letter generator — skipped

---

## Phase 5: Polish + Offline (Partial) 🔶
**Goal:** App feels production-ready, works offline, handles errors gracefully.

### Offline Support

- [-] Sync ERC rates to AsyncStorage — skipped
- [-] Sync FAQ to AsyncStorage — skipped
- [-] Offline banner — skipped
- [-] Offline bill decoder — skipped (ERC rates are hardcoded in constants.ts anyway)
- [-] Offline heat map cache — skipped

### Error States ✅

- [x] OCR failure → redirect to manual input with friendly Taglish message
- [x] API timeout / error → shows error state screen with retry button
- [x] Empty heat map data → graceful empty state
- [x] All forms have Taglish validation messages

### UI Polish (Partial)

- [x] Consistent color system: brand orange `#F97316`, semantic 🟢🟡🔴
- [x] Typography: large verdicts, readable body text
- [x] SafeAreaView from `react-native-safe-area-context` everywhere
- [-] Loading skeletons — skipped (ActivityIndicator used instead)
- [-] Haptic feedback — skipped
- [x] App icon and splash screen — basic

---

## Phase 6: Deploy + Demo Prep (Partial) 🔶
**Goal:** Shareable APK link + demo script ready.

- [x] Configure `eas.json` with preview APK profile
- [x] Link project to EAS (`eas init --force`) → @xenix278/kuryenteko
- [x] Run `eas build --platform android --profile preview` — APK built
- [x] APK available: expo.dev/accounts/xenix278/projects/kuryenteko/builds/0c31b81e-d000-457a-b4c1-3f3eaf978c95
- [ ] **NEXT:** Add `EXPO_PUBLIC_*` secrets to EAS dashboard → expo.dev/accounts/xenix278/projects/kuryenteko/secrets
- [ ] **NEXT:** Rebuild APK after adding secrets (current APK has no working API keys)
- [ ] Test rebuilt APK on physical device
- [-] Vercel landing page — optional, deferred
- [ ] Prepare 3-minute demo script following the Aling Rosa narrative
- [x] Seed heat map with realistic Metro Manila dummy data (`docs/seed-heat-map.sql`)
- [ ] Prepare 3 sample Meralco bills for live OCR demo

---

## Phase 7: Bill History (NOT STARTED)
**Goal:** User can view past scanned/entered bills without re-scanning.  
**Demo checkpoint:** Scan a bill → see verdict → go back → history screen shows past bill with date and verdict badge.

### Storage
- [ ] `npx expo install @react-native-async-storage/async-storage`
- [ ] Create `store/historyStore.ts` — Zustand slice with AsyncStorage persistence:
  - `bills: BillRecord[]` — array of past bill records, newest first, max 20
  - `addBill(record)` — prepends new record, deduplicates by id
  - `clearHistory()` — wipe all records
- [ ] Define `BillRecord` type:
  ```ts
  interface BillRecord {
    id: string           // Date.now().toString()
    date: string         // ISO string
    city: string
    totalAmount: number
    kwh: number
    ratePerKwh: number
    verdict: {
      status: 'normal' | 'high' | 'overcharged'
      overchargeAmount: number
      userRatePerKwh: number
      ercMaxRatePerKwh: number
    }
  }
  ```

### Auto-save
- [x] `app/verdict.tsx` — auto-saves on mount via `useRef` guard (no duplicate saves when re-viewing from history)

### History Screen
- [x] `app/history.tsx` — newest-first cards, tap to re-view verdict, long-press to delete, "Burahin Lahat", empty state
- [x] `app/index.tsx` — "📋 Kasaysayan ng Bill" link + `loadForUser(userId)` on auth change
- [x] `app/_layout.tsx` — history route registered

---

## Backlog (Post-Hackathon)

- [ ] Sync bill history to Supabase (cloud backup, cross-device)
- [ ] Google OAuth (needs EAS build SHA-1 → Google Cloud Console → Supabase)
- [ ] Monthly bill forecast with weather/rate adjustments
- [ ] Appliance energy audit calculator
- [ ] Solar payback calculator
- [ ] Push notifications for mid-month bill alerts
- [ ] iOS build via EAS
- [ ] Support for VECO, CEPALCO, and other electric coops
- [ ] OTA updates via `eas update` for JS-only changes post-first-build

---

## Completed

<!-- ✅ Phase 0: Setup — completed 2026-05-12 -->
<!-- ✅ Phase 1: Input Screens — completed 2026-05-12 -->
<!-- ✅ Phase 2: Bill Decoder + Verdict — completed 2026-05-12 -->
<!-- ✅ Phase 2.5: Auth — completed 2026-05-13 (unplanned addition) -->
<!-- ✅ Phase 3: AI Chatbot + Heat Map — completed 2026-05-13 (Cerebras not OpenAI, WebView/Leaflet not react-native-maps) -->
<!-- ✅ Phase 4: Action Screens — completed 2026-05-13 (guide screens, not letter generators) -->
<!-- 🔶 Phase 5: Polish — partial, offline skipped -->
<!-- 🔶 Phase 6: Deploy — APK built, secrets + Google Maps key + demo prep remaining -->
<!-- ✅ Phase 7: Bill History — completed 2026-05-13 (per-user AsyncStorage, history screen, auto-save) -->
