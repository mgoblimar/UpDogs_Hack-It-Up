// Tavily AI-native search — live Philippine electricity news
// Free tier: 1,000 searches/month — more than enough for a hackathon demo
// API key: get from app.tavily.com → add EXPO_PUBLIC_TAVILY_API_KEY to .env

const TAVILY_API_KEY = process.env.EXPO_PUBLIC_TAVILY_API_KEY ?? ''
const QUERY = 'Meralco ERC electricity rate hike Philippines 2026'
const NEWS_TTL_MS = 10 * 60 * 1000 // 10-minute in-memory cache per session

export interface NewsArticle {
  title: string
  content: string
  url: string
  publishedDate?: string
}

export interface NewsResult {
  articles: NewsArticle[]
  summary: string
}

// Module-level cache — survives re-renders, clears on app restart
let _cache: NewsResult | null = null
let _cachedAt: number | null = null

export async function fetchEnergyNews(): Promise<NewsResult> {
  if (!TAVILY_API_KEY) {
    return { articles: [], summary: '' }
  }

  // Return cache if still fresh
  if (_cache && _cachedAt && Date.now() - _cachedAt < NEWS_TTL_MS) {
    return _cache
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: QUERY,
      search_depth: 'basic',
      max_results: 3,
      include_answer: true,
      include_domains: [
        'inquirer.net',
        'bworldonline.com',
        'rappler.com',
        'philstar.com',
        'mb.com.ph',
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Tavily error ${response.status}`)
  }

  const json = await response.json()

  const result: NewsResult = {
    summary: json.answer ?? '',
    articles: (json.results ?? []).map((r: Record<string, unknown>) => ({
      title: r.title as string,
      content: r.content as string,
      url: r.url as string,
      publishedDate: r.published_date as string | undefined,
    })),
  }

  _cache = result
  _cachedAt = Date.now()
  return result
}

/** Build a compact news context string for injection into the AI system prompt */
export function buildNewsContext(news: NewsResult | null): string {
  if (!news || news.articles.length === 0) return ''

  const articleList = news.articles
    .map((a) => `- ${a.title}: ${a.content.slice(0, 200)}... (${a.url})`)
    .join('\n')

  return `PINAKABAGONG BALITA (live, ngayong araw):
${news.summary ? `Summary: ${news.summary}\n` : ''}
${articleList}`
}
