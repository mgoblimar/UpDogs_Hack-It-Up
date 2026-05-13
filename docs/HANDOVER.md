# Handover

> Snapshot of project state for a new session, a new developer, or a new AI context window.

**Last updated:** 2026-05-13  
**Updated by:** Claude session (Phase 7 done, map switched to react-native-maps, rebuild needed)

---

## Current State

**Phase:** Active Development  
**Milestone:** Phase 7 DONE — rebuild needed before demo  
**Deadline:** Hackathon demo (imminent)

### What works right now

- [x] Home screen — two entry points: Scan Bill + Manual Input + History link
- [x] Manual Input — 3 required fields + optional Advanced section (generation, transmission, system loss, distribution, taxes charges)
- [x] Bill Scanner — camera + gallery, sends base64 to OpenRouter OCR
- [x] OCR confirm screen — city picker at top, all extracted fields editable
- [x] OCR — working with `nvidia/nemotron-nano-12b-v2-vl:free` via OpenRouter
- [x] Bill Decoder screen — charge breakdown with ✅⚠️🚨 status per line item, expandable Taglish explanations
- [x] Verdict screen — overcharge amount, rate comparison, action cards; auto-saves bill to history on mount
- [x] Bill analysis logic — compares user rate vs ERC April 2026 rates
- [x] AI Chatbot (`app/chat.tsx`) — Taglish, Cerebras `llama3.1-8b`, bill-context-aware, 16-month rate history, key issues, topic restriction, markdown rendering, 12 quick prompt chips (3 random per session via `useFocusEffect`), clickable source cards with favicons
- [x] Community Heat Map (`app/heat-map.tsx`) — tab switcher (🗺️ Mapa / 📋 Listahan), react-native-maps + OSM UrlTile, colored pins per city, personal orange pin, list view with pull-to-refresh
- [x] Bill History (`app/history.tsx`) — AsyncStorage per user ID, newest-first cards, tap to re-view verdict, long-press delete, clear all
- [x] ERC Complaint screen (`app/erc-complaint.tsx`) — grounds, 4-step guide, tappable contacts
- [x] Lifeline Checker (`app/lifeline-checker.tsx`) — auto-detects qualification, bracket table, checklist, how-to-apply
- [x] DTI Report screen (`app/dti-report.tsx`) — sub-meter abuse guide, violations, steps, tappable contacts
- [x] Auth — Email + Password (sign in / sign up), anonymous skip; auto anonymous in `__DEV__`

### What is NOT done yet

| Task | Notes |
|------|-------|
| EAS secrets | API keys not added to EAS dashboard — current APK has no working OCR/AI/Supabase/Maps |
| **Rebuild APK** | Required — add all secrets + Google Maps API key in app.json first |
| Google Maps API key | Get from Google Cloud Console → enable Maps SDK for Android → add to `app.json` |
| Google OAuth | Deferred — needs EAS build SHA-1 fingerprint → Google Cloud Console → Supabase |
| Demo prep | 3-min script, 3 sample Meralco bills for live OCR demo |
| Vercel landing page | Optional — app name, APK link, screenshots |

### What's blocked

| Blocker | Fix |
|---------|-----|
| APK has no API keys | Add all `EXPO_PUBLIC_*` secrets at expo.dev/accounts/xenix278/projects/kuryenteko/secrets |
| Map blocked in Expo Go | Needs Google Maps API key in `app.json` + full rebuild — map only works in APK |
| Heat map submit 401 | Run in Supabase SQL Editor: `GRANT INSERT ON community_reports TO anon, authenticated;` |

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
│   └── ocrService.ts        # OCR abstraction (OpenRouter/Gemini/OpenAI)
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

1. **Get Google Maps API key** → Google Cloud Console → enable Maps SDK for Android → add key to `app.json` android.config.googleMaps.apiKey
2. **Add all EAS secrets** → expo.dev/accounts/xenix278/projects/kuryenteko/secrets (all EXPO_PUBLIC_* vars)
3. **Rebuild APK** → `eas build --platform android --profile preview`
4. **Fix Supabase heat map submit** → `GRANT INSERT ON community_reports TO anon, authenticated;`
5. **Google OAuth** → after rebuild, get SHA-1 from EAS build logs → Google Cloud Console → Supabase
6. **Demo prep** → 3-min script, 3 sample bills for OCR demo

---

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
