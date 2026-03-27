import { Article, Category } from '../types';
import { NEWS_API_KEY, NEWS_API_BASE, NEWS_SEARCH_BASE } from '../constants/config';

// ── Raw API types ─────────────────────────────────────────────────────────────
interface RawArticle {
  article_id: string;
  title: string | null;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string | null;
  image_url: string | null;
  source_id: string;
  source_name: string | null;
  category: string[] | null;
  language: string;
  breaking_news?: 0 | 1;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: RawArticle[];
  nextPage?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deduplicateArticles(articles: Article[]): Article[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  return articles.filter((a) => {
    const titleKey = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (seenIds.has(a.id) || seenTitles.has(titleKey)) return false;
    seenIds.add(a.id);
    seenTitles.add(titleKey);
    return true;
  });
}

// ['Technology', 'Business'] → 'technology,business'  (API accepts CSV)
function toCategoryParam(categories: string[]): string | null {
  const valid = categories
    .filter((c) => c !== 'All')
    .map((c) => c.toLowerCase());
  return valid.length > 0 ? valid.join(',') : null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function trimToWords(text: string, limit = 45): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '\u2026';
}

function fallbackImage(id: string): string {
  const seed =
    id.split('').reduce((acc, c) => (acc + c.charCodeAt(0)) & 0xffff, 0) % 1000;
  return `https://picsum.photos/seed/${seed}/800/1200`;
}

// ── Transform ─────────────────────────────────────────────────────────────────

function toAppCategory(cats: string[] | null): Category {
  if (cats && cats.length > 0) return capitalize(cats[0]);
  return 'Other';
}

function transform(raw: RawArticle): Article | null {
  if (!raw.title) {
    console.log('[NewsAPI] filtered (no title):', raw.article_id);
    return null;
  }

  const rawDesc = raw.description || raw.content || '';
  const summary = trimToWords(stripHtml(rawDesc)) || 'Tap "Read Story" for full details.';

  return {
    id: raw.article_id || raw.link,
    title: stripHtml(raw.title).slice(0, 120),
    summary,
    category: toAppCategory(raw.category),
    imageUrl: raw.image_url || fallbackImage(raw.article_id),
    url: raw.link,
    source: raw.source_name || raw.source_id || 'Unknown',
    publishedAt: raw.pubDate || new Date().toISOString(),
    isBreaking: raw.breaking_news === 1 ? true : undefined,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export interface FetchNewsResult {
  articles: Article[];
  nextPage: string | undefined;
}

/**
 * Fetch news for one or more categories in a single API call.
 * categories: ['Technology', 'Business'] → ?category=technology,business
 */
export async function fetchNews(
  categories: string[],
  page?: string,
  signal?: AbortSignal,
  language = 'en',
): Promise<FetchNewsResult> {
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY,
    language,
    size: '10',
    image: '1',
  });

  const cat = toCategoryParam(categories);
  if (cat) params.set('category', cat);
  if (page) params.set('page', page);

  const url = `${NEWS_API_BASE}?${params}`;

  if (__DEV__) console.log('[NewsAPI] →', url);
  const t0 = Date.now();

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    console.error('[NewsAPI] ✗ Network error:', err);
    throw err;
  }

  const ms = Date.now() - t0;
  if (__DEV__) console.log(`[NewsAPI] ← ${response.status} ${response.statusText} (${ms}ms)`);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[NewsAPI] ✗ Error body:', body);
    throw new Error(`NewsData API error ${response.status}: ${response.statusText}`);
  }

  const data: NewsDataResponse = await response.json();

  if (data.status !== 'success') {
    console.error('[NewsAPI] ✗ API status:', data.status, data);
    throw new Error(`NewsData returned status: ${data.status}`);
  }

  if (__DEV__) console.log(`[NewsAPI] raw results received: ${data.results.length}`);

  const articles = deduplicateArticles(
    data.results.map(transform).filter((a): a is Article => a !== null),
  );

  if (__DEV__) console.log(
    `[NewsAPI] ✓ ${articles.length} kept, ${data.results.length - articles.length} dropped`,
    '| categories:', cat ?? 'all',
    data.nextPage ? `| nextPage: ${data.nextPage}` : '',
  );

  return { articles, nextPage: data.nextPage };
}

/**
 * Full-text search across all news. language is required.
 * endpoint: /api/1/news?q=query&language=en
 */
export async function searchNews(
  query: string,
  language: string,
  page?: string,
  signal?: AbortSignal,
): Promise<FetchNewsResult> {
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY,
    q: query,
    language,
    size: '10',
  });

  if (page) params.set('page', page);

  const url = `${NEWS_SEARCH_BASE}?${params}`;

  if (__DEV__) console.log('[SearchAPI] →', url);
  const t0 = Date.now();

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    console.error('[SearchAPI] ✗ Network error:', err);
    throw err;
  }

  const ms = Date.now() - t0;
  if (__DEV__) console.log(`[SearchAPI] ← ${response.status} (${ms}ms)`);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[SearchAPI] ✗ Error body:', body);
    throw new Error(`NewsData search error ${response.status}: ${response.statusText}`);
  }

  const data: NewsDataResponse = await response.json();

  if (data.status !== 'success') {
    throw new Error(`NewsData search returned status: ${data.status}`);
  }

  const articles = deduplicateArticles(
    data.results.map(transform).filter((a): a is Article => a !== null),
  );

  if (__DEV__) console.log(`[SearchAPI] ✓ ${articles.length} results for "${query}"`);

  return { articles, nextPage: data.nextPage };
}

/**
 * Fetch articles for a single keyword, filtered to the last 24 hours.
 * Used for keyword digest generation — returns [] on any error.
 */
export async function searchByKeyword(
  keyword: string,
  language = 'en',
  signal?: AbortSignal,
): Promise<Article[]> {
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY,
    q: keyword,
    language,
    size: '10',
  });

  const url = `${NEWS_SEARCH_BASE}?${params}`;
  if (__DEV__) console.log('[KeywordAPI] →', keyword);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    console.error('[KeywordAPI] ✗ Network error:', err);
    return [];
  }

  if (!response.ok) return [];

  let data: NewsDataResponse;
  try {
    data = await response.json();
  } catch {
    return [];
  }

  if (data.status !== 'success') return [];

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const articles = deduplicateArticles(
    data.results
      .map(transform)
      .filter((a): a is Article => a !== null)
      .filter((a) => new Date(a.publishedAt).getTime() >= cutoff),
  );

  if (__DEV__) console.log(`[KeywordAPI] ✓ ${articles.length} results for "${keyword}" in last 24h`);
  return articles;
}
