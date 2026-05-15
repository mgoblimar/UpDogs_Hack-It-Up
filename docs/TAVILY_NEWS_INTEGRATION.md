# Tavily News Integration

## Problem

`electricity-context.json` is a static file — the news, rate reasons, and key issues inside it
were written at build time and never update. When a user gets their verdict, the "why is my
bill high" context could be weeks or months out of date.

## Solution

Use **Tavily** to fetch live news about ERC rates, Meralco price hikes, and electricity
issues in the Philippines at runtime — then inject that into the verdict screen and the
AI chat system prompt.

## What Tavily Is

An AI-native search API built for agents. One POST request returns clean article summaries,
titles, and URLs — no HTML parsing, no scraping logic needed. Free tier: 1,000 searches/month.

- Docs: https://docs.tavily.com
- Sign up: https://app.tavily.com

---

## Where It Fits

```
User scans / inputs bill
        ↓
analyzeBill() → verdict
        ↓
fetchEnergyNews() via Tavily       ← NEW
        ↓
Verdict screen — shows live "why is my bill high" context
        ↓
Chat screen — system prompt includes live news articles
```

---

## Files to Create / Modify

### New: `services/newsService.ts`

Handles the Tavily API call and returns clean results.

```ts
const TAVILY_API_KEY = process.env.EXPO_PUBLIC_TAVILY_API_KEY ?? ''

export interface NewsArticle {
  title: string
  content: string
  url: string
  publishedDate?: string
}

export interface NewsResult {
  articles: NewsArticle[]
  summary: string  // Tavily's auto-generated answer
}

export async function fetchEnergyNews(): Promise<NewsResult> {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: 'Meralco ERC electricity rate hike Philippines 2026',
      search_depth: 'basic',
      max_results: 3,
      include_answer: true,
    }),
  })

  const json = await response.json()

  return {
    summary: json.answer ?? '',
    articles: (json.results ?? []).map((r: any) => ({
      title: r.title,
      content: r.content,
      url: r.url,
      publishedDate: r.published_date,
    })),
  }
}
```

---

### Modify: `app/verdict.tsx`

Fetch news on mount and display a "Why is my bill high right now?" section below the verdict.

```ts
const [news, setNews] = useState<NewsResult | null>(null)

useEffect(() => {
  fetchEnergyNews().then(setNews).catch(() => null)
}, [])

// In the JSX — show summary + article links
{news && (
  <View>
    <Text>Bakit mataas ang kuryente ngayon?</Text>
    <Text>{news.summary}</Text>
    {news.articles.map((a) => (
      <TouchableOpacity key={a.url} onPress={() => Linking.openURL(a.url)}>
        <Text>{a.title}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}
```

---

### Modify: `app/chat.tsx` — `buildSystemPrompt()`

Inject live news into the system prompt so the AI answers with current context.

```ts
function buildNewsContext(news: NewsResult | null): string {
  if (!news || news.articles.length === 0) return ''

  const articleList = news.articles
    .map((a) => `- ${a.title}: ${a.content.slice(0, 200)}... (${a.url})`)
    .join('\n')

  return `PINAKABAGONG BALITA (live):
${news.summary}

${articleList}`
}
```

Then add `buildNewsContext(news)` inside `buildSystemPrompt()` alongside the existing
`buildRateHistory()` and `buildKeyIssues()` calls.

---

## Environment Variable

Add to `.env` and `.env.example`:

```
EXPO_PUBLIC_TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx
```

---

## What This Improves

| Before | After |
|---|---|
| Rate reasons from static JSON (stale) | Live articles from the web |
| AI cites old sources | AI cites current news with real URLs |
| Verdict has no "why now" context | Verdict shows today's reason for price hike |
| Sources section uses hardcoded URLs | Sources section uses real, fresh articles |

---

## Limitations

- Tavily free tier: 1,000 searches/month — enough for a hackathon demo
- Adds ~1-2 seconds to verdict load time (fetch is async, can show skeleton)
- Requires internet connection (same as the rest of the app)
- Philippine-specific news coverage depends on Tavily's index — may need query tuning
