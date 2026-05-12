# Product Requirements Document

**Project:** KuryenteKo — AI-Powered Energy Equity Platform  
**Version:** 1.0  
**Date:** 2026-05-12  
**Status:** Draft

---

## Problem Statement

**Problem:** Filipino consumers are systemically overcharged on electricity due to deliberately complex billing structures, predatory sub-metering by landlords, and a total lack of accessible tools to verify, dispute, or understand their bills.

**Affected users:** 27.7 million Filipino households — particularly urban poor, renters, and informal settlers in Metro Manila and surrounding provinces.

**Current situation:** Consumers either pay without question, rant on Facebook with no data, or navigate the ERC website (English, complex, inaccessible) to find rate tables they cannot interpret.

**Impact:** Low- to middle-income households spend up to 30% of monthly income on electricity alone. The Philippines has the 2nd highest electricity rate in Southeast Asia (₱14.35/kWh as of 2026), nearly double Thailand's rate — despite Filipino wages being a fraction of comparable economies.

---

## Goals

### Product Goals

1. Any Filipino can determine within 60 seconds whether their electricity bill is fair — using only their phone, with no account required.
2. Users who are overcharged have a clear, friction-free path to file an official ERC complaint without navigating government websites.
3. Households eligible for the Lifeline Rate subsidy are identified and guided to apply — targeting the estimated 4.2 million eligible households currently not enrolled.

### Non-Goals

- We are not building a full bill payment platform in v1.
- We are not integrating directly with Meralco's internal systems via official API.
- We are not supporting electric cooperative bills outside Metro Manila in v1 (Meralco-first).
- We are not building a web version in v1 — mobile app only.
- We are not requiring user accounts for core bill checking features.

---

## Users

### Personas

| Persona | Description | Primary Goal |
|---------|-------------|-------------|
| Nanay Rosa | Urban poor household head, Tondo. Uses a cheap Android phone. Low digital literacy. | "Tama ba ang bill ko o niloloko ba ako?" |
| Student Boarder | Renter in QC boarding house. Suspects landlord overcharging on sub-metering. | Prove illegal rate and report to DTI. |
| Middle-Class Renter | Mid-income household in Caloocan. Bill doubled this summer, doesn't know why. | Understand why bill spiked and what to do. |
| Sari-Sari Owner | Small business in Pasig. Bills eating into margins. No time for research. | Quick answer on whether he's being robbed. |
| Senior Citizen | Retired, lives alone in Marikina. Entitled to discounts she doesn't know exist. | Find and apply for available subsidies. |

### User Journey

```
Open App (no login required)
    ↓
Choose: 📷 Scan Bill  OR  ✏️ Manual Input (3 fields)
    ↓
Bill Decoded in Plain Taglish
(each charge explained in one sentence)
    ↓
    ├── 🟢 NORMAL
    │     ↓
    │   One saving tip for next month
    │     ↓
    │   Heat Map — sino pa ang sobrang bayad sa area mo
    │
    └── 🔴 OVERCHARGED
          ↓
        "Sobrang siningil ka ng ₱XXX"
          ↓
        Killer Combo:
        📊 Bakit tumaas? (Bill Spike — El Niño, Malampaya, etc.)
        🗺️ Heat Map — hindi ka nag-iisa
        🤖 AI Chat — tanungin sa Taglish
          ↓
        Aksyon:
        ├── 📋 ERC Complaint (auto-filled, 1 tap)
        ├── 🏠 DTI Report (sub-meter abuse)
        └── 💚 Lifeline Rate Application
```

---

## Features

### MVP (Must Have — Hackathon Build)

| # | Feature | Description | Acceptance Criteria |
|---|---------|-------------|-------------------|
| F1 | Bill Scanner | Camera captures Meralco bill photo → OCR via GPT-4o Vision extracts all line items automatically | Photo → auto-filled fields in under 10 seconds; user confirms before proceeding |
| F2 | Manual Input | 3-field fallback (bill amount, kWh, city) for users who prefer typing | Any user can complete input in under 30 seconds |
| F3 | Bill Decoder | Each charge explained in plain Taglish — one sentence per line item, color coded 🟢🟡🔴 | Non-technical user understands every charge without external help |
| F4 | Overcharge Detector | Compares user's per-kWh rate against ERC-approved maximums; shows exact overcharge in pesos | Accurate to ±₱5 based on hardcoded ERC rate table |
| F5 | Bill Spike Explainer | Links bill increase to national energy events (El Niño, Malampaya, coal prices) via DOE data | Shows at least one verified reason for any spike > 10% |
| F6 | Community Heat Map | Crowd-sourced map of Metro Manila showing average bills by barangay/city | Renders with dummy seed data; updates when users submit bills |
| F7 | AI Chatbot (Taglish) | OpenAI-powered assistant answering energy questions in Taglish; offline FAQ fallback | Responds in Taglish; falls back to cached FAQ when offline |
| F8 | ERC Complaint Generator | Auto-fills complaint letter with user's bill data; one tap to generate PDF or email draft | Produces complete, legally-worded complaint with correct ERC references |
| F9 | Lifeline Rate Checker | 3-question flow to determine eligibility; generates application letter if eligible | Correctly identifies eligibility per ERC lifeline criteria |
| F10 | DTI Sub-Meter Report | Guides renters through sub-meter abuse report; auto-fills DTI complaint form | Produces complete DTI complaint draft |

### V2 (Should Have — Post-Hackathon)

| # | Feature | Description | Rationale |
|---|---------|-------------|-----------|
| F11 | Bill History Tracking | Save and compare multiple months of bills | Requires account — deferred to keep v1 accountless |
| F12 | Bill Forecast | Predict next month's bill based on consumption history + DOE rate adjustments | Needs 3+ months of data to be accurate |
| F13 | Appliance Energy Audit | Input appliances → see which is eating the bill, swap suggestions with peso savings | High build time, low hackathon ROI |
| F14 | Solar Payback Calculator | Monthly bill + roof size → solar panel ROI calculation | Good post-hackathon feature |
| F15 | Offline AI (llama.rn) | On-device quantized LLM for full offline AI chat | Requires bare workflow; low-end phone performance risk |

### Future (Nice to Have)

| # | Feature | Description |
|---|---------|-------------|
| F16 | Push Notifications | Mid-month alert when projected bill exceeds budget |
| F17 | Community Leaderboard | Cities/barangays ranked by average bill that month |
| F18 | ERC Complaint Tracker | Track status of submitted complaints |
| F19 | Multi-utility Support | Extend to VECO, CEPALCO, and other electric coops |

---

## User Stories

### Story 1: Bill is overcharged

As **Nanay Rosa**, I want to scan my Meralco bill and find out if I'm being overcharged, so that I can decide whether to file a complaint.

**Acceptance criteria:**
- [ ] Given I open the app, when I tap "I-scan ang Bill" and take a photo, then the app extracts my bill data within 10 seconds.
- [ ] Given my extracted data, when the app analyzes my rate, then it shows a clear 🔴 verdict with the exact peso amount overcharged.
- [ ] Given I am overcharged, when I tap "Magreklamo sa ERC," then a pre-filled complaint letter is generated using my actual bill data.
- [ ] Given I am offline, when I open the app, then I can still input manually and receive a verdict based on cached ERC rates.

### Story 2: Lifeline Rate eligibility

As a **senior citizen**, I want to find out if I qualify for a discounted electricity rate, so that I can lower my monthly bill.

**Acceptance criteria:**
- [ ] Given I answer 3 questions about my kWh usage, residency, and connections, then the app tells me definitively if I qualify.
- [ ] Given I qualify, when I tap "Mag-apply," then an application letter is generated that I can print or send to my electric coop.

### Story 3: Bill spike explained

As a **middle-class renter**, I want to know why my bill doubled this month, so that I can understand if it's my fault or the grid's.

**Acceptance criteria:**
- [ ] Given my bill shows a spike > 10%, then the app shows at least one verified national energy event linked to the increase.
- [ ] Given the heat map loads, then I can see if my barangay/city is showing similar spikes to others.

---

## Requirements

### Functional

- [ ] App works without user registration for all core features (F1–F10)
- [ ] Bill scanning must work with photos taken in normal indoor lighting
- [ ] All user-facing text must be in Taglish (Filipino + English mix)
- [ ] Offline mode must surface last-cached FAQ and hardcoded ERC rates
- [ ] ERC rate table must be updated in Supabase; app syncs on each launch when online
- [ ] Community heat map data must be anonymized — no PII stored with bill submissions

### Non-Functional

| Requirement | Target |
|-------------|--------|
| OCR extraction time | < 10 seconds per photo |
| AI chatbot response time (online) | < 3 seconds |
| Offline FAQ response time | < 500ms |
| App launch time (cold start) | < 3 seconds on mid-range Android |
| APK size | < 80MB |
| Min Android version | Android 8.0 (API 26) |
| Min iOS version | iOS 14 |

### Security & Compliance

- [ ] No PII stored without explicit user consent
- [ ] Bill photos processed via OpenAI API — not stored server-side after extraction
- [ ] Community heat map submissions are anonymous (city/barangay only, no address)
- [ ] Supabase RLS (Row Level Security) enabled on all tables
- [ ] API keys stored in environment variables, never in source code

---

## Out of Scope

- Direct API integration with Meralco's billing systems
- Real-time electricity usage monitoring (requires smart meter hardware)
- Payment processing of any kind
- Web browser version (v1 is mobile app only)
- Support for electric cooperatives outside Meralco franchise area (v1)

---

## Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|---------|--------|-------------|
| Bill check completions | 0 | 50 during hackathon demo | Manual count |
| Overcharge detection accuracy | — | ±₱5 vs manual calculation | QA test with 10 sample bills |
| OCR extraction success rate | — | > 85% on clear photos | Test set of 20 Meralco bill photos |
| Complaint letter generation | — | < 30 seconds end-to-end | Manual timing |
| Offline FAQ availability | — | 100% when no internet | Network disconnect test |

---

## Dependencies

| Dependency | Type | Purpose | Status |
|------------|------|---------|--------|
| OpenAI GPT-4o Vision API | External | Bill OCR + AI chatbot | API key needed |
| Supabase | External | Database + storage | Free tier |
| ERC Rate Tables | Data | Overcharge detection baseline | Publicly available, manually encoded |
| DOE Energy Advisories | Data | Bill spike explanations | Manually curated per month |
| Expo EAS Build | External | APK generation | Free tier |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| OCR fails on blurry/glare photos | High | High | Manual input fallback always available |
| OpenAI API rate limit during demo | Medium | High | Cache last response; offline FAQ fallback |
| ERC rate table out of date | Low | Medium | Manual monthly update by team; timestamp shown to user |
| Low-end phone performance | High | Medium | Test on Redmi/Cherry Mobile; optimize bundle size |
| Heat map has no data at launch | High | Low | Seed with 50 anonymized dummy entries per city |

---

## Timeline (Hackathon)

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| Phase 0: Setup | Hour 1–2 | Expo project running, Supabase connected, navigation scaffolded |
| Phase 1: Input + Decoder | Hour 3–5 | Manual input + bill decoder screen working |
| Phase 2: Overcharge + Verdict | Hour 6–8 | Overcharge logic + 🟢🔴 verdict screen |
| Phase 3: Killer Combo | Hour 9–12 | Bill spike + heat map + AI chatbot |
| Phase 4: Actions | Hour 13–15 | ERC complaint + Lifeline + DTI screens |
| Phase 5: Bill Scanner | Hour 16–18 | Camera OCR via GPT-4o Vision |
| Phase 6: Polish | Hour 19–22 | Taglish copy, mobile UI polish, offline fallback |
| Phase 7: Deploy | Hour 23–24 | EAS APK build + demo prep |

---

## Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | What is the exact current ERC-approved maximum generation rate for residential? | Team | Open |
| 2 | Does the offline FAQ need admin CMS or direct Supabase edits? | Team | Open |
| 3 | Should bill photos be stored for model improvement, or discarded after extraction? | Team | Open |
| 4 | Will the hackathon have reliable WiFi for the OpenAI API calls during demo? | Team | Open |
