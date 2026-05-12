# Tech Stack

> Why each technology was chosen, not just what it is.

**Last updated:** 2026-05-12

---

## Core Stack

### Language

| | |
|--|--|
| **Language** | TypeScript 5.x |
| **Why** | Type safety across the entire app — bill data structures, API responses, and navigation params are all typed. Catches bugs before runtime, especially important for financial data comparisons. |
| **Alternatives considered** | Plain JavaScript — rejected: no type safety on bill parsing logic where a wrong type causes wrong peso amounts shown to users |

### Runtime

| | |
|--|--|
| **Runtime** | Node.js 20 LTS (dev tooling) / Hermes (on-device JS engine via Expo) |
| **Why** | Hermes is the recommended JS engine for React Native — faster startup, lower memory, better for budget Android devices that are KuryenteKo's primary target |
| **Alternatives considered** | JavaScriptCore — default but slower cold start than Hermes on Android |

### Framework

| | |
|--|--|
| **Framework** | Expo SDK 51 (React Native) |
| **Why** | Mobile-first is the primary target — camera access, native feel, installable APK. Expo reduces React Native setup time from days to hours, critical for a hackathon. EAS Build generates a shareable APK link without Play Store. Expo Go enables instant testing via QR code during development. |
| **Alternatives considered** | Bare React Native — more control but days of setup; Next.js PWA — web-first, camera API is limited in browsers, wrong fit for masa users on cheap Android phones |

---

## Frontend (Mobile)

### UI Styling

| Library | Version | Purpose | Why Chosen |
|---------|---------|---------|-----------|
| NativeWind | 4.x | Tailwind CSS syntax for React Native | Same mental model as Tailwind — fast to build responsive layouts, familiar to web developers on the team |
| React Native core components | — | Base View, Text, TextInput, etc. | Foundation; NativeWind extends these |
| Expo Haptics | — | Haptic feedback on verdict reveal | Small UX detail that makes the 🔴 verdict feel impactful on native |

### Navigation

| | |
|--|--|
| **Library** | Expo Router 3.x |
| **Why** | File-based routing (like Next.js App Router) — each screen is a file, deep linking works out of the box, type-safe routes. The team already knows file-based routing from web work. |
| **Alternatives considered** | React Navigation (stack/tab navigator) — more manual setup, no file-based convention |

### State Management

| Library | Purpose | Why Chosen |
|---------|---------|-----------|
| Zustand | Global client state (bill data, user session flags) | Minimal boilerplate, no Provider hell, works well with React Native |
| React Hook Form | Form state (manual input, complaint forms) | Uncontrolled inputs, minimal re-renders, built-in validation |
| AsyncStorage | Persistent local cache (ERC rates, FAQ, last bill) | Official Expo-supported persistent storage, works fully offline |

### Charts & Maps

| Library | Purpose | Why Chosen |
|---------|---------|-----------|
| Victory Native | Bill history chart, spike comparison chart | React Native compatible, declarative, works with Expo managed workflow |
| react-native-maps | Community heat map | Best-maintained maps library for React Native; supports Google Maps on Android |

---

## Backend & Data

### Database

| | |
|--|--|
| **Database** | PostgreSQL (via Supabase) |
| **Why** | Supabase replaces an entire Express/Node backend for this app — it provides the DB, auto-generated REST API, Row Level Security, and real-time subscriptions all in one. Free tier is sufficient for hackathon + early launch. |
| **Host** | Supabase (free tier) |
| **Alternatives considered** | Firebase Firestore — NoSQL is wrong fit for relational bill data with rate comparisons; Railway + bare PostgreSQL — more setup for the same result |

### API Client

| | |
|--|--|
| **Client** | Supabase JS SDK (`@supabase/supabase-js`) |
| **Why** | Auto-generated TypeScript types from schema, built-in auth if added later, RLS enforced automatically |

### AI / OCR

| Service | Purpose | Why Chosen |
|---------|---------|-----------|
| OpenAI GPT-4o Vision | Bill photo OCR + structured JSON extraction | Best-in-class vision model for document extraction; returns structured JSON with a single prompt; understands Meralco bill layout without fine-tuning |
| OpenAI GPT-4o | Taglish AI chatbot | Multilingual, understands Filipino context, can be prompted to respond in Taglish naturally |
| OpenAI API | Both above via single API key | One integration, one bill |

**Why not Tesseract.js:**  
Tesseract is a raw text extractor — it returns a wall of text from a photo. Parsing that wall into structured Meralco line items (generation charge, system loss, etc.) requires a complex custom parser that breaks on any layout variation. GPT-4o Vision extracts structured data directly from the image in one step, handles glare, rotation, and layout differences automatically.

---

## Offline Support

| Tool | Purpose | Why Chosen |
|------|---------|-----------|
| `@react-native-async-storage/async-storage` | Cache ERC rates, FAQ, last heat map data | Official React Native persistent storage; works fully offline; no setup |
| `@react-native-community/netinfo` | Detect online/offline status | Triggers fallback to cached data when no internet; lightweight |
| Hardcoded default FAQ (JSON) | Layer 3 offline fallback | Zero dependency — built into the APK; covers 15 universal questions that never change |

**Offline FAQ sync strategy:**
```
App launch + online  →  Fetch latest FAQ from Supabase  →  Cache to AsyncStorage
App launch + offline →  Read from AsyncStorage cache
First launch + offline (no cache)  →  Use hardcoded default FAQ JSON
```

---

## Infrastructure

| Concern | Tool | Why |
|---------|------|-----|
| Mobile app deployment | Expo EAS Build | Generates shareable APK download link without Play Store; free tier builds; judges install via direct link |
| Landing page / web | Vercel | Static site with APK download link and screenshots; free, instant deploy |
| CI (optional) | GitHub Actions | Lint + TypeScript check on push; lightweight, free |
| Environment secrets | EAS Secrets + `.env` | API keys stored in EAS Build environment, never in source code |

---

## Testing

| Tool | Purpose |
|------|---------|
| Jest + `@testing-library/react-native` | Unit tests for bill calculation logic and overcharge detection |
| Expo Go | Visual/manual testing during development (QR code scan) |
| Physical Android device | Final validation — test on budget phone (Redmi/Cherry Mobile) |
| Manual OCR test set | 20 sample Meralco bill photos to validate extraction accuracy |

---

## Dev Tooling

| Tool | Purpose |
|------|---------|
| pnpm | Package manager — faster installs |
| ESLint + `eslint-config-expo` | Linting with Expo-specific rules |
| Prettier | Formatting |
| TypeScript strict mode | Catch type errors in bill parsing and API response handling |

---

## Key Version Constraints

| Package | Version | Note |
|---------|---------|------|
| Expo SDK | 51+ | Required for Expo Router 3 |
| React Native | 0.74 | Bundled with Expo SDK 51 |
| Node.js | 20 LTS | Minimum for Expo SDK 51 tooling |
| Android | API 26+ (Android 8.0) | Minimum for Expo SDK 51 |
| iOS | 14+ | Minimum for Expo SDK 51 |

---

## What We're Deliberately NOT Using

| Tool | Reason Skipped |
|------|---------------|
| Redux / Redux Toolkit | Overkill for this app's state complexity; Zustand is sufficient |
| Prisma / Drizzle ORM | Not needed — Supabase SDK handles all queries |
| Express / Fastify backend | Supabase replaces it entirely |
| Tesseract.js | See AI/OCR section above |
| llama.rn (offline LLM) | Post-hackathon feature — too risky for low-end device performance |
| React Native Paper / RN Elements | NativeWind gives more design control without opinionated components |
