# Handover

> Snapshot of project state for a new session, a new developer, or a new AI context window.

**Last updated:** 2026-05-13  
**Updated by:** Claude session (Phase 4 complete + AI chat sources)

---

## Current State

**Phase:** Active Development  
**Milestone:** Phase 4 DONE — EAS Build / demo prep next  
**Deadline:** Hackathon demo (imminent)

### What works right now

- [x] Home screen — two entry points: Scan Bill + Manual Input
- [x] Manual Input — 3-field form (totalAmount, kwh, city) with React Hook Form validation
- [x] Bill Scanner — camera + gallery, sends base64 to OpenRouter OCR
- [x] OCR — working with `nvidia/nemotron-nano-12b-v2-vl:free` via OpenRouter
- [x] Confirm screen — editable extracted fields before analysis
- [x] Bill Decoder screen — charge breakdown with ✅⚠️🚨 status per line item, expandable Taglish explanations
- [x] Verdict screen — overcharge amount, rate comparison, action cards (ERC complaint, Lifeline, DTI, heat map, AI chat)
- [x] Bill analysis logic — compares user rate vs ERC April 2026 rates
- [x] AI Chatbot (`app/chat.tsx`) — Taglish chatbot using Cerebras (`llama3.1-8b`), bill-context-aware, includes 16-month rate history + key issues + consumer rights from `data/electricity-context.json`
- [x] AI Sources — `📚 Sources:` section in AI responses renders as tappable link-preview cards (favicon + name + domain → Linking.openURL)
- [x] Community Heat Map (`app/heat-map.tsx`) — city list with color-coded avg bill from Supabase, submit own data, pull-to-refresh
- [x] ERC Complaint screen (`app/erc-complaint.tsx`) — grounds for complaint, 4-step guide, tappable contacts
- [x] Lifeline Checker (`app/lifeline-checker.tsx`) — auto-detects qualification from loaded bill, discount table, requirements checklist, how-to-apply steps
- [x] DTI Report screen (`app/dti-report.tsx`) — sub-meter abuse explainer, violations list, reporting steps, tappable contacts
- [x] Auth — Email + Password (sign in / sign up), anonymous skip button; anonymous auth auto-applied in `__DEV__` mode
- [x] Expo Go — app runs on physical Android device via LAN

### What's in progress / pending

| Task | Notes |
|------|-------|
| EAS Build (APK) | `eas build --platform android --profile preview` — not yet done |
| Google OAuth | Deferred — requires native build + SHA-1 fingerprint in Google Cloud Console |
| Demo prep | Seed more heat map data, 3-min demo script |

### What's blocked

| Blocker | Reason | Waiting on |
|---------|--------|-----------|
| Google OAuth | Expo Go doesn't support OAuth (auth.expo.io deprecated) | EAS native build |
| OCR rate limits | `nvidia/nemotron-nano-12b-v2-vl:free` has 200 req/day limit | Intermittent — retry or add $1 OpenRouter credits |

---

## Known Issues & Patches

| Issue | Severity | File / Location | Notes |
|-------|----------|----------------|-------|
| `react-native-css-interop` navigation context crash | HIGH — patched | `node_modules/react-native-css-interop/dist/runtime/native/render-component.js` | `stringify()` serializes React Navigation context getter which throws. **Patch:** Added try-catch inside `Object.entries` loop. Lost on `npm install` — re-patch if crash returns. |
| `react-native-css-interop/babel.js` worklets plugin | MEDIUM — patched | same package | If bundling fails with `react-native-worklets/plugin` error, check this file and restore/remove that line |
| OCR sometimes returns `content: null` | Medium | `services/ocrService.ts` | Happens when model uses all 2000 tokens on reasoning. Retry works. |
| ERC rates are April 2026 — not live | Low | `lib/constants.ts` | Hardcoded, update monthly for accuracy |
| Heat map permission denied (401) | Resolved | Supabase SQL Editor | Required: `GRANT SELECT ON city_heat_map TO anon, authenticated;` |
| Supabase `flowType: 'pkce'` WebCrypto warning | Resolved | `lib/supabase.ts` | Removed `flowType: 'pkce'` — not supported in React Native |

---

## re-patch Instructions (if npm install is run)

### Patch 1 — render-component.js (navigation context crash)

File: `node_modules/react-native-css-interop/dist/runtime/native/render-component.js`

Find the `for (const entry of Object.entries(value))` loop inside the `stringify`/replacer function and wrap the inner line with try-catch:

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

- **OCR provider is switchable** — set `EXPO_PUBLIC_OCR_PROVIDER` in `.env` to `openrouter`, `gemini`, or `openai`. No code changes needed.
- **OpenRouter model** — `nvidia/nemotron-nano-12b-v2-vl:free` with `max_tokens: 2000`
- **`totalAmount` = "Charges for this billing period"** — NOT "Total Amount Due" (which includes previous unpaid balance). OCR prompt explicitly instructs this.
- **ERC rates updated to April 2026** — overall max is ₱14.3496/kWh
- **SafeAreaView** — always use from `react-native-safe-area-context`, NOT `react-native` built-in
- **Cerebras for AI chat** — free tier, ultra fast (`llama3.1-8b`). System prompt includes ERC rates, 16-month rate history, 7 key issues, consumer rights, and source URLs injected from `data/electricity-context.json`.
- **AI chat sources** — `ChatBubble` splits on `📚 Sources:` marker, parses URLs from each line, renders as link-preview cards using Google's favicon CDN (`https://www.google.com/s2/favicons?domain=...&sz=64`). Tap → `Linking.openURL`.
- **Heat map is list-based** — not `react-native-maps` (requires native/EAS build). Color-coded cards (green/yellow/red). Supabase JS client used (not raw fetch) since `isSupabaseConfigured` guard prevents crash when env vars missing.
- **Auth strategy** — Email + Password in production; anonymous auto-sign-in in `__DEV__` mode. Google OAuth deferred to EAS build. Auth redirect uses `<Redirect href="/sign-in" />` in `app/index.tsx` (NOT in `_layout.tsx` — caused navigation context crash).
- **`isSupabaseConfigured` flag** — `lib/supabase.ts` exports this; all Supabase-dependent screens check it before making calls.
- **Supabase email confirmation** — disabled in Supabase dashboard (free tier email limit: 2/hour). Users are auto-signed-in after `signUp()`.
- **Verdict screen ERC action card** — shows for both `overcharged` AND `high` status (not just overcharged).

---

## File Map

```
kuryenteko/
├── app/
│   ├── _layout.tsx          # Root layout — anonymous auth in __DEV__
│   ├── index.tsx            # Home — Redirect to /sign-in if no session
│   ├── sign-in.tsx          # Email+Password auth (sign in / sign up)
│   ├── chat.tsx             # AI chatbot (Cerebras) with rich source cards
│   ├── heat-map.tsx         # Community heat map (Supabase list view)
│   ├── verdict.tsx          # Bill verdict + action cards
│   ├── erc-complaint.tsx    # ERC complaint guide
│   ├── lifeline-checker.tsx # Lifeline rate eligibility checker
│   ├── dti-report.tsx       # DTI sub-meter abuse report guide
│   ├── bill-decoder.tsx     # Charge breakdown screen
│   ├── confirm.tsx          # OCR result editor
│   ├── manual-input.tsx     # Manual bill entry form
│   └── faq.tsx              # FAQ / tips
├── data/
│   └── electricity-context.json  # 16-month rate history, key issues, sources, consumer rights
├── store/
│   └── billStore.ts         # Zustand store: billInput + verdict
├── lib/
│   ├── supabase.ts          # Supabase client + isSupabaseConfigured flag
│   └── constants.ts         # ERC rates, charge limits
├── services/
│   └── ocrService.ts        # OCR abstraction (OpenRouter/Gemini/OpenAI)
└── docs/
    ├── HANDOVER.md          # This file
    └── supabase-migration.sql  # Run once in Supabase SQL Editor
```

---

## Environment Variables

```bash
EXPO_PUBLIC_OCR_PROVIDER=openrouter          # "openrouter" | "gemini" | "openai"
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...  # from openrouter.ai/keys
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...         # optional
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...       # optional
EXPO_PUBLIC_CEREBRAS_API_KEY=csk-...         # from cloud.cerebras.ai (free)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Supabase Setup (one-time)

Run `docs/supabase-migration.sql` in Supabase SQL Editor, then run:

```sql
GRANT SELECT ON city_heat_map TO anon, authenticated;
GRANT INSERT ON community_reports TO anon, authenticated;
```

---

## Environment Notes

| Environment | Status | Notes |
|-------------|--------|-------|
| Local (Expo Go) | Working | LAN mode — phone + PC on same WiFi |
| Tunnel | Broken | ngrok errors — use hotspot workaround |
| EAS Build | Not started | Next step |

---

## What to do next

1. **EAS Build** — `eas build --platform android --profile preview` for shareable APK
2. **Google OAuth** — after EAS build, add SHA-1 fingerprint to Google Cloud Console → enable Google provider in Supabase → uncomment Google sign-in button in `app/sign-in.tsx`
3. **Demo prep** — seed more heat map data, 3-minute demo script
4. **Bill rate computation** — user mentioned back of Meralco bill shows rate = Total Energy Amount ÷ Actual Consumption (revisit this for accuracy)

---

## Context for AI

- Project is **KuryenteKo** — Filipino electricity bill analyzer app for UPM Socomsci hackathon
- Stack: Expo SDK 54, React Native 0.81.5, Expo Router, NativeWind v4, Zustand, Supabase
- Language style: **Taglish** (mix of Tagalog + English) for all UI text
- Brand color: `#F97316` (orange) — used as `bg-brand-orange` in NativeWind
- All npm installs require `--legacy-peer-deps` flag
- `npx expo start --clear` needed after `.env` changes or package installs
- User's phone is Android, located in Bacoor — tested with real Meralco bill
- DO NOT use `SafeAreaView` from `react-native` — use from `react-native-safe-area-context`
- DO NOT put auth redirects in `_layout.tsx` — causes navigation context crash; use `<Redirect>` in `index.tsx` instead
- Cerebras model must be `llama3.1-8b` (not `llama-3.3-70b` or `llama3.3-70b` — those return 404)
- `node_modules` patches will be lost on `npm install` — see re-patch instructions above
