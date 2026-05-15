# KuryenteKo ⚡

> **"Alam mo ba kung tama ang iyong bill?"**
> KuryenteKo is a Filipino mobile app that empowers electricity consumers to understand, verify, and contest their monthly electric bills — powered by AI, grounded in ERC-official rates.

Built for the **UPM Socomsci Hackathon 2026** by Team KuryenteKo.

---

## The Problem

Millions of Filipino households — especially those using sub-meters in apartments and boarding houses — are overcharged every month without knowing it. The Energy Regulatory Commission (ERC) sets maximum allowable rates per kilowatt-hour, but these numbers are buried in official documents most consumers never read. KuryenteKo puts that protection in your pocket.

---

## Main Features

### 1. 📷 OCR Bill Scanner
Scan your Meralco bill using your phone's camera or gallery. The app uses AI-powered OCR to extract only the **billing figures** you need — total amount, kWh consumed, rate per kWh, and individual charge breakdowns.

- **Privacy-first**: Only numerical billing values are extracted. Names, account numbers, addresses, and other personal information are never read, stored, or transmitted.
- In-app live camera viewfinder with alignment guide and tap-to-focus
- Flash control (AUTO / ON / OFF)
- Photo preview with retake option before submitting
- All extracted fields are fully editable before analysis

### 2. ✏️ Manual Input
No bill photo? No problem. Enter your total amount, kWh consumed, and city manually. An optional advanced section accepts individual charge line items (Generation, Transmission, System Loss, Distribution, Taxes) for a more detailed breakdown.

### 3. 🔍 Bill Decoder
A charge-by-charge breakdown of your electricity bill with three-tier status indicators:

| Status | Meaning |
|--------|---------|
| ✅ Normal | Within ERC-approved limits |
| ⚠️ Mataas | Approaching ERC maximum |
| 🚨 Overcharged | Exceeds ERC legal rate |

Each charge row expands to show a plain-language Taglish explanation of what that charge is and why it may be high. When individual charges are not available, KuryenteKo generates an **estimated proportional breakdown** based on Meralco's standard distribution ratios — clearly labelled as estimates.

### 4. ⚖️ Verdict & Overcharge Analysis
The verdict screen gives a definitive judgment on your bill:

- **May Overcharge** — your rate-per-kWh exceeds the ERC legal maximum
- **Medyo Mataas** — your rate is within legal limits but approaching the ceiling
- **Normal** — your bill is within ERC-approved bounds

Displays the exact overcharge amount (in pesos), your effective rate vs. the ERC maximum, and contextual explanations of **why rates are high right now** — linking to real news sources covering issues like El Niño demand spikes, Malampaya gas supply decline, WESM spot price surges, and illegal sub-meter overcharging.

### 5. 📢 Call-to-Action Screens

**ERC Complaint Guide** — When an overcharge is detected, KuryenteKo generates a ready-to-send complaint letter pre-filled with the user's actual bill data:

- **Auto-generated complaint template** — populated with the user's city, billing amount, kWh consumption, effective rate-per-kWh, the calculated overcharge amount, and the specific ERC rule violated
- **Legal basis included** — every complaint cites the exact regulatory provision (e.g. *ERC Rule 16, Section 4 — Rate Overcharge*), giving the consumer a legally grounded basis for their complaint
- **Grounds for complaint** — clear list of actionable grounds: rate exceeding ERC maximum, system loss charge above the legal 8.5% cap, incorrect meter readings, unauthorized charges
- **4-step filing guide** — plain-language process from contacting Meralco first, preparing documents, filing with ERC Consumer Affairs (`consumer_affairs@erc.ph`), to following up within the 30-day ERC response deadline
- **One-tap contacts** — ERC hotline `(02) 8-9129935`, ERC email, Meralco hotline `16211`, and ERC website `erc.gov.ph` all tappable directly from the screen
- The complaint message is fully editable before submission

**DTI Sub-Meter Report** — If you're being overcharged through an illegal sub-meter setup (common in apartments and boarding houses), this screen guides you on how to report violations to the Department of Trade and Industry.

**Lifeline Rate Checker** — Automatically determines if your household qualifies for the Lifeline Rate subsidy (for consumers using 0–100 kWh/month), with full bracket table and application instructions.

### 6. 🗺️ Community Heat Map
An interactive map showing reported overcharge incidents across Philippine cities:

- Colored pins: 🟢 Fair rate / 🟡 Elevated / 🔴 Overcharged
- Your city is marked with a personal orange pin
- List view with pull-to-refresh and per-city report counts
- Powered by real community submissions to Supabase

### 7. 🤖 KoKo AI Chatbot
Ask **KoKo** — your personal electricity bill assistant — any question about your bill in Taglish:

- Context-aware: KoKo knows your current bill, rate, city, and overcharge status
- Grounded in 16 months of historical Meralco rate data (Jan 2025 – Apr 2026)
- Knows about key issues: El Niño, Malampaya gas supply, WESM spot prices, ERC rate decisions, illegal sub-meters, Lifeline Rate
- Links to credible news sources (Inquirer, BusinessWorld) for each topic
- Strict topic restriction: KoKo only answers electricity-related questions
- Quick prompt chips for common questions (3 random suggestions per session)
- Markdown rendering for formatted responses

### 8. 📋 Bill History
Every analyzed bill is saved locally per user account:

- Newest-first card view with date, city, total, kWh, and verdict badge
- Tap any past bill to re-view the full Verdict screen
- Long-press to delete individual records
- Isolated per account (anonymous or authenticated)

### 9. 🏠 Home Dashboard *(Phase 8 — Upcoming)*
A living financial health summary on the home screen:

- **Estimatong Bill Ngayong Buwan** — Projects your current month's bill based on the previous month's consumption or the average of your last 3 bills
- **Fairness Check** — Compares your most recent effective rate vs. the current ERC maximum in real time, color-coded red / amber / green
- **Kommunity Update** — Live count of verified overcharge reports and a top-5 most-overcharged cities bar chart, pulling real data from Supabase
- **Rate Tracking** — The app tracks ERC-approved rates month by month (currently Jan 2025 – Apr 2026) and surfaces changes in context

---

## Current ERC Rate Tracking

KuryenteKo tracks and compares against ERC-cleared Meralco rates. The following rates are currently built in:

| Component | ERC Maximum (April 2026) |
|-----------|--------------------------|
| Generation Charge | ₱8.3864 / kWh |
| Transmission Charge | ₱0.9500 / kWh |
| System Loss Charge | ₱0.7800 / kWh |
| Distribution Charge | ₱2.7600 / kWh (frozen since Aug 2022) |
| Supply Charge | ₱0.4500 / kWh |
| Metering Charge | ₱0.2500 / kWh |
| **Overall Residential Rate** | **₱14.3496 / kWh** |

Historical monthly rates from January 2025 to April 2026 are embedded in the app's AI context for trend analysis and chatbot responses.

---

## Demo Flow (Key Screens)

| Step | Screen | What It Shows |
|------|--------|---------------|
| 1 | Home | App entry point, KoKo mascot |
| 2 | OCR Scanner | Live camera viewfinder with alignment guide, tap-to-focus |
| 3 | Confirm Screen | All extracted fields editable before analysis |
| 4 | Bill Decoder | Charge breakdown, ✅⚠️🚨 status badges, expandable Taglish explanations |
| 5 | Verdict / Result | Overcharge amount in pesos, rate vs ERC maximum, news-linked issue cards |
| 6 | ERC Complaint | Auto-generated complaint template with legal basis, grounds, 4-step guide, tappable contacts |
| 7 | Community Heat Map | City-level overcharge pins + list view with per-city rates |
| 8 | KoKo AI Chat | Bill-context-aware AI response with cited news sources |
| 9 | Bill History | Personalized past bill cards, tap to re-view any verdict |
| 10 | Home Dashboard | (Phase 8) Estimated bill, Fairness Check, live Kommunity data |

> 📄 Full voiceover script with screen-by-screen directions: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

---

## Tech Stack

### Mobile Framework
| Tool | Version | Purpose |
|------|---------|---------|
| [Expo](https://expo.dev) | SDK 54 | Build toolchain, OTA updates, device APIs |
| [React Native](https://reactnative.dev) | 0.81.5 | Cross-platform mobile UI |
| [Expo Router](https://expo.github.io/router) | v4 | File-based navigation (Stack + Tabs) |
| [NativeWind](https://nativewind.dev) | v4 | Tailwind CSS utility classes for React Native |
| [TypeScript](https://typescriptlang.org) | 5.x | Type safety across all screens, services, and stores |

### State & Storage
| Tool | Purpose |
|------|---------|
| [Zustand](https://zustand-demo.pmnd.rs) | Global bill input and verdict state |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Per-user bill history (local, isolated by account) |
| [Supabase](https://supabase.com) | Auth, community heat map data, overcharge reports |

### AI & APIs
| Service | Model / API | Purpose |
|---------|-------------|---------|
| [OpenRouter](https://openrouter.ai) | `nvidia/nemotron-nano-12b-v2-vl:free` | Vision-language OCR — extracts billing figures from bill photos |
| [Cerebras](https://cloud.cerebras.ai) | `llama3.1-8b` | Ultra-fast KoKo AI chatbot inference (free tier) |

### Key Device APIs
| Library | Purpose |
|---------|---------|
| `expo-camera` | Live camera viewfinder, photo capture, flash control |
| `expo-image-picker` | Gallery photo selection |
| `react-native-maps` | Community heat map with OSM tile layer |
| `expo-web-browser` | In-app links to news sources from verdict screen |
| `react-native-safe-area-context` | Safe area handling across Android/iOS |

### UI Components
| Library | Purpose |
|---------|---------|
| `@expo-google-fonts/quicksand` | App-wide custom font (Quicksand 300–700) |
| `@expo/vector-icons` (FontAwesome 6) | Tab and UI icons |
| `react-hook-form` | Manual input form validation |

---

## Architecture

```
kuryenteko/
├── app/
│   ├── _layout.tsx          # Root stack + font loading + auth init
│   ├── index.tsx            # Home screen — entry points + dashboard (Phase 8)
│   ├── sign-in.tsx          # Email/password auth + anonymous skip
│   ├── scanner.tsx          # OCR flow: camera modal → confirm → analysis
│   ├── manual-input.tsx     # Manual bill entry form
│   ├── bill-decoder.tsx     # Charge breakdown with status badges
│   ├── verdict.tsx          # Overcharge verdict + action CTAs
│   ├── chat.tsx             # KoKo AI chatbot
│   ├── erc-complaint.tsx    # ERC complaint filing guide
│   ├── lifeline-checker.tsx # Lifeline rate eligibility checker
│   ├── dti-report.tsx       # DTI sub-meter abuse report guide
│   ├── history.tsx          # Per-user bill history
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar (Home, History, Map, Profile)
│       └── map.tsx          # Community heat map
├── services/
│   ├── ocrService.ts        # OCR abstraction (OpenRouter / Gemini / OpenAI)
│   └── billAnalysis.ts      # ERC rate comparison + verdict logic
├── store/
│   ├── billStore.ts         # Zustand: billInput + verdict
│   └── historyStore.ts      # AsyncStorage bill history per user
├── lib/
│   ├── constants.ts         # ERC rates (Apr 2026), charge labels/explanations
│   └── supabase.ts          # Supabase client
├── data/
│   └── electricity-context.json  # 16-month rate history + key issues + sources
└── types/
    ├── bill.ts              # BillInput, VerdictResult, LineItem, BillRecord
    └── rates.ts             # ERCRates interface
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android device or emulator (iOS supported but not primary target)

### Environment Variables
Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_OCR_PROVIDER=openrouter
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
EXPO_PUBLIC_CEREBRAS_API_KEY=csk-...
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Optional alternative OCR providers
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...

# Required for map on Android APK (not Expo Go)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### Run Locally
```bash
npm install --legacy-peer-deps
npx expo start --clear
```

> **Note:** The community heat map requires a Google Maps API key and a full EAS build — it does not work in Expo Go without the native Maps SDK.

### Build APK
```bash
eas build --platform android --profile preview
```

---

## Privacy

KuryenteKo is designed to be privacy-respecting by default:

- **OCR extraction** reads only the numerical billing fields (total amount, kWh, individual charges). The AI prompt explicitly instructs the model to ignore and not return personal information such as names, addresses, account numbers, or meter numbers.
- **Bill history** is stored locally on-device using AsyncStorage, keyed by user ID. No billing data is sent to any external server except the OCR API at scan time.
- **Authentication** is optional — users may skip sign-in and use an anonymous session. Auth is powered by Supabase with email confirmation disabled for the prototype.

---

## Team

Built by **Team KuryenteKo** for the UPM Socomsci Hackathon 2026.
University of the Philippines Manila — Social Sciences

---

## License

For hackathon demonstration purposes. All ERC rate data sourced from official Meralco rate schedules and ERC clearance orders.
