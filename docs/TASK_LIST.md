# Task List

> Hackathon build tasks broken into phases. Each phase has a demo checkpoint.
> Complete phases in order — you can demo after every phase ends.

**Project:** KuryenteKo  
**Last updated:** 2026-05-12 (Phase 0 + Phase 1 + Phase 2 complete)

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
- [x] Set up typed lib files: `supabase.ts`, `openai.ts`, `storage.ts`, `constants.ts`
- [x] Define all TypeScript types: `bill.ts`, `faq.ts`, `rates.ts`, `community.ts`
- [x] Create `data/defaultFAQ.json` — 15 Taglish offline fallback Q&As (Layer 3)
- [x] Hardcode ERC rate table in `lib/constants.ts`
- [x] TypeScript check passes — zero errors
- [ ] **TODO (manual):** Copy `.env.example` → `.env` and fill in API keys
- [ ] **TODO (manual):** Initialize Supabase project (free tier) and add keys to `.env`
- [ ] **TODO (manual):** Run Supabase schema migration
- [ ] **TODO (manual):** Seed Supabase with ERC rate data and 50 dummy heat map entries
- [ ] **TODO (manual):** Configure EAS Build (`eas.json`) with preview APK profile
- [ ] **TODO (manual):** Confirm app runs on physical Android device via Expo Go
- [-] Set up ESLint + Prettier — skipped for hackathon speed

---

## Phase 1: Input Screens ✅
**Goal:** User can enter bill data manually or via photo scan.  
**Demo checkpoint:** Manual input form fills, scan button opens camera.

### Manual Input (3-field form)

- [x] Build Home screen (`app/index.tsx`) — Scan vs Manual entry points, orange brand design
- [x] Build Manual Input screen (`app/manual-input.tsx`) with 3 fields:
  - Bill total amount (₱) with peso prefix
  - kWh consumed with kWh suffix
  - City/municipality inline dropdown (all 17 Metro Manila cities)
- [x] Add form validation via React Hook Form — all 3 fields required, numeric inputs
- [x] Add "I-CHECK NGAYON ⚡" CTA navigating to Bill Decoder
- [x] Zustand store (`store/billStore.ts`) — holds `billInput` and `verdict` globally

### Bill Scanner (OCR)

- [x] Install `expo-image-picker`, camera permissions configured in `app.json`
- [x] Build camera capture + gallery upload UI (`app/scanner.tsx`)
- [x] Send image as base64 to OpenAI GPT-4o Vision API (`services/ocrService.ts`)
- [x] Parse structured JSON response — extracts all Meralco line items
- [x] Build "Tama ba ito?" confirmation screen with editable extracted fields
- [x] Allow user to edit any incorrectly extracted field before proceeding
- [x] Loading state — "Binabasa ang bill mo..." with spinner
- [x] Error state — friendly Taglish message + fallback to manual input

### Also completed (not in original task list)

- [x] `services/billAnalysis.ts` — full overcharge detection logic vs ERC rates
- [x] `app/bill-decoder.tsx` — placeholder screen (Phase 2 target)
- [x] Root layout (`app/_layout.tsx`) — all screen headers + navigation config
- [x] `app/index.tsx` resets store on mount — clean state on each new check

---

## Phase 2: Bill Decoder + Verdict ✅
**Goal:** User sees their bill explained and gets a clear 🟢/🔴 verdict.  
**Demo checkpoint:** Input any bill → see decoded charges → see verdict with peso amount.

### Bill Decoder

- [x] Build Bill Decoder screen (`app/bill-decoder.tsx`) listing all charges
- [x] Map each charge to a plain Taglish explanation:
  - Generation Charge
  - Transmission Charge
  - System Loss Charge
  - Distribution Charge (includes metering + supply sub-items)
  - Subsidies
  - Universal Charges
  - FiT-All (Renewable)
  - Taxes (VAT)
- [x] Color code each line item: ✅ within limit / ⚠️ near limit / 🚨 over limit
- [x] Tap any charge card to expand Taglish explanation
- [x] Summary row: Total Bill / kWh / Rate per kWh

### Overcharge Detector

- [x] ERC-approved maximum rates in `lib/constants.ts` (May 2026)
- [x] Detection logic in `services/billAnalysis.ts` — compares per-kWh rate vs ERC max
- [x] Uses `ratePerKwh` directly from bill if OCR extracted it (more accurate)
- [x] Calculates exact peso overcharge amount
- [x] Verdict screen (`app/verdict.tsx`):
  - ✅ NORMAL — action tips + links to heat map and AI chat
  - ⚠️ MEDYO MATAAS — monitor next bill prompt
  - 🚨 NA-OVERCHARGE — exact overcharge amount + ERC complaint CTA

### Also completed

- [x] Updated OCR prompt — now extracts `ratePerKwh`, `universalCharges`, `fitAll`
- [x] Fixed `totalAmount` extraction — now grabs "Charges for this billing period" not "Total Amount Due"
- [x] Updated `types/bill.ts` — added `ratePerKwh`, `universalCharges`, `fitAll` fields
- [x] Updated scanner confirm screen — shows all new extracted fields
- [x] Page 1 of Meralco bill is sufficient for full analysis (no Page 2 needed)

---

## Phase 3: Killer Combination
**Goal:** Overcharged users see why + community proof + can ask AI.  
**Demo checkpoint:** 🔴 verdict → spike explainer → heat map → AI chatbot all working.

### Bill Spike Explainer

- [ ] Create `NationalRates` table in Supabase with DOE monthly data
- [ ] Seed with current month's data (El Niño, Malampaya status, coal prices)
- [ ] Build Spike Explainer screen showing national events linked to the spike
- [ ] Show percentage increase with plain Taglish explanation of each cause

### Community Heat Map

- [ ] Install `react-native-maps`
- [ ] Build Heat Map screen showing Metro Manila with colored markers per city
- [ ] Pull average bill per city from Supabase `CommunityReports` table
- [ ] Color scale: 🟢 low / 🟡 medium / 🔴 high average bills
- [ ] Show "X households sa inyong barangay ang nag-ulat ng mataas na bill"
- [ ] Add anonymous bill submission flow (city + kWh + amount, no PII)

### AI Chatbot (Taglish)

- [ ] Build Chat screen with message bubble UI
- [ ] Connect to OpenAI GPT-4o with system prompt in Taglish context:
  - ERC rulings, Philippine energy law (RA 9136 EPIRA), Meralco billing structure
  - Instructs model to always respond in natural Taglish
  - Includes user's current bill data as context
- [ ] Implement offline detection via `@react-native-community/netinfo`
- [ ] Build offline FAQ fallback:
  - Fetch latest FAQ from Supabase on app launch (when online)
  - Cache to `AsyncStorage` with timestamp
  - Serve cached FAQ when offline
  - Show "Huling na-update: [date]" timestamp
- [ ] Hardcode default FAQ (15 universal questions) as Layer 3 fallback

---

## Phase 4: Action Screens
**Goal:** User can generate complaint or apply for Lifeline from within the app.  
**Demo checkpoint:** One tap from verdict → complete pre-filled complaint letter.

### ERC Complaint Generator

- [ ] Build ERC Complaint screen with auto-filled fields from bill data:
  - Complainant name (optional input)
  - Bill amount, kWh, overcharge amount (auto-filled)
  - City (auto-filled)
  - Specific ERC rule being violated (auto-filled based on violation type)
- [ ] Generate complaint letter text in formal Filipino
- [ ] Add "I-COPY" button (copy to clipboard)
- [ ] Add "I-EMAIL" button (open mail client with pre-filled draft to ERC)
- [ ] Add direct link to ERC online complaint portal

### DTI Sub-Meter Report

- [ ] Build DTI Report screen for renters
- [ ] Guide user through sub-meter abuse check:
  - What rate is landlord charging per kWh?
  - What is current Meralco rate?
  - Calculate illegal markup amount
- [ ] Auto-fill DTI complaint letter
- [ ] Add DTI hotline link and walkthrough instructions

### Lifeline Rate Checker

- [ ] Build Lifeline screen with 3-question flow:
  1. Monthly consumption: 0–100 kWh or 101+ kWh?
  2. Is this your primary residence?
  3. Do you have other electricity connections?
- [ ] Show eligibility verdict with clear ✅ or ❌
- [ ] If eligible: auto-generate Lifeline Rate application letter
- [ ] Show list of required documents to submit to electric coop

---

## Phase 5: Polish + Offline
**Goal:** App feels production-ready, works offline, handles errors gracefully.  
**Demo checkpoint:** Disconnect WiFi → app still works for input + FAQ + verdict.

### Offline Support

- [ ] Sync ERC rate table to `AsyncStorage` on launch
- [ ] Sync monthly FAQ to `AsyncStorage` on launch
- [ ] Show offline banner when no internet detected
- [ ] Bill Decoder + Overcharge Detector work fully offline (cached rates)
- [ ] Heat map shows last cached data offline with "Nakalagay na data" notice

### Error States

- [ ] OCR failure → redirect to manual input with friendly message
- [ ] API timeout → show retry button, no crash
- [ ] Empty heat map data → show "Maging una sa inyong barangay!" prompt
- [ ] All forms have proper validation messages in Taglish

### UI Polish

- [ ] Consistent color system: primary yellow-orange, semantic 🟢🟡🔴
- [ ] Typography: large verdicts, readable body text on small screens
- [ ] All screens tested on 360px width (budget Android phones)
- [ ] Loading skeletons for all async data
- [ ] Haptic feedback on verdict reveal (Expo Haptics)
- [ ] App icon and splash screen

---

## Phase 6: Deploy + Demo Prep
**Goal:** Shareable APK link + demo script ready.

- [ ] Run `eas build --platform android --profile preview`
- [ ] Test APK on physical device (not Expo Go)
- [ ] Build simple Vercel landing page with:
  - App name + tagline
  - APK download link
  - Screen recording / screenshots
  - Pitch deck PDF link
- [ ] Prepare 3-minute demo script following the Aling Rosa narrative
- [ ] Seed heat map with realistic Metro Manila dummy data
- [ ] Prepare 3 sample Meralco bills for live OCR demo

---

## Backlog (Post-Hackathon)

- [ ] Bill history tracking (requires user accounts)
- [ ] Monthly bill forecast with weather/rate adjustments
- [ ] Appliance energy audit calculator
- [ ] Solar payback calculator
- [ ] Offline AI via `llama.rn` + Phi-3 Mini Q4 (optional download)
- [ ] Push notifications for mid-month bill alerts
- [ ] iOS build via EAS
- [ ] Support for VECO, CEPALCO, and other electric coops
- [ ] Admin CMS for monthly FAQ updates
- [ ] Automated DOE/ERC advisory ingestion

---

## Completed

<!-- ✅ Phase 0: Setup — completed 2026-05-12 (manual Supabase/EAS steps still pending) -->
<!-- ✅ Phase 1: Input Screens — completed 2026-05-12 -->
<!-- ✅ Phase 2: Bill Decoder + Verdict — completed 2026-05-12 -->
