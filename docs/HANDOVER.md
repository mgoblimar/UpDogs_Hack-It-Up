# Handover

> Snapshot of project state for a new session, a new developer, or a new AI context window.

**Last updated:** 2026-05-12  
**Updated by:** Claude session (Phase 3 complete)

---

## Current State

**Phase:** Active Development  
**Milestone:** Phase 3 DONE — Phase 4 (ERC/DTI/Lifeline screens) next  
**Deadline:** Hackathon demo (imminent)

### What works right now

- [x] Home screen — two entry points: Scan Bill + Manual Input
- [x] Manual Input — 3-field form (totalAmount, kwh, city) with React Hook Form validation
- [x] Bill Scanner — camera + gallery, sends base64 to OpenRouter OCR
- [x] OCR — working with `nvidia/nemotron-nano-12b-v2-vl:free` via OpenRouter
- [x] Confirm screen — editable extracted fields before analysis
- [x] Bill Decoder screen — charge breakdown with ✅⚠️🚨 status per line item, expandable Taglish explanations
- [x] Verdict screen — overcharge amount, rate comparison, action cards (ERC complaint, heat map, AI chat)
- [x] Bill analysis logic — compares user rate vs ERC April 2026 rates
- [x] AI Chatbot (`app/chat.tsx`) — Taglish chatbot using Cerebras (llama-3.3-70b), bill-context-aware
- [x] Community Heat Map (`app/heat-map.tsx`) — city list with color-coded avg bill from Supabase, submit own data
- [x] Placeholder screens — erc-complaint, lifeline-checker, dti-report (all show "Coming Phase X")
- [x] Expo Go — app runs on physical Android device via LAN

### What's in progress

| Task | Owner | Notes |
|------|-------|-------|
| Phase 4: ERC Complaint screen | Claude + dev | Build `app/erc-complaint.tsx` |
| Phase 4: Lifeline Checker | Claude + dev | Build `app/lifeline-checker.tsx` |
| Phase 4: DTI Report screen | Claude + dev | Build `app/dti-report.tsx` |
| Supabase setup | Manual (user) | Migration SQL ready in `docs/supabase-migration.sql` |

### What's blocked

| Blocker | Reason | Waiting on |
|---------|--------|-----------|
| Heat Map data | Supabase migration not yet run | User must run `docs/supabase-migration.sql` in Supabase SQL Editor |
| AI Chatbot | Needs Cerebras API key | User must get key at cloud.cerebras.ai and add to `.env` |
| Tunnel sharing | ngrok `remote gone away` error | Use hotspot method or wait for ngrok to recover |
| OCR rate limits | `nvidia/nemotron-nano-12b-v2-vl:free` has 200 req/day limit | Intermittent — retry or add $1 OpenRouter credits |

---

## Known Issues

| Issue | Severity | File / Location | Notes |
|-------|----------|----------------|-------|
| OCR sometimes returns `content: null` | Medium | `services/ocrService.ts` | Happens when model uses all 2000 tokens on reasoning. Retry works. |
| ERC rates are April 2026 — not live | Low | `lib/constants.ts` | Hardcoded, update monthly for accuracy |
| Heat map shows empty if Supabase not set up | Medium | `app/heat-map.tsx` | Graceful error shown, but needs Supabase migration run |
| Supabase client throws on missing env vars | Medium | `lib/supabase.ts` | Will crash if Supabase vars missing — comment out import if needed |

---

## Codebase Health

| Check | Status |
|-------|--------|
| Build | Passing (Expo Go running) |
| Tests | None — skipped for hackathon |
| Type errors | Unknown — not checked recently |
| Lint | Not configured |
| Coverage | N/A |

---

## Architecture Decisions Made This Sprint

- **OCR provider is switchable** — set `EXPO_PUBLIC_OCR_PROVIDER` in `.env` to `openrouter`, `gemini`, or `openai`. No code changes needed to switch.
- **OpenRouter model** — using `nvidia/nemotron-nano-12b-v2-vl:free` with `max_tokens: 2000` (model needs headroom for internal reasoning before outputting JSON)
- **`totalAmount` = "Charges for this billing period"** — NOT "Total Amount Due" which includes previous unpaid balance. OCR prompt explicitly instructs this.
- **ERC rates updated to April 2026** — overall max is ₱14.3496/kWh
- **`react-native-css-interop/babel.js` was patched** — removed `react-native-worklets/plugin` line that caused bundling to fail. This patch lives in `node_modules` and will be lost on `npm install`. If it breaks again, re-patch that file.
- **SafeAreaView** — using `react-native-safe-area-context` version, NOT `react-native` built-in (deprecated)
- **Page 1 of Meralco bill only** — sufficient for full OCR extraction, Page 2 not needed
- **Cerebras for AI chat** — free tier, ultra fast (llama-3.3-70b), text-only. System prompt includes ERC rates + bill context from Zustand store.
- **Heat map uses raw REST API** — not Supabase JS client, to avoid the throw-on-missing-env issue. Fetches from `city_heat_map` view. Submit via POST to `community_reports`.
- **Heat map is list-based** — not `react-native-maps` (requires native/EAS build). Cards with color-coded status (low/medium/high).

---

## Environment Notes

| Environment | Status | Notes |
|-------------|--------|-------|
| Local (Expo Go) | Working | LAN mode — phone + PC on same WiFi |
| Tunnel | Broken | ngrok errors — use hotspot workaround |
| EAS Build | Not started | Phase 6 |

### Required env vars

```bash
EXPO_PUBLIC_OCR_PROVIDER=openrouter          # "openrouter" | "gemini" | "openai"
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...  # from openrouter.ai/keys
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...         # from aistudio.google.com (optional)
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...       # from platform.openai.com (optional)
EXPO_PUBLIC_CEREBRAS_API_KEY=csk-...         # from cloud.cerebras.ai (free)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## What to do next

1. **Get Cerebras API key** — go to cloud.cerebras.ai, sign up free, copy key → add to `.env` as `EXPO_PUBLIC_CEREBRAS_API_KEY`
2. **Run Supabase migration** — `docs/supabase-migration.sql` in Supabase SQL Editor
3. **Build Phase 4 screens** — erc-complaint, lifeline-checker, dti-report (currently placeholders)
4. **EAS Build** — `eas build --platform android --profile preview` for shareable APK
5. **Demo prep** — seed more heat map data, 3-minute demo script

---

## Context for AI

- Project is **KuryenteKo** — Filipino electricity bill analyzer app for UPM hackathon
- Stack: Expo SDK 54, React Native 0.81.5, Expo Router, NativeWind v4, Zustand, Supabase
- Language style: **Taglish** (mix of Tagalog + English) for all UI text
- Brand color: `#F97316` (orange) — used as `bg-brand-orange` in NativeWind
- All npm installs require `--legacy-peer-deps` flag
- `npx expo start --clear` needed after `.env` changes or package installs
- The `node_modules/react-native-css-interop/babel.js` patch — if bundling fails with `react-native-worklets/plugin` error, that file needs its worklets line restored (it was patched back in after installing worklets properly)
- Cerebras is used for the AI chatbot (Phase 3) — free, ultra fast, but text-only (no vision)
- User's phone is Android, located in Bacoor — tested with real Meralco bill
- DO NOT use `SafeAreaView` from `react-native` — use from `react-native-safe-area-context`
- Supabase migration SQL is ready but NOT yet run — user needs to do this manually
- Heat map uses raw fetch (not supabase-js) to avoid crashing when env vars are missing
