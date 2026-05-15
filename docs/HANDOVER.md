# Handover

> Snapshot of project state for a new session, a new developer, or a new AI context window.

**Last updated:** 2026-05-15
**Updated by:** Claude session (Phase 8 done, Tavily live news, communityService, newsService, home dashboard real data, verdict El Niño + accordions + sources + Tavily news section, ChargeRow preset questions, chat auto-send q param + Tavily in system prompt, swipe-to-delete history, ERC auto-template + mailto, GestureHandlerRootView fix, demo scripts updated)

---

## Current State

**Phase:** Active Development
**Milestone:** Phase 8 DONE — EAS rebuild + API keys needed before demo
**Deadline:** Hackathon demo (imminent)

### What works right now

- [x] Home screen — Scan/Input button, KoKo FAB, real dashboard widgets
- [x] **Estimated Bill widget** — calculates from bill history (last month → 3-bill avg → latest fallback)
- [x] **Fairness Check widget** — live rate vs ERC max, color-coded, ERC Complaint shortcut when overcharged
- [x] **Community Update** — live Supabase data (totalReports + top city bar chart), seeded fallback
- [x] Manual Input — 3 required fields + optional Advanced section
- [x] Bill Scanner — camera + gallery, sends base64 to OpenRouter OCR
- [x] OCR confirm screen — city picker at top, all extracted fields editable
- [x] OCR — working with `nvidia/nemotron-nano-12b-v2-vl:free` via OpenRouter
- [x] Bill Decoder screen — charge breakdown with ✅⚠️🚨 status, expandable Taglish explanations, **preset KoKo question chips per charge type** → deep-links to chat with auto-send
- [x] Verdict screen — overcharge amount, rate comparison, El Niño summer alert banner, **"Bakit Ganito ang Presyo?" accordion** (7 key issues with impact badges), **sources dropdown** (8 tappable links), **live Tavily news section** (real articles from Inquirer/BusinessWorld), action cards
- [x] Bill analysis logic — compares user rate vs ERC April 2026 rates
- [x] AI Chatbot (`app/chat.tsx`) — Taglish, Cerebras `llama3.1-8b`, bill-context-aware, **Tavily live news injected into system prompt**, 16-month rate history, key issues, topic restriction, markdown rendering, 12 quick prompt chips (3 random per session), clickable source cards, **auto-sends `q` param from ChargeRow deep links**
- [x] Community Heat Map — tab switcher (🗺️ Mapa / 📋 Listahan), react-native-maps + OSM UrlTile, colored pins per city, personal orange pin, list view with pull-to-refresh
- [x] Bill History — AsyncStorage per user ID, newest-first cards with amber/red/green verdict badges, **swipe-left to delete** (with confirmation Alert), "Burahin Lahat" in header, tap to re-view verdict
- [x] ERC Complaint screen — **auto-generated formal complaint template** pre-filled with bill data + overcharge + ERC Rule 16 citation, editable textarea, **"I-Email sa ERC" mailto deep link**, grounds, 4-step guide, tappable contacts
- [x] Lifeline Checker — auto-detects qualification, bracket table, checklist, how-to-apply
- [x] DTI Report screen — sub-meter abuse guide, violations, steps, tappable contacts
- [x] Auth — Email + Password (sign in / sign up), anonymous skip; auto anonymous in `__DEV__`
- [x] `services/newsService.ts` — Tavily wrapper with 10-min in-memory cache, `buildNewsContext()` for AI prompt injection
- [x] `services/communityService.ts` — Supabase community stats with seeded fallback, `rateToBarPct()`, `rateToColor()`

### What is NOT done yet

| Task | Priority | Notes |
|------|----------|-------|
| **EAS secrets** | 🔴 CRITICAL | Add all `EXPO_PUBLIC_*` vars at expo.dev/accounts/xenix278/projects/kuryenteko/secrets — including new `EXPO_PUBLIC_TAVILY_API_KEY` |
| **Rebuild APK** | 🔴 CRITICAL | Required after adding secrets + Google Maps key in app.json |
| **Google Maps API key** | 🔴 CRITICAL | console.cloud.google.com → enable Maps SDK for Android → add to `app.json` android.config.googleMaps.apiKey |
| **Tavily API key** | 🟡 HIGH | app.tavily.com → free tier 1,000/month → add `EXPO_PUBLIC_TAVILY_API_KEY` to `.env` + EAS secrets |
| Google OAuth | 🟢 LOW | Deferred — needs EAS build SHA-1 fingerprint |
| Demo prep | 🟡 HIGH | Use a real Meralco bill with rate > ₱14.35/kWh so verdict shows "May Overcharge!" |
| Vercel landing page | 🟢 LOW | Optional |
| `billingMonth` field | 🟢 LOW | Phase 8A — not yet added to BillRecord; estimate widget uses scan date instead (works fine for demo) |

### What's blocked

| Blocker | Fix |
|---------|-----|
| APK has no API keys | Add all `EXPO_PUBLIC_*` secrets at expo.dev/accounts/xenix278/projects/kuryenteko/secrets |
| Map blocked in Expo Go | Needs Google Maps API key in `app.json` + full rebuild — map only works in APK |
| Heat map submit 401 | Run in Supabase SQL Editor: `GRANT INSERT ON community_reports TO anon, authenticated;` |
| Tavily news not showing | Add `EXPO_PUBLIC_TAVILY_API_KEY=tvly-...` to `.env` → `npx expo start --clear` |
| App icon white background | Replace `assets/icon.png` + `assets/adaptive-icon.png` with transparent-bg versions via remove.bg — then rebuild |
| Google Maps API key in app.json | Key is hardcoded (`AIzaSyD8Kf8Dt3HENM0uO9jVvQRfUcBe8r1B9og`) — fine for hackathon, rotate post-event |

---

## Phase 7: Bill History ✅ DONE

**Goal:** User can view past scanned/entered bills without re-scanning.

### What was built

- `@react-native-async-storage/async-storage` installed
- `types/bill.ts` — `BillRecord` type added
- `store/historyStore.ts` — manual AsyncStorage (no Zustand persist), keyed by `userId` (`bill-history-${userId}`), max 20 bills, deduplication by id
- `app/verdict.tsx` — auto-saves on mount via `useRef` guard (prevents duplicate saves when re-viewing from history)
- `app/history.tsx` — newest-first cards, tap to re-view verdict, long-press to delete, "Burahin Lahat" button, empty state
- `app/index.tsx` — "📋 Kasaysayan ng Bill" link + calls `loadForUser(userId)` on auth state change
- `app/_layout.tsx` — history route registered

### Key decisions

- **Per-user storage** — each `auth.uid()` gets its own AsyncStorage key, so switching accounts shows the correct history
- **Deterministic ID** — `${city}-${totalAmount}-${kwh}` prevents duplicates when re-viewing the same bill from history
- **Local only** — no Supabase sync (post-hackathon backlog)

---

## Known Issues & Patches

| Issue | Severity | Notes |
|-------|----------|-------|
| `react-native-css-interop` navigation context crash | HIGH — patched | `node_modules/react-native-css-interop/dist/runtime/native/render-component.js` — `stringify()` serializes React Navigation context getter which throws. **Patch:** try-catch inside `Object.entries` loop. Lost on `npm install` — re-patch if crash returns. |
| `react-native-css-interop/babel.js` worklets plugin | MEDIUM — patched | If bundling fails with `react-native-worklets/plugin` error, check/restore that line |
| `router.replace()` during render | RESOLVED | Never call router navigation directly in render body — always wrap in `useEffect`. Was fixed in `verdict.tsx`. |
| Heat map submit 401 | UNRESOLVED | `GRANT INSERT ON community_reports TO anon, authenticated;` in Supabase SQL Editor |
| OCR returns `content: null` | Medium | Model uses all tokens on reasoning. Retry works. |
| ERC rates hardcoded April 2026 | Low | Update monthly in `lib/constants.ts` |

---

## Re-patch Instructions (if npm install is run)

File: `node_modules/react-native-css-interop/dist/runtime/native/render-component.js`

Find the `for (const entry of Object.entries(value))` loop inside `stringify` and wrap with try-catch:

```js
for (const entry of Object.entries(value)) {
  try {
    newValue[entry[0]] = replace(entry[0], entry[1]);
  } catch (_) {
    newValue[entry[0]] = '[Unserializable]';
  }
}
```

---

## Architecture Decisions

- **OCR provider switchable** — `EXPO_PUBLIC_OCR_PROVIDER` = `openrouter` | `gemini` | `openai`
- **OpenRouter model** — `nvidia/nemotron-nano-12b-v2-vl:free`, `max_tokens: 2000`
- **`totalAmount` = "Charges for this billing period"** — NOT "Total Amount Due" (includes unpaid balance)
- **ERC rates April 2026** — overall max ₱14.3496/kWh, hardcoded in `lib/constants.ts`
- **SafeAreaView** — always from `react-native-safe-area-context`, never `react-native`
- **No router navigation during render** — always `useEffect`. Learned from verdict.tsx crash.
- **Cerebras model** — must be `llama3.1-8b` (not `llama-3.3-70b` or `llama3.3-70b` — 404)
- **AI topic restriction** — hard refusal block in system prompt for non-electricity questions
- **AI quick prompts** — 12 defined, 3 random shown via `useFocusEffect` (re-randomizes on every screen focus)
- **AI sources** — `ChatBubble` splits on `📚 Sources:`, renders link-preview cards (favicon from `google.com/s2/favicons`, tap → `Linking.openURL`)
- **AI markdown** — custom `MarkdownBody` component handles `**bold**`, `*italic*`, `- bullets`, numbered lists
- **Heat map tabs** — 🗺️ Mapa (full-screen react-native-maps + OSM UrlTile, default) / 📋 Listahan (scrollable cards)
- **Heat map map provider** — `react-native-maps` with OSM `UrlTile` (`tile.openstreetmap.org`). Google Maps API key required in `app.json` for Android — map only works in APK, blocked in Expo Go without key.
- **Heat map personal marker** — orange `Marker` at user's city (pinColor `#F97316`). Community data = separate colored `Marker` pins (green/yellow/red).
- **Heat map coords** — `CITY_COORDS` in `heat-map.tsx` has 31 Philippine cities. Cities not in map get `*` note in list.
- **Bill History storage** — `AsyncStorage` keyed by `bill-history-${userId}`. Each auth account has isolated history. `loadForUser(userId)` called on auth state change in `app/index.tsx`.
- **Bill History deduplication** — id is `${city}-${totalAmount}-${kwh}`, so same bill re-viewed from history won't create a duplicate entry.
- **Supabase `isSupabaseConfigured`** — guard flag in `lib/supabase.ts`, all Supabase calls check this first
- **Auth redirect** — `<Redirect href="/sign-in" />` in `app/index.tsx`, NOT in `_layout.tsx` (causes navigation context crash)
- **Supabase email confirmation** — disabled in dashboard (free tier 2 emails/hour limit)
- **Manual input advanced fields** — optional collapsible section for individual charges, flows into bill analysis same as OCR

---

## File Map

```
kuryenteko/
├── app/
│   ├── _layout.tsx          # Root layout — anonymous auth in __DEV__
│   ├── index.tsx            # Home — <Redirect> to /sign-in if no session
│   ├── sign-in.tsx          # Email+Password auth (sign in / sign up + anonymous skip)
│   ├── scanner.tsx          # OCR flow: idle → scanning → confirm (with city picker) → error
│   ├── manual-input.tsx     # 3 required fields + optional advanced charge fields
│   ├── bill-decoder.tsx     # Charge breakdown screen
│   ├── verdict.tsx          # Bill verdict + action cards (redirect via useEffect)
│   ├── chat.tsx             # AI chatbot — Cerebras, markdown, quick prompts, source cards
│   ├── heat-map.tsx         # Map tab (Leaflet WebView + personal marker) + list tab
│   ├── erc-complaint.tsx    # ERC complaint guide
│   ├── lifeline-checker.tsx # Lifeline rate eligibility checker
│   ├── dti-report.tsx       # DTI sub-meter abuse report guide
│   ├── history.tsx          # Bill history — per-user AsyncStorage, tap to re-view
│   └── faq.tsx              # FAQ / tips
├── data/
│   └── electricity-context.json  # 16-month rate history, 7 key issues, sources, consumer rights
├── store/
│   ├── billStore.ts         # Zustand: billInput + verdict
│   └── historyStore.ts      # AsyncStorage per userId: BillRecord[], addBill, removeBill, clearHistory
├── lib/
│   ├── supabase.ts          # Supabase client + isSupabaseConfigured
│   └── constants.ts         # ERC rates, METRO_MANILA_CITIES
├── services/
│   ├── ocrService.ts        # OCR abstraction (OpenRouter/Gemini/OpenAI)
│   ├── newsService.ts       # Tavily live news — fetchEnergyNews(), buildNewsContext(), 10-min cache
│   └── communityService.ts  # Supabase community stats — fetchCommunityStats(), rateToBarPct(), rateToColor()
├── types/
│   └── bill.ts              # BillInput, BillVerdict types
└── docs/
    ├── HANDOVER.md          # This file
    ├── TASK_LIST.md         # Phase-by-phase task tracking
    ├── supabase-migration.sql    # Run once in Supabase SQL Editor
    └── seed-heat-map.sql         # 24-city dummy heat map data
```

---

## Environment Variables

```bash
EXPO_PUBLIC_OCR_PROVIDER=openrouter
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...        # optional
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...      # optional
EXPO_PUBLIC_CEREBRAS_API_KEY=csk-...        # from cloud.cerebras.ai (free)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...   # Maps SDK for Android — also add to app.json android.config.googleMaps.apiKey
EXPO_PUBLIC_TAVILY_API_KEY=tvly-...         # app.tavily.com — live news in verdict + chat system prompt
```

Add all of these to **expo.dev/accounts/xenix278/projects/kuryenteko/secrets** before next build.

---

## Supabase Setup (one-time)

```sql
-- Run supabase-migration.sql first, then:
GRANT SELECT ON city_heat_map TO anon, authenticated;
GRANT INSERT ON community_reports TO anon, authenticated;
GRANT SELECT ON community_reports TO anon, authenticated;
```

---

## EAS Build

- **Project:** @xenix278/kuryenteko
- **Build dashboard:** expo.dev/accounts/xenix278/projects/kuryenteko
- **Last APK build:** 0c31b81e-d000-457a-b4c1-3f3eaf978c95 (no API keys — rebuild after adding secrets)
- **Next build command:** `eas build --platform android --profile preview`
- **OTA updates (after first build):** `eas update --branch preview --message "description"`

---

## What to do next (in order)

1. **Get Tavily API key** → app.tavily.com → sign up free → copy key → add `EXPO_PUBLIC_TAVILY_API_KEY` to `.env`
2. **Get Google Maps API key** → console.cloud.google.com → enable Maps SDK for Android → add to `.env` and `app.json` android.config.googleMaps.apiKey
3. **Add ALL EAS secrets** → expo.dev/accounts/xenix278/projects/kuryenteko/secrets
   - All existing `EXPO_PUBLIC_*` vars
   - `EXPO_PUBLIC_TAVILY_API_KEY` (new)
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (new)
4. **Rebuild APK** → `eas build --platform android --profile preview`
5. **Fix Supabase heat map submit** → `GRANT INSERT ON community_reports TO anon, authenticated;`
6. **Demo prep** → Use a real bill where effective rate > ₱14.35/kWh so verdict shows red "May Overcharge!" card
7. **Google OAuth** → after rebuild, get SHA-1 from EAS build logs (optional, post-hackathon)

---

## Phase 7.5 Plan: ERC Complaint Template Auto-Generation

**Goal:** Replace the blank "Mensahe ng Reklamo" textarea with a pre-filled, legally grounded complaint letter that the user can edit and send — zero typing required for the common case.

**File:** `app/erc-complaint.tsx`

---

### What to Build

**1. Auto-generate the complaint body on mount**

When the screen loads, read `billInput` and `verdict` from `billStore` and construct a complaint letter string. Set this as the initial `message` state instead of `''`.

Template (fill in values from store):

```
Ako po ay isang consumer ng [DISTRIBUTION_UTILITY] sa [CITY].

Nais ko pong mag-file ng formal na reklamo tungkol sa aking electric bill para sa buwan ng [BILLING_MONTH].

DETALYE NG BILL:
- Kabuuang halaga ng bill: ₱[TOTAL_AMOUNT]
- kWh na natupok: [KWH] kWh
- Epektibong rate na siningil: ₱[USER_RATE]/kWh

LEGAL NA BATAYAN:
Ayon sa ERC Resolution No. 10, Series of 2001 (Magna Carta for Residential Electricity Consumers), Rule 16, Section 4, ang maximum na allowable na rate para sa residential consumers sa aking lugar ay ₱[ERC_MAX_RATE]/kWh (ERC-cleared rate, [RATE_MONTH]).

OVERCHARGE:
Ang aking epektibong rate na ₱[USER_RATE]/kWh ay lumagpas ng ₱[DIFF]/kWh sa itaas ng legal na maximum. Para sa [KWH] kWh na aking natupok, ito ay katumbas ng ₱[OVERCHARGE_AMOUNT] na karagdagang singil.

Humihingi po ako ng:
1. Pormal na paliwanag sa pagkakaiba ng aking rate at ang ERC-cleared rate
2. Refund o credit ng labis na siningil (₱[OVERCHARGE_AMOUNT])
3. Pagsunod sa ERC-approved rates para sa lahat ng susunod na bill

Nakalakip ang kopya ng aking bill para sa inyong reference.

Maraming salamat po.

[CONSUMER NAME]
[CITY]
[DATE]
```

**2. Fill-in logic**

```ts
function buildComplaintTemplate(
  billInput: Partial<BillInput>,
  verdict: VerdictResult,
  rates: ERCRates,
): string {
  const city = billInput.city || '[Lungsod]'
  const totalAmount = billInput.totalAmount?.toFixed(2) ?? '0.00'
  const kwh = billInput.kwh ?? 0
  const userRate = verdict.userRatePerKwh.toFixed(4)
  const ercMax = verdict.ercMaxRatePerKwh.toFixed(4)
  const diff = (verdict.userRatePerKwh - verdict.ercMaxRatePerKwh).toFixed(4)
  const overcharge = verdict.overchargeAmount.toFixed(2)
  const month = new Date().toLocaleDateString('fil-PH', { month: 'long', year: 'numeric' })

  return `Ako po ay isang consumer ng Meralco sa ${city}.\n\n...` // full template above
}
```

Call this in a `useEffect` on mount if `verdict` is not null and `message` is still empty:

```ts
useEffect(() => {
  if (verdict && message === '') {
    setMessage(buildComplaintTemplate(billInput, verdict, ERC_RATES))
  }
}, [verdict])
```

**3. Add a "Kopyahin ang Mensahe" (Copy) button**

Below the textarea, add a secondary button that calls `Clipboard.setStringAsync(message)` from `expo-clipboard`. Label: `📋 Kopyahin ang Mensahe`. This lets the user paste into any email client or the ERC web portal.

```ts
import * as Clipboard from 'expo-clipboard'

<TouchableOpacity onPress={() => Clipboard.setStringAsync(message)}>
  <Text>📋 Kopyahin ang Mensahe</Text>
</TouchableOpacity>
```

Install if not present: `npx expo install expo-clipboard --legacy-peer-deps`

**4. Add a "I-email sa ERC" button**

Pre-compose the email via `mailto:` deep link so the user opens their mail app with subject and body pre-filled:

```ts
function handleEmailERC() {
  const subject = encodeURIComponent('Formal Consumer Complaint — Rate Overcharge')
  const body = encodeURIComponent(message)
  Linking.openURL(`mailto:consumer_affairs@erc.ph?subject=${subject}&body=${body}`)
}
```

Replace or supplement the current "I-Submit sa ERC" button (which just opens the website) with this email CTA as the primary action.

**5. Expand the legal basis section**

Add a collapsible "Legal na Batayan" panel below the grounds list with the specific ERC provisions:

| Provision | Coverage |
|-----------|---------|
| ERC Resolution No. 10, Series of 2001 | Magna Carta for Residential Electricity Consumers |
| Rule 16, Sec. 4 | Rate overcharge — distributor may not charge above ERC-cleared rate |
| Rule 17 | System loss cap — maximum 8.5% of total kWh |
| RA 9136 (EPIRA), Sec. 74 | Consumer protection — right to accurate billing |
| DOE Dept. Circular DC2022-11-0034 | Sub-meter prohibition in apartments without ERC authority |

---

### Files to Change

| File | Change |
|------|--------|
| `app/erc-complaint.tsx` | Add `buildComplaintTemplate()`, pre-fill `message` state, add Copy + Email buttons, expand legal panel |
| `app.json` plugins | Add `expo-clipboard` if not already in plugins |

### No new screens needed — all changes are in the existing `erc-complaint.tsx`.

---

## Phase 8 Plan: Dashboard Intelligence

**Goal:** Make the home screen a living dashboard — not just two buttons, but a quick financial health summary the user can glance at every month.

Four features to build, in dependency order:

---

### Feature 8A — Billing Month Capture (prerequisite for everything below)

**Problem:** `BillInput` has `billingMonth?: string` but it is never surfaced in any UI and never stored in `BillRecord`. History cards show the scan date, not the bill month.

**What to build:**

1. **Add `billingMonth` to `BillRecord`** (`types/bill.ts`):
   ```ts
   export interface BillRecord {
     id: string
     date: string          // scan date (ISO)
     billingMonth: string  // 'YYYY-MM' — e.g. '2026-04' for April 2026 bill
     city: string
     totalAmount: number
     kwh: number
     ratePerKwh: number
     verdict: { ... }
   }
   ```

2. **Manual Input screen** (`app/manual-input.tsx`) — add a "Buwan ng Bill" month picker above the City field. A simple `TextInput` with placeholder `"hal. Abril 2026"` is fine; a `DateTimePicker` (month-only) is better if time allows. Store result as `'YYYY-MM'` in `BillInput.billingMonth`.

3. **OCR Confirm screen** (`app/scanner.tsx` → `ConfirmScreen`) — add a "Buwan ng Bill" row between the city field and "Charges for this Billing Period". OCR may extract the billing period string — parse it into `'YYYY-MM'` before pre-filling. Editable TextInput as fallback.

4. **`verdict.tsx`** — pass `billingMonth: billInput.billingMonth ?? new Date().toISOString().slice(0, 7)` when calling `addBill`.

5. **`historyStore.ts`** — `addBill` and `BillRecord` already typed above; no logic change needed.

6. **History screen** (`app/history.tsx`) — show `billingMonth` on each card (e.g. "Abril 2026") instead of or alongside the scan date. Format: `new Date(record.billingMonth + '-01').toLocaleDateString('fil-PH', { month: 'long', year: 'numeric' })`.

**Testing:** Scan a bill → confirm screen shows "Buwan ng Bill" row → go to History → card shows correct month.

---

### Feature 8B — "Estimatong Bill Ngayong Buwan" Widget

**Location:** Home screen (`app/index.tsx`), between the two action buttons and the History link.

**Algorithm (in order of preference):**

```
previousMonth = current month - 1 month (e.g. if today is May 2026 → April 2026)

1. If there is a BillRecord with billingMonth === previousMonth:
     estimate = that record's totalAmount
     label = "Batay sa iyong bill noong [buwan]"

2. Else if there are >= 3 BillRecords:
     estimate = average(last 3 records by billingMonth desc).totalAmount
     label = "Average ng iyong huling 3 bill"

3. Else if there is >= 1 BillRecord:
     estimate = lastRecord.totalAmount
     label = "Batay sa iyong pinakabagong bill"

4. Else:
     show nothing (widget hidden)
```

**UI:** A soft card below the action buttons:
```
┌─────────────────────────────────────────────┐
│ ⚡ Estimatong Bill Ngayong Buwan             │
│ ₱2,847.00           [label text in gray]    │
│ Para sa Mayo 2026                           │
└─────────────────────────────────────────────┘
```
- "Para sa [month]" = current month name
- Tap the card → opens History screen
- Widget hidden if no history at all

**Where to add:**
- `app/index.tsx` — read `historyStore` bills, compute estimate in a `useMemo`, render widget

---

### Feature 8C — "Fairness Check" Widget

**Location:** Home screen, below Estimatong Bill widget.

**Logic:**
```
latestBill = bills sorted by billingMonth desc → [0]
if latestBill exists:
  userRate = latestBill.ratePerKwh
  ercRate  = ERC_OVERALL_MAX_RATE   // from lib/constants.ts — ₱14.3496/kWh
  diff     = userRate - ercRate

  if diff > 0.50 → status = 'overcharged', color red
  if diff > 0.10 → status = 'high', color amber
  else           → status = 'fair', color green
```

**UI:**
```
┌─────────────────────────────────────────────┐
│ ⚖️ Fairness Check                           │
│                                             │
│  Iyong rate:   ₱14.8500/kWh   🔴           │
│  ERC maximum:  ₱14.3496/kWh               │
│  Pagkakaiba:   +₱0.5004/kWh               │
│                                             │
│  [Gumawa ng ERC Complaint →]               │
└─────────────────────────────────────────────┘
```
- "Gumawa ng ERC Complaint" button only shown when `status === 'overcharged'`
- Tap the button → `router.push('/erc-complaint')`
- Card hidden if no history

**Data source:** `historyStore` bills — no new API calls needed.

---

### Feature 8D — "Kommunity Update" Real Data

**Current state:** Hardcoded "Bills na-verify" count and hardcoded city bars in `app/index.tsx`.

**What to change:**

**"Bills na-verify" count:**
- Query Supabase: `SELECT COUNT(*) FROM community_reports`
- If Supabase not configured or query fails → fall back to seeded count (current hardcoded number)
- Cache result in component state with a `useEffect` on mount
- Display as e.g. "1,247 bills na-verify sa buong Pilipinas"

**Live overcharge bars (top cities):**
- Current data in `app/(tabs)/map.tsx` fetches from `city_heat_map` Supabase table — reuse that same query
- In `app/index.tsx`, fetch top 3–5 cities from `city_heat_map` ordered by `avg_rate_per_kwh DESC`
- Map into bar chart data: `{ city, avgRate, pctAboveErc: ((avgRate - ERC_MAX) / ERC_MAX) * 100 }`
- Render the same bar-list UI, now with live data
- Fallback: hardcoded seed data if Supabase unavailable

**Supabase query (add to a shared `services/communityService.ts`):**
```ts
export async function fetchCommunityStats() {
  const [countRes, citiesRes] = await Promise.all([
    supabase.from('community_reports').select('*', { count: 'exact', head: true }),
    supabase.from('city_heat_map').select('city, avg_rate_per_kwh, report_count').order('avg_rate_per_kwh', { ascending: false }).limit(5),
  ])
  return {
    totalReports: countRes.count ?? SEEDED_COUNT,
    topCities: citiesRes.data ?? SEEDED_CITIES,
  }
}
```

**Seeded fallbacks** (hardcode current values as `SEEDED_COUNT` and `SEEDED_CITIES` constants so the UI never shows zeros).

---

### Build Order

| Step | File(s) | Blocking? |
|------|---------|-----------|
| 1. Add `billingMonth` to `BillRecord` | `types/bill.ts` | Yes — all other features depend on this |
| 2. Surface in Manual Input | `app/manual-input.tsx` | No |
| 3. Surface in OCR Confirm | `app/scanner.tsx` | No |
| 4. Pass through in verdict | `app/verdict.tsx` | No |
| 5. Show on history cards | `app/(tabs)/history.tsx` | No |
| 6. Estimatong Bill widget | `app/index.tsx` | After step 1 |
| 7. Fairness Check widget | `app/index.tsx` | After step 1 |
| 8. Community stats service | `services/communityService.ts` (new) | No |
| 9. Wire live data to home | `app/index.tsx` | After step 8 |

---

## Demo Video Script

> Full scene-by-scene voiceover script with screen directions is in a dedicated file:
> **[`docs/DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)**
>
> Covers 11 scenes (~2 minutes): Hook → OCR Scanner → Confirm → Bill Decoder → Verdict → ERC Complaint (with template) → Heat Map → KoKo AI → Bill History → Home Dashboard → Closing.

---

## Session Notes (for next AI session)

- All Phase 8 dashboard widgets are wired with real data — no more hardcoded zeros
- Tavily key missing from `.env` — add it first before testing news section
- `services/newsService.ts` and `services/communityService.ts` are new — don't recreate them
- `app/(tabs)/home.tsx` fully rewritten — estimated bill + fairness check + live community bars
- `app/verdict.tsx` fully rewritten — El Niño banner, issues accordion, sources dropdown, Tavily news
- `app/chat.tsx` — Tavily injected into system prompt, auto-sends `q` param from ChargeRow
- `app/(tabs)/history.tsx` — swipe-to-delete with Alert confirmation, Burahin Lahat in header
- `app/erc-complaint.tsx` — auto-generated template, mailto deep link, no redundant back button
- `app/_layout.tsx` — GestureHandlerRootView wraps entire app (required for Swipeable)
- Demo scripts: `docs/DEMO_SCRIPT.md` (2 min, Maria story), `docs/DEMO_SCRIPT_SHORT.md` (1 min)
- Google Maps API key is already in `app.json` (hardcoded) — map works in APK
- `billingMonth` field NOT yet added to BillRecord — Phase 8A deferred, estimate widget uses scan date
- All npm installs need `--legacy-peer-deps`
- After `.env` changes: `npx expo start --clear`
- DO NOT call router navigation during render — always `useEffect`

## Context for AI

- Project: **KuryenteKo** — Filipino electricity bill analyzer, UPM Socomsci hackathon
- Stack: Expo SDK 54, React Native 0.81.5, Expo Router, NativeWind v4, Zustand, Supabase
- UI language: **Taglish** (Tagalog + English mix)
- Brand color: `#F97316` (orange) → `bg-brand-orange` in NativeWind
- All npm installs: `--legacy-peer-deps`
- After `.env` changes or package installs: `npx expo start --clear`
- User's device: Android, Bacoor area — tested with real Meralco bill
- DO NOT call `router.replace()` or any navigation during render — always `useEffect`
- DO NOT use `SafeAreaView` from `react-native` — use `react-native-safe-area-context`
- Cerebras model: `llama3.1-8b` (not `llama-3.3-70b` — 404 error)
- `node_modules` patches lost on `npm install` — see re-patch instructions above
