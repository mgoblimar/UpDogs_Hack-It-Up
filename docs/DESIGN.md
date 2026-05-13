# KuryenteKo — Design System

## Visual Direction

**Style:** Friendly Utility / Civic Tech  
**Mood:** Warm and approachable — empowering, not alarming  
**References:** `assets/KuryenteKo/brandboard.png`, `assets/KuryenteKo/homepage.png`

---

## Color System

```ts
// constants/theme.ts — used across all screens
export const Colors = {
  // Backgrounds
  bg:        '#F8F8F8',   // Page background (cream-white)
  surface:   '#FFFFFF',   // Cards, panels
  navy:      '#1C2B3A',   // Primary dark — headers, CTA buttons, dark cards
  navyDark:  '#162330',   // Deeper variant

  // Brand
  yellow:    '#F5C518',   // Primary accent — KuryenteKo yellow
  yellowDark:'#D4A800',   // Pressed / darker yellow

  // Text
  textPrimary: '#1C2B3A',
  textMuted:   '#6B7280',
  textSubtle:  '#9CA3AF',

  // Semantic
  success:   '#059669',   // Normal bill status
  successBg: '#D1FAE5',
  warning:   '#D97706',   // High bill status
  warningBg: '#FEF9C3',
  error:     '#DC2626',   // Overcharge status
  errorBg:   '#FFF0F0',

  // Stat card backgrounds
  statGreen: '#D4EDDA',   // Bills verified card
  statRed:   '#FFD6D6',   // Overcharge stat card

  // Borders
  border:    '#E5E7EB',
  borderStrong: '#D1D5DB',
}
```

---

## Typography

**Fonts (from brandboard):**
- **Display / Headings:** `Greenth` (logo only) — not in body
- **Body / UI:** `Quicksand` (target), `System` (current fallback)

```ts
export const FontSize = {
  xs:   12,
  sm:   13,
  base: 14,
  md:   15,
  lg:   16,
  xl:   18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  hero:  44,
}

export const FontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  extrabold:'800',
  black:   '900',
}
```

---

## Spacing & Layout

React Native uses dp (density-independent pixels), not rem.

```ts
export const Space = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
}

export const Radius = {
  sm:   8,
  md:   12,
  lg:   14,
  xl:   20,
  full: 9999,
}

// Screen horizontal padding: 20dp
// Card inner padding: 16–24dp
```

---

## Component Inventory

| Component | File | Status | Notes |
|---|---|---|---|
| AppHeader | `components/AppHeader.tsx` | ✅ Done | Navy bar, KuryenteKo wordmark, hamburger/back, bell |
| KoKoSpeechBubble | `components/KoKoSpeechBubble.tsx` | ✅ Done | 🦉 owl + yellow speech bubble. Props: `message`, `size` |
| StatusBadge | `components/StatusBadge.tsx` | ✅ Done | Colored pill — Mataas / Lampas 8.5% / Normal. Exports `STATUS_MAP` |
| ChargeRow | `components/ChargeRow.tsx` | ✅ Done | Bill decoder list row — icon + label + amount + badge + expandable panel |
| ExplanationRow | `components/ExplanationRow.tsx` | ✅ Done | Verdict explanation row — icon + title with trend arrow + description |
| AIGeneratedBanner | `components/AIGeneratedBanner.tsx` | ✅ Done | Yellow left-border "Auto-generated ng AI" card |
| PrimaryButton | `components/Buttons.tsx` | ✅ Done | Full-width navy pill button |
| YellowButton | `components/Buttons.tsx` | ✅ Done | Full-width yellow accent pill button |
| OutlineButton | `components/Buttons.tsx` | ✅ Done | Full-width bordered outline pill button |
| ChatBubble | inline in `chat.tsx` | 🟡 Inline | KoKo avatar (left) / User avatar (right) variants |
| ScanManualToggle | inline in `scanner.tsx` | 🟡 Inline | Pill tab toggle (Photo Scan / Manual Input) |
| DashedUploadZone | inline in `scanner.tsx` | 🟡 Inline | Yellow dashed border upload box |
| FormInput / FieldLabel | inline in `manual-input.tsx` | 🟡 Inline | White rounded input + label with hint badge |
| InfoRow | inline in `erc-complaint.tsx` | 🟡 Inline | Label + value row with divider |
| BottomTabBar | not built | ⚪ Pending | 4-icon tab nav (Home / Map / Shield / Profile) |
| FairnessGauge | emoji placeholder `⚖️` | ⚪ Pending | Semicircle gauge showing bill fairness |
| LiveOverchargeChart | not built | ⚪ Pending | Bar chart with Mataas/Katamtaman/Karaniwan legend |

---

## Screen Map

| Screen | File | Source Asset |
|---|---|---|
| Sign In | `app/sign-in.tsx` | — |
| Home / Dashboard | `app/index.tsx` | `homepage.png`, `dashboard (2-4).png` |
| Check Bill (Scan tab) | `app/scanner.tsx` | `checkbill-scanner.png` |
| Check Bill (Manual tab) | `app/scanner.tsx` | `checkbill-manual.png` |
| Bill Decoder | `app/bill-decoder.tsx` | `decoder.png`, `decoder (2).png` |
| Resulta | `app/verdict.tsx` | `decoder (3).png`, `decoder (4).png` |
| ERC Complaint | `app/erc-complaint.tsx` | `complaint.png` |
| Chat (KoKo AI) | `app/chat.tsx` | `chatbot.png` |
| Heat Map | `app/heat-map.tsx` | `heat map.png` |

---

## Design Principles

1. **Navy + Yellow only** — All primary actions use navy `#1C2B3A` (dark CTA) or yellow `#F5C518` (accent CTA). Never use orange.
2. **KoKo is always present** — The owl mascot appears on every data-entry screen as a trust signal.
3. **Status colors are semantic** — Red = overcharge, Yellow/Orange = high, Green = normal. Never use these colors decoratively.
4. **Pill buttons for primary CTAs** — Full-width, `borderRadius: 9999`, uppercase label with `letterSpacing: 1`.
5. **White cards on cream background** — `surface: #fff` on `bg: #F8F8F8`. Shadow: `shadowOpacity: 0.06`.

---

## Accessibility

- Minimum contrast 4.5:1 for all text on white/cream backgrounds
- Yellow `#F5C518` on white fails WCAG AA — always pair with navy text `#1C2B3A` on yellow
- All TouchableOpacity elements use `hitSlop` for 44dp minimum touch target
- `activeOpacity: 0.85` on all buttons

---

## Design Files

| Asset | Location |
|---|---|
| All mockups | `assets/KuryenteKo/` |
| Brandboard | `assets/KuryenteKo/brandboard.png` |
| User flow | `assets/KuryenteKo/UserFlow.png` |
| Logo SVG | `assets/KuryenteKo/KuryenteKo.svg` |
| Icon set | Emoji (current) → Lucide or Phosphor (planned) |
